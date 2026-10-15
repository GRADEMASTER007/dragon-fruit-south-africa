import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { database, rows, transaction } from "./database";
import { verifiedGuestHash } from "./cart";
import { sessionUser } from "./auth";
import { gatewayCredentials, type Gateway } from "./payment-settings";
import { hostedCheckout } from "./payment-providers";
import { json } from "./http";
import { lineSchema } from "../lib/store-api";

const checkoutSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    gateway: z.enum(["payfast", "yoco", "paypal"]),
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(5).max(60),
    country: z.literal("South Africa"),
    shipping_method: z.literal("pickup"),
    notes: z.string().trim().max(5000).default(""),
    origin: z.string().url().max(300),
    items: z.array(lineSchema).min(1).max(150),
  })
  .strict();

export async function availableGateways() {
  const settings = await rows<RowDataPacket>(
    "SELECT gateway, enabled, mode, validation_status, configuration_fingerprint FROM gateway_settings WHERE enabled = TRUE",
  );
  return settings
    .filter((record) => {
      const gateway = record.gateway as Gateway;
      const config = gatewayCredentials(gateway);
      return (
        gateway === "yoco" &&
        config.configured &&
        config.mode === "test" &&
        record.mode === "test" &&
        record.configuration_fingerprint === config.fingerprint &&
        record.validation_status === "configured_for_sandbox"
      );
    })
    .map((record) => ({
      gateway: String(record.gateway),
      mode: "test",
      label: `${String(record.gateway).toUpperCase()} sandbox — no real payment`,
    }));
}

export async function createCheckout(request: Request, input: unknown) {
  const data = checkoutSchema.parse(input);
  if (
    request.headers.get("x-dfsa-origin") !== data.origin ||
    new URL(data.origin).origin !== data.origin ||
    !data.origin.startsWith("https://")
  )
    throw new Error("Checkout must start from this site's HTTPS page.");
  const guest = await verifiedGuestHash(request);
  if (!guest)
    return json(
      { error: "Load and save your cart before starting checkout. Cookies must be enabled." },
      401,
    );
  const gateways = await availableGateways();
  if (!gateways.some((gateway) => gateway.gateway === data.gateway))
    return json(
      {
        error:
          "This gateway is not enabled for verified sandbox setup. Online payment is unavailable; request a quotation instead.",
      },
      409,
    );
  if (new Set(data.items.map((line) => line.sku)).size !== data.items.length)
    throw new Error("Duplicate checkout lines.");
  const config = gatewayCredentials(data.gateway);
  const requestHash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  const user = await sessionUser(request);
  let orderId = "";
  let paymentId = "";
  let reservationReady = true;
  await transaction(async (connection) => {
    await connection.execute(
      "SELECT token_hash FROM guest_sessions WHERE token_hash = ? FOR UPDATE",
      [guest],
    );
    const [existing] = await connection.execute<RowDataPacket[]>(
      "SELECT id, access_token_hash, request_hash FROM orders WHERE idempotency_key = ? FOR UPDATE",
      [data.idempotencyKey],
    );
    if (existing.length) {
      if (existing[0].access_token_hash !== guest || existing[0].request_hash !== requestHash)
        throw new Error("Checkout request changed; reload before trying again.");
      orderId = String(existing[0].id);
      const [payment] = await connection.execute<RowDataPacket[]>(
        "SELECT id, status FROM payments WHERE order_id = ?",
        [orderId],
      );
      if (!payment.length) throw new Error("Existing checkout is missing its payment record.");
      paymentId = String(payment[0].id);
      if (payment[0].status !== "captured") {
        const [items] = await connection.execute<RowDataPacket[]>(
          "SELECT sku, quantity FROM order_items WHERE order_id = ? ORDER BY sku",
          [orderId],
        );
        const [allocations] = await connection.execute<RowDataPacket[]>(
          "SELECT sku, quantity, status FROM inventory_allocations WHERE order_id = ? AND environment = 'test' ORDER BY sku FOR UPDATE",
          [orderId],
        );
        reservationReady =
          items.length > 0 &&
          items.length === allocations.length &&
          items.every(
            (item, index) =>
              item.sku === allocations[index].sku &&
              Number(item.quantity) === Number(allocations[index].quantity) &&
              allocations[index].status === "reserved",
          );
      }
      return;
    }
    const lines = [];
    let subtotal = 0;
    for (const line of [...data.items].sort((a, b) => a.sku.localeCompare(b.sku))) {
      const [product] = await connection.execute<RowDataPacket[]>(
        "SELECT sku, name, category, price_cents, stock FROM products WHERE sku = ? AND active = TRUE FOR UPDATE",
        [line.sku],
      );
      if (!product.length)
        throw new Error("A selected quantity is no longer available. Refresh your cart.");
      if (
        ["Business Resources", "Membership", "Consultation", "Services"].includes(
          String(product[0].category),
        )
      )
        throw new Error(
          "This service or digital item needs a manual quotation and fulfilment agreement.",
        );
      const [allocations] = await connection.execute<RowDataPacket[]>(
        `SELECT quantity FROM inventory_allocations
         WHERE sku = ? AND environment = 'test' AND (status = 'reserved' OR status = 'consumed')
         FOR UPDATE`,
        [line.sku],
      );
      const allocated = allocations.reduce(
        (sum, allocation) => sum + Number(allocation.quantity),
        0,
      );
      if (line.qty > Number(product[0].stock) - allocated)
        throw new Error("A selected quantity is no longer available. Refresh your cart.");
      subtotal += Number(product[0].price_cents) * line.qty;
      lines.push({ ...line, product: product[0] });
    }
    if (!Number.isSafeInteger(subtotal) || subtotal < 200 || subtotal > 100000000)
      throw new Error("Checkout amount is outside the supported range. Request a quotation.");
    orderId = randomUUID();
    paymentId = randomUUID();
    const reference = `DFSA-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
    await connection.execute(
      `INSERT INTO orders (id, reference, user_id, access_token_hash, idempotency_key, request_hash, name, email, phone, country, notes, shipping_method, shipping_cents, subtotal_cents, total_cents, currency, environment, checkout_origin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'ZAR', 'test', ?)`,
      [
        orderId,
        reference,
        user?.id || null,
        guest,
        data.idempotencyKey,
        requestHash,
        data.name,
        data.email,
        data.phone,
        data.country,
        data.notes,
        "pickup",
        subtotal,
        subtotal,
        data.origin,
      ],
    );
    for (const line of lines)
      await connection.execute(
        "INSERT INTO order_items (id, order_id, sku, name, quantity, unit_price_cents) VALUES (?, ?, ?, ?, ?, ?)",
        [randomUUID(), orderId, line.sku, line.product.name, line.qty, line.product.price_cents],
      );
    for (const line of lines)
      await connection.execute(
        "INSERT INTO inventory_allocations (id, order_id, sku, environment, quantity, status) VALUES (?, ?, ?, 'test', ?, 'reserved')",
        [randomUUID(), orderId, line.sku, line.qty],
      );
    await connection.execute(
      "INSERT INTO payments (id, order_id, gateway, environment, amount_cents, currency, configuration_fingerprint, capture_request_id) VALUES (?, ?, ?, 'test', ?, 'ZAR', ?, ?)",
      [paymentId, orderId, data.gateway, subtotal, config.fingerprint, randomUUID()],
    );
  });
  const [record] = await rows<RowDataPacket>(
    "SELECT o.*, p.id AS payment_id, p.status AS payment_status, p.configuration_fingerprint FROM orders o JOIN payments p ON p.order_id = o.id WHERE o.id = ? AND p.id = ?",
    [orderId, paymentId],
  );
  if (record.configuration_fingerprint !== config.fingerprint)
    return json(
      { error: "Payment configuration changed. Contact the team before retrying this order." },
      409,
    );
  if (record.payment_status === "captured")
    return json({ orderId, status: "paid", reference: record.reference });
  if (!reservationReady)
    return json(
      {
        error:
          "This checkout has no matching inventory reservation and needs merchant reconciliation before another payment attempt.",
      },
      409,
    );
  const checkout = await hostedCheckout(data.gateway, {
    paymentId,
    orderId,
    reference: record.reference,
    amountCents: Number(record.total_cents),
    currency: "ZAR",
    name: record.name,
    email: record.email,
    origin: record.checkout_origin,
    environment: "test",
  });
  await database().execute(
    "UPDATE payments SET provider_reference = ?, provider_merchant_id = ?, status = IF(status = 'initiated', 'pending', status) WHERE id = ?",
    [checkout.reference, checkout.merchantId || process.env.PAYFAST_MERCHANT_ID || null, paymentId],
  );
  return json(
    {
      orderId,
      reference: record.reference,
      status: "pending",
      amountCents: Number(record.total_cents),
      currency: "ZAR",
      mode: "test",
      checkout,
    },
    201,
  );
}

export async function orderStatus(request: Request, id: string) {
  const guest = await verifiedGuestHash(request);
  const user = await sessionUser(request);
  const orders = await rows<RowDataPacket>(
    "SELECT id, reference, user_id, access_token_hash, total_cents, paid_cents, currency, environment, status, created_at FROM orders WHERE id = ?",
    [id],
  );
  const order = orders[0];
  if (
    !order ||
    !(
      (guest && order.access_token_hash === guest) ||
      (user && (user.id === order.user_id || user.role === "admin"))
    )
  )
    return json({ error: "Order not found or access denied." }, 404);
  const items = await rows<RowDataPacket>(
    "SELECT sku, name, quantity, unit_price_cents FROM order_items WHERE order_id = ?",
    [id],
  );
  const payments = await rows<RowDataPacket>(
    "SELECT gateway, status, environment, provider_reference, verified_at FROM payments WHERE order_id = ?",
    [id],
  );
  return json({
    order: {
      id: order.id,
      reference: order.reference,
      totalCents: Number(order.total_cents),
      paidCents: Number(order.paid_cents),
      outstandingCents: Number(order.total_cents) - Number(order.paid_cents),
      currency: order.currency,
      environment: order.environment,
      status: order.status,
      createdAt: order.created_at,
      items,
      payments,
    },
  });
}

import { z } from "zod";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { requireAdmin } from "./auth";
import { database, rows } from "./database";
import { catalogue } from "./store";
import { json } from "./http";

const productUpdate = z
  .object({
    sku: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(300),
    category: z.string().trim().min(1).max(100),
    price_cents: z.number().int().min(0).max(100000000),
    stock: z.number().int().min(0).max(1000000),
    active: z.boolean(),
    version: z.number().int().min(1),
  })
  .strict();

export async function adminOverview(request: Request) {
  await requireAdmin(request);
  const [products, quotes, contacts, orders, payments, gateways] = await Promise.all([
    rows<RowDataPacket>(
      "SELECT sku, name, category, price_cents, stock, active, version FROM products ORDER BY category, name",
    ),
    rows<RowDataPacket>(
      "SELECT id, reference, name, email, phone, company, address_line1, address_line2, city, province, postal_code, country, shipping_method, notes, status, created_at FROM quote_requests ORDER BY created_at DESC LIMIT 100",
    ),
    rows<RowDataPacket>(
      "SELECT id, name, email, message, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100",
    ),
    rows<RowDataPacket>(
      "SELECT id, reference, name, email, total_cents, paid_cents, currency, environment, status, created_at FROM orders ORDER BY created_at DESC LIMIT 100",
    ),
    rows<RowDataPacket>(
      "SELECT id, order_id, gateway, environment, provider_reference, amount_cents, currency, status, refund_status, verified_at, created_at FROM payments ORDER BY created_at DESC LIMIT 100",
    ),
    rows<RowDataPacket>(
      "SELECT gateway, enabled, mode, validation_status, validated_at FROM gateway_settings ORDER BY gateway",
    ),
  ]);
  const quoteItems = quotes.length
    ? await rows<RowDataPacket>(
        `SELECT quote_id, sku, name, quantity, unit_price_cents FROM quote_items WHERE quote_id IN (${quotes.map(() => "?").join(",")})`,
        quotes.map((quote) => String(quote.id)),
      )
    : [];
  return {
    products,
    quotes: quotes.map((quote) => ({
      ...quote,
      items: quoteItems.filter((item) => item.quote_id === quote.id),
    })),
    contacts,
    orders,
    payments,
    gateways,
    administratorConfigured: Boolean(process.env.DFSA_ADMIN_OPEN_IDS),
  };
}

export async function updateProduct(request: Request, input: unknown) {
  await requireAdmin(request);
  const data = productUpdate.parse(input);
  const [result] = await database().execute<ResultSetHeader>(
    `UPDATE products SET name = ?, category = ?, price_cents = ?, stock = ?, active = ?, version = version + 1 WHERE sku = ? AND version = ?`,
    [data.name, data.category, data.price_cents, data.stock, data.active, data.sku, data.version],
  );
  if (result.affectedRows !== 1)
    return json(
      { error: "This product changed elsewhere or no longer exists. Refresh before editing." },
      409,
    );
  return json({ updated: true });
}

export async function updateInquiry(request: Request, input: unknown) {
  await requireAdmin(request);
  const data = z
    .object({
      kind: z.enum(["quote", "contact"]),
      id: z.string().uuid(),
      status: z.enum(["new", "reviewing", "responded", "closed"]),
    })
    .strict()
    .parse(input);
  const table = data.kind === "quote" ? "quote_requests" : "contact_messages";
  const [result] = await database().execute<ResultSetHeader>(
    `UPDATE ${table} SET status = ? WHERE id = ?`,
    [data.status, data.id],
  );
  return result.affectedRows ? json({ updated: true }) : json({ error: "Inquiry not found." }, 404);
}

export async function exportNativeRecords(request: Request) {
  await requireAdmin(request);
  const records = await adminOverview(request);
  return json({
    format: "dfsa-administrative-snapshot-v1",
    exportedAt: new Date().toISOString(),
    records,
    limitation:
      "A portable snapshot of the current catalogue and the latest 100 inquiries, orders and payments per section; not a complete database backup or platform recovery point. Secrets, guest tokens, auth nonces and raw webhook payloads are never exported.",
  });
}

import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { transaction } from "./database";
import type { Gateway } from "./payment-settings";

export type VerifiedPaymentEvent = {
  gateway: Gateway;
  environment: "test" | "live";
  eventId: string;
  eventType: string;
  reference: string;
  captureId?: string;
  amountCents: number;
  currency: string;
  merchantId?: string;
  status: "captured" | "pending" | "failed" | "cancelled";
};

function hasMatchingReservedAllocations(items: RowDataPacket[], allocations: RowDataPacket[]) {
  if (!items.length || items.length !== allocations.length) return false;
  const expected = new Map(items.map((item) => [String(item.sku), Number(item.quantity)]));
  const reserved = new Map<string, number>();
  for (const allocation of allocations) {
    const sku = String(allocation.sku);
    if (allocation.status !== "reserved" || reserved.has(sku)) return false;
    reserved.set(sku, Number(allocation.quantity));
  }
  return (
    expected.size === reserved.size &&
    [...expected].every(([sku, quantity]) => reserved.get(sku) === quantity)
  );
}

export async function applyVerifiedPayment(event: VerifiedPaymentEvent) {
  return transaction(async (connection) => {
    const [payments] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM payments WHERE gateway = ? AND environment = ? AND provider_reference = ? FOR UPDATE",
      [event.gateway, event.environment, event.reference],
    );
    const payment = payments[0];
    if (!payment) throw new Error("Payment correlation not found.");
    if (
      Number(payment.amount_cents) !== event.amountCents ||
      payment.currency !== event.currency ||
      (event.merchantId && payment.provider_merchant_id !== event.merchantId)
    )
      throw new Error("Payment details mismatch.");
    const [orderRows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [payment.order_id],
    );
    const order = orderRows[0];
    if (!order || order.environment !== event.environment || order.currency !== event.currency)
      throw new Error("Order details mismatch.");
    const [seen] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM webhook_events WHERE gateway = ? AND environment = ? AND provider_event_id = ?",
      [event.gateway, event.environment, event.eventId],
    );
    if (seen.length) return { duplicate: true };
    let result = "verified_no_financial_change";
    if (event.status === "captured" && payment.status !== "captured") {
      if (!event.captureId) throw new Error("Verified capture reference missing.");
      const paid = Number(order.paid_cents) + event.amountCents;
      if (paid > Number(order.total_cents))
        throw new Error("Payment exceeds outstanding amount; manual review required.");
      const [items] = await connection.execute<RowDataPacket[]>(
        "SELECT sku, quantity FROM order_items WHERE order_id = ? ORDER BY sku",
        [order.id],
      );
      const [allocations] = await connection.execute<RowDataPacket[]>(
        "SELECT sku, quantity, status FROM inventory_allocations WHERE order_id = ? AND environment = ? ORDER BY sku FOR UPDATE",
        [order.id, event.environment],
      );
      const fullyPaid = paid === Number(order.total_cents);
      let inventoryReady = fullyPaid && hasMatchingReservedAllocations(items, allocations);

      // Sandbox captures exercise reservation consumption only: products.stock is live inventory.
      if (inventoryReady && event.environment === "live") {
        for (const item of items) {
          const [stock] = await connection.execute<RowDataPacket[]>(
            "SELECT stock FROM products WHERE sku = ? FOR UPDATE",
            [item.sku],
          );
          if (!stock.length || Number(stock[0].stock) < Number(item.quantity)) {
            inventoryReady = false;
            break;
          }
        }
      }
      if (inventoryReady && event.environment === "live")
        for (const item of items)
          await connection.execute(
            "UPDATE products SET stock = stock - ?, version = version + 1 WHERE sku = ?",
            [item.quantity, item.sku],
          );
      if (inventoryReady)
        await connection.execute(
          "UPDATE inventory_allocations SET status = 'consumed', consumed_at = NOW(3) WHERE order_id = ? AND environment = ? AND status = 'reserved'",
          [order.id, event.environment],
        );
      await connection.execute(
        "UPDATE payments SET status = 'captured', provider_capture_reference = ?, verified_at = NOW(3) WHERE id = ?",
        [event.captureId, payment.id],
      );
      const state =
        paid < Number(order.total_cents)
          ? "partially_paid"
          : inventoryReady
            ? "paid"
            : "paid_stock_review";
      await connection.execute("UPDATE orders SET paid_cents = ?, status = ? WHERE id = ?", [
        paid,
        state,
        order.id,
      ]);
      result = inventoryReady ? "verified_capture_applied" : "verified_capture_stock_review";
    } else if (payment.status === "captured") {
      if (event.status === "captured" && event.captureId !== payment.provider_capture_reference)
        throw new Error("Conflicting payment capture reference.");
      result = "verified_event_ignored_after_capture";
    } else {
      await connection.execute("UPDATE payments SET status = ? WHERE id = ?", [
        event.status,
        payment.id,
      ]);
      if (["failed", "cancelled"].includes(event.status) && Number(order.paid_cents) === 0)
        await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
          event.status,
          order.id,
        ]);
    }
    await connection.execute(
      "INSERT INTO webhook_events (id, gateway, environment, provider_event_id, payment_id, event_type, processing_result) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        randomUUID(),
        event.gateway,
        event.environment,
        event.eventId,
        payment.id,
        event.eventType,
        result,
      ],
    );
    return { duplicate: false, result };
  });
}

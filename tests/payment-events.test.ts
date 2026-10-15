import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyVerifiedPayment, type VerifiedPaymentEvent } from "../src/server/payment-events";

const fixture = vi.hoisted(() => ({
  payment: {} as Record<string, unknown>,
  order: {} as Record<string, unknown>,
  events: new Set<string>(),
  stock: 10,
  decrements: 0,
  allocations: [] as Array<Record<string, unknown>>,
  allocationConsumes: 0,
}));
vi.mock("../src/server/database", () => ({
  transaction: async (callback: (connection: unknown) => Promise<unknown>) => {
    const connection = {
      execute: async (sql: string, values: unknown[]) => {
        if (sql.startsWith("SELECT * FROM payments")) return [[fixture.payment]];
        if (sql.startsWith("SELECT * FROM orders")) return [[fixture.order]];
        if (sql.startsWith("SELECT id FROM webhook_events"))
          return [fixture.events.has(String(values[2])) ? [{ id: "seen" }] : []];
        if (sql.startsWith("SELECT sku, quantity FROM order_items"))
          return [[{ sku: "fixture-sku", quantity: 2 }]];
        if (sql.startsWith("SELECT sku, quantity, status FROM inventory_allocations"))
          return [fixture.allocations];
        if (sql.startsWith("SELECT stock FROM products")) return [[{ stock: fixture.stock }]];
        if (sql.startsWith("UPDATE products SET stock")) {
          fixture.stock -= Number(values[0]);
          fixture.decrements++;
        } else if (sql.startsWith("UPDATE inventory_allocations SET status = 'consumed'")) {
          for (const allocation of fixture.allocations) {
            if (allocation.status === "reserved") {
              allocation.status = "consumed";
              fixture.allocationConsumes++;
            }
          }
        } else if (sql.startsWith("UPDATE payments SET status = 'captured'")) {
          fixture.payment.status = "captured";
          fixture.payment.provider_capture_reference = values[0];
        } else if (sql.startsWith("UPDATE payments SET status = ?"))
          fixture.payment.status = values[0];
        else if (sql.startsWith("UPDATE orders SET paid_cents")) {
          fixture.order.paid_cents = values[0];
          fixture.order.status = values[1];
        } else if (sql.startsWith("UPDATE orders SET status")) fixture.order.status = values[0];
        else if (sql.startsWith("INSERT INTO webhook_events"))
          fixture.events.add(String(values[3]));
        else throw new Error(`Unexpected test SQL: ${sql}`);
        return [{ affectedRows: 1 }];
      },
    };
    return callback(connection);
  },
}));

const event = (): VerifiedPaymentEvent => ({
  gateway: "yoco",
  environment: "test",
  eventId: "fixture-event",
  eventType: "payment.succeeded",
  reference: "fixture-checkout",
  captureId: "fixture-capture",
  amountCents: 80000,
  currency: "ZAR",
  status: "captured",
});
beforeEach(() => {
  fixture.payment = {
    id: "fixture-payment",
    order_id: "fixture-order",
    amount_cents: 80000,
    currency: "ZAR",
    status: "pending",
    provider_capture_reference: null,
  };
  fixture.order = {
    id: "fixture-order",
    total_cents: 80000,
    paid_cents: 0,
    currency: "ZAR",
    environment: "test",
    status: "pending",
  };
  fixture.events.clear();
  fixture.stock = 10;
  fixture.decrements = 0;
  fixture.allocations = [{ sku: "fixture-sku", quantity: 2, status: "reserved" }];
  fixture.allocationConsumes = 0;
});

describe("verified native payment-event state model (no real database or provider)", () => {
  it("consumes a matching sandbox reservation without decrementing real product stock", async () => {
    const result = await applyVerifiedPayment(event());
    expect(result).toEqual({ duplicate: false, result: "verified_capture_applied" });
    expect(fixture.order.paid_cents).toBe(80000);
    expect(fixture.order.status).toBe("paid");
    expect(fixture.stock).toBe(10);
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocations[0].status).toBe("consumed");
    expect(fixture.allocationConsumes).toBe(1);
  });
  it("does not double-consume a duplicate webhook", async () => {
    await applyVerifiedPayment(event());
    expect(await applyVerifiedPayment(event())).toEqual({ duplicate: true });
    expect(fixture.order.paid_cents).toBe(80000);
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocationConsumes).toBe(1);
  });
  it("does not double-consume a second event for the same capture", async () => {
    await applyVerifiedPayment(event());
    await applyVerifiedPayment({ ...event(), eventId: "second-event" });
    expect(fixture.order.paid_cents).toBe(80000);
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocationConsumes).toBe(1);
  });
  it("cannot downgrade a captured payment from an out-of-order failure", async () => {
    await applyVerifiedPayment(event());
    await applyVerifiedPayment({
      ...event(),
      eventId: "late-failure",
      eventType: "payment.failed",
      status: "failed",
    });
    expect(fixture.payment.status).toBe("captured");
    expect(fixture.order.status).toBe("paid");
    expect(fixture.allocationConsumes).toBe(1);
  });
  it("rejects incorrect monetary amount before any financial writes", async () => {
    await expect(applyVerifiedPayment({ ...event(), amountCents: 1 })).rejects.toThrow("mismatch");
    expect(fixture.order.paid_cents).toBe(0);
    expect(fixture.allocationConsumes).toBe(0);
  });
  it("rejects currency mismatch", async () => {
    await expect(applyVerifiedPayment({ ...event(), currency: "USD" })).rejects.toThrow("mismatch");
    expect(fixture.decrements).toBe(0);
  });
  it("rejects order environment mismatch", async () => {
    fixture.order.environment = "live";
    await expect(applyVerifiedPayment(event())).rejects.toThrow("mismatch");
    expect(fixture.order.paid_cents).toBe(0);
  });
  it("records a verified capture for review when its allocation is missing", async () => {
    fixture.allocations = [];
    const result = await applyVerifiedPayment(event());
    expect(result).toEqual({ duplicate: false, result: "verified_capture_stock_review" });
    expect(fixture.payment.status).toBe("captured");
    expect(fixture.order.paid_cents).toBe(80000);
    expect(fixture.order.status).toBe("paid_stock_review");
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocationConsumes).toBe(0);
  });
  it("records a verified capture for review when its allocation quantity mismatches", async () => {
    fixture.allocations[0].quantity = 1;
    await applyVerifiedPayment(event());
    expect(fixture.payment.status).toBe("captured");
    expect(fixture.order.status).toBe("paid_stock_review");
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocations[0].status).toBe("reserved");
  });
  it("uses a matching live allocation before decrementing an existing live product row", async () => {
    fixture.order.environment = "live";
    await applyVerifiedPayment({ ...event(), environment: "live" });
    expect(fixture.order.status).toBe("paid");
    expect(fixture.stock).toBe(8);
    expect(fixture.decrements).toBe(1);
    expect(fixture.allocationConsumes).toBe(1);
  });
  it("flags a live capture for review instead of decrementing when locked stock is insufficient", async () => {
    fixture.order.environment = "live";
    fixture.stock = 1;
    await applyVerifiedPayment({ ...event(), environment: "live" });
    expect(fixture.payment.status).toBe("captured");
    expect(fixture.order.status).toBe("paid_stock_review");
    expect(fixture.stock).toBe(1);
    expect(fixture.decrements).toBe(0);
    expect(fixture.allocations[0].status).toBe("reserved");
  });
  it("does not label a partial payment fully paid or consume its hold", async () => {
    fixture.order.total_cents = 100000;
    await applyVerifiedPayment(event());
    expect(fixture.order.status).toBe("partially_paid");
    expect(fixture.order.paid_cents).toBe(80000);
    expect(fixture.allocations[0].status).toBe("reserved");
    expect(fixture.decrements).toBe(0);
  });
  it("rejects a capture that exceeds the native outstanding balance", async () => {
    fixture.order.paid_cents = 1;
    await expect(applyVerifiedPayment(event())).rejects.toThrow("exceeds");
    expect(fixture.decrements).toBe(0);
  });
  it("keeps holds after pending and failed events so a later verified capture can be reconciled", async () => {
    await applyVerifiedPayment({ ...event(), status: "pending" });
    expect(fixture.order.paid_cents).toBe(0);
    await applyVerifiedPayment({ ...event(), eventId: "failure", status: "failed" });
    expect(fixture.order.paid_cents).toBe(0);
    expect(fixture.order.status).toBe("failed");
    expect(fixture.allocations[0].status).toBe("reserved");
  });
});

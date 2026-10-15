import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/products";
import { storeApi } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type GatewayOption = { gateway: string; mode: string; label: string };
type Order = {
  reference: string;
  status: string;
  totalCents: number;
  paidCents: number;
  outstandingCents: number;
  environment: string;
  currency: string;
};
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · DFSA Dragon Fruit" },
      {
        name: "description",
        content:
          "Review your dragon fruit plant selection and request a delivery quotation from DFSA.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, loading } = useCart();
  const [gateways, setGateways] = useState<GatewayOption[]>([]);
  const [gateway, setGateway] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState("");
  const key = useRef("");
  const payloadKey = useRef("");
  async function refreshOrder() {
    const orderId = new URLSearchParams(window.location.search).get("order");
    if (!orderId) return;
    try {
      const result = await storeApi<{ order: Order }>(`/api/orders/${encodeURIComponent(orderId)}`);
      setOrder(result.order);
      setOrderError("");
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Order status is unavailable.");
    }
  }
  useEffect(() => {
    void storeApi<{ gateways: GatewayOption[] }>("/api/payment-options")
      .then((result) => {
        setGateways(result.gateways);
        setGateway(result.gateways[0]?.gateway || "");
      })
      .catch(() => setGateways([]));
    void refreshOrder();
  }, []);
  async function pay() {
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        ...form,
        gateway,
        country: "South Africa",
        shipping_method: "pickup",
        origin: window.location.origin,
        items: items.map((item) => ({ sku: item.sku, qty: item.qty })),
      };
      const fingerprint = JSON.stringify(payload);
      if (payloadKey.current !== fingerprint) {
        payloadKey.current = fingerprint;
        key.current = crypto.randomUUID();
      }
      const result = await storeApi<{
        orderId: string;
        reference: string;
        checkout?: { url?: string; form?: { action: string; fields: [string, string][] } };
      }>("/api/checkout", { ...payload, idempotencyKey: key.current });
      toast.info("Opening the payment provider's sandbox. A return page never confirms payment.");
      if (result.checkout?.url) window.location.assign(result.checkout.url);
      else if (result.checkout?.form) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.checkout.form.action;
        for (const [name, value] of result.checkout.form.fields) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else {
        window.history.replaceState(null, "", `/checkout?order=${result.orderId}`);
        await refreshOrder();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Checkout could not be created; no payment is confirmed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="mx-auto max-w-3xl px-4 py-20" role="status">
        Loading your saved cart…
      </div>
    );
  if (!items.length && !order && !orderError)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">Your cart is empty</h1>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse plants</Link>
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Your selection</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Review your order</h1>
      {(order || orderError) && (
        <section className="mt-6 rounded-xl border border-primary/30 p-5">
          <h2 className="font-display text-xl">Payment status</h2>
          {order && (
            <>
              <p className="mt-3">
                {order.reference} · {order.environment} · {order.status.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-sm">
                Verified paid: {formatZAR(order.paidCents / 100)} · Outstanding:{" "}
                {formatZAR(order.outstandingCents / 100)}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Only verified server events change this status. A success, approval, cancel or
                failure URL does not change your payment record.
              </p>
            </>
          )}
          {orderError && <p role="alert">{orderError}</p>}
          <Button variant="outline" onClick={() => void refreshOrder()} className="mt-4">
            Refresh verified status
          </Button>
        </section>
      )}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.sku} className="flex justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.sku} · Quantity {item.qty}
                </p>
              </div>
              <p className="whitespace-nowrap">{formatZAR(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-5 font-semibold">
          <span>Estimated subtotal</span>
          <span>{formatZAR(subtotal)}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Stock and prices are rechecked by the server. PUDO locker/door deliveries, export,
          commercial packaging, digital delivery and service scheduling need a manual quotation.
          Sandbox checkout currently supports local farm collection only.
        </p>
      </div>
      <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl">
            {gateways.length
              ? "Sandbox checkout — not live payments"
              : "Online payments are not available yet"}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {gateways.length
            ? "This test flow uses server-created orders and hosted checkout. No real-money live gateway is enabled. Test and live records are kept separate."
            : "Payment gateways must be configured and verified before this site can accept payment. No payment has been taken and no order is marked as paid. You can send a quotation request to the DFSA team instead."}
        </p>
        {gateways.length > 0 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void pay();
            }}
            className="mt-5 space-y-4"
          >
            {(["name", "email", "phone"] as const).map((name) => (
              <label key={name} className="block text-sm capitalize">
                {name}
                <input
                  required
                  maxLength={name === "email" ? 320 : name === "name" ? 200 : 60}
                  type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                  className="mt-1 w-full rounded border border-input bg-background p-2"
                />
              </label>
            ))}
            <label className="block text-sm">
              Test gateway
              <select
                value={gateway}
                onChange={(event) => setGateway(event.target.value)}
                className="mt-1 w-full rounded border border-input bg-background p-2"
              >
                {gateways.map((option) => (
                  <option key={option.gateway} value={option.gateway}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs">
              Shipping: Farm collection by arrangement. Availability is rechecked, not reserved
              until payment; a captured payment with insufficient stock is held for manual
              fulfilment review.
            </p>
            <Button disabled={busy || !items.length} type="submit">
              {busy
                ? "Creating secure test order…"
                : `Continue to ${gateway.toUpperCase()} sandbox`}
            </Button>
          </form>
        )}
        <Button asChild className="mt-5">
          <Link to="/quote" search={{ fromCart: true }}>
            Request a quotation
          </Link>
        </Button>
        <Button asChild variant="outline" className="ml-3 mt-5">
          <Link to="/shop">Continue browsing</Link>
        </Button>
      </section>
    </div>
  );
}

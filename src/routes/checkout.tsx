import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · DFSA Dragon Fruit" },
      { name: "description", content: "Secure checkout with Yoco and PayPal. PUDO shipping available." },
      { property: "og:title", content: "Checkout · DFSA" },
      { property: "og:description", content: "Pay securely with Yoco or PayPal." },
    ],
  }),
  component: Checkout,
});

const SHIPPING: Record<string, { label: string; price: number; desc: string }> = {
  pudo_locker: { label: "PUDO Locker-to-Locker", price: 60, desc: "Drop off & collect at any PUDO locker in South Africa." },
  pudo_door: { label: "PUDO Door-to-Door", price: 150, desc: "Door delivery via PUDO courier network." },
  pickup: { label: "Farm Pickup", price: 0, desc: "Collect from our farm — you'll receive an address by email." },
  export: { label: "Worldwide Export Quote", price: 0, desc: "We'll email you a shipping quote for cross-border orders." },
};

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [shipping, setShipping] = useState("pudo_locker");
  const [method, setMethod] = useState<"yoco" | "paypal">("yoco");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", country: "South Africa", notes: "" });
  const [placed, setPlaced] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const shippingCost = SHIPPING[shipping].price;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (method === "paypal") {
      const id = "paypal-sdk";
      if (document.getElementById(id)) return;
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [method]);

  const placeOrder = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in your name, email and phone");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setProcessing(true);
    try {
      if (method === "yoco") {
        // Yoco Popup SDK. Publishable key can safely live in the client.
        const YOCO_PUBLIC = (import.meta.env.VITE_YOCO_PUBLIC_KEY as string) || "pk_test_ed3c54a6gOol69qa7f45";
        await new Promise<void>((resolve, reject) => {
          const id = "yoco-sdk";
          const start = () => {
            // @ts-ignore
            const yoco = new window.YocoSDK({ publicKey: YOCO_PUBLIC });
            yoco.showPopup({
              amountInCents: Math.round(total * 100),
              currency: "ZAR",
              name: "DFSA Dragon Fruit",
              description: `Order (${items.length} items)`,
              callback: (result: any) => {
                if (result.error) { toast.error(result.error.message || "Payment failed"); reject(result.error); }
                else resolve();
              },
            });
          };
          if (document.getElementById(id)) { start(); return; }
          const s = document.createElement("script");
          s.id = id;
          s.src = "https://js.yoco.com/sdk/v1/yoco-sdk-web.js";
          s.onload = start;
          s.onerror = () => reject(new Error("Failed to load Yoco"));
          document.body.appendChild(s);
        });
      } else {
        // PayPal — sandbox demo flow
        await new Promise((r) => setTimeout(r, 800));
      }
      const ref = "DFSA-" + Date.now().toString(36).toUpperCase();
      setPlaced(ref);
      clear();
    } catch (e) {
      // toast already shown
    } finally {
      setProcessing(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-semibold">Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you! Your reference is <span className="font-mono font-semibold text-foreground">{placed}</span>.
          We'll email you shortly at <b>{form.email || "your address"}</b> with shipping details.
        </p>
        <Button asChild className="mt-8 bg-gradient-fruit text-white"><Link to="/shop">Continue shopping</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Your cart is empty</h1>
        <Button asChild className="mt-6 bg-gradient-fruit text-white"><Link to="/shop">Browse plants</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-semibold">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold">Contact & Delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Order notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Truck className="h-5 w-5" /> Shipping</h2>
            <RadioGroup value={shipping} onValueChange={setShipping} className="space-y-2">
              {Object.entries(SHIPPING).map(([k, v]) => (
                <label key={k} htmlFor={k} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${shipping === k ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={k} id={k} className="mt-1" />
                    <div>
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-muted-foreground">{v.desc}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{v.price === 0 ? "Free / Quote" : formatZAR(v.price)}</div>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold">Payment</h2>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)} className="grid gap-3 sm:grid-cols-2">
              <label htmlFor="yoco" className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${method === "yoco" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="yoco" id="yoco" />
                <div>
                  <div className="font-semibold">Yoco</div>
                  <div className="text-xs text-muted-foreground">Card payments (ZAR) — secure popup checkout.</div>
                </div>
              </label>
              <label htmlFor="paypal" className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${method === "paypal" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="paypal" id="paypal" />
                <div>
                  <div className="font-semibold">PayPal</div>
                  <div className="text-xs text-muted-foreground">International payments in USD.</div>
                </div>
              </label>
            </RadioGroup>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-xl font-semibold">Order Summary</h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((i) => (
              <li key={i.sku} className="flex justify-between gap-3">
                <span className="flex-1">{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                <span className="font-medium">{formatZAR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? "—" : formatZAR(shippingCost)}</span></div>
            <div className="flex justify-between border-t pt-2 font-display text-xl font-semibold text-primary">
              <span>Total</span><span>{formatZAR(total)}</span>
            </div>
          </div>
          <Button disabled={processing} onClick={placeOrder} size="lg" className="mt-6 w-full bg-gradient-fruit text-white shadow-glow hover:opacity-95">
            {processing ? "Processing…" : `Pay with ${method === "yoco" ? "Yoco" : "PayPal"}`}
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Secure checkout · SSL encrypted · You'll get an email receipt.
          </p>
        </aside>
      </div>
    </div>
  );
}

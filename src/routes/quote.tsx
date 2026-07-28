import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PRODUCTS, formatZAR } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, FileText, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Request a Quotation · DFSA Dragon Fruit Plants" },
      {
        name: "description",
        content:
          "Request a personalised quotation for dragon fruit plants. Fill in your address, select the plants and quantities you need — we'll email a quote and invoice.",
      },
      { property: "og:title", content: "Request a Quotation · DFSA" },
      {
        property: "og:description",
        content: "Get a custom quote and invoice for your dragon fruit plant order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotePage,
});

type Line = { sku: string; qty: number };

function QuotePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    country: "South Africa",
    shipping_method: "pudo_door",
    notes: "",
  });
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    ).slice(0, 60);
  }, [query, category]);

  const addLine = (sku: string) => {
    setLines((prev) => {
      const found = prev.find((l) => l.sku === sku);
      if (found) return prev.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { sku, qty: 1 }];
    });
  };
  const setQty = (sku: string, qty: number) =>
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, qty } : l)),
    );
  const removeLine = (sku: string) => setLines((prev) => prev.filter((l) => l.sku !== sku));

  const enriched = lines
    .map((l) => {
      const p = PRODUCTS.find((x) => x.sku === l.sku);
      return p ? { ...l, name: p.name, price: p.price } : null;
    })
    .filter(Boolean) as Array<Line & { name: string; price: number }>;
  const estimate = enriched.reduce((s, l) => s + l.price * l.qty, 0);

  const submit = async () => {
    if (!form.name || !form.email || !form.address_line1 || !form.city) {
      toast.error("Please fill in name, email, address and city");
      return;
    }
    if (lines.length === 0) {
      toast.error("Please add at least one plant to your quote");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone || null,
          company: form.company || null,
          address_line1: form.address_line1.trim(),
          address_line2: form.address_line2 || null,
          city: form.city.trim(),
          province: form.province || null,
          postal_code: form.postal_code || null,
          country: form.country,
          shipping_method: form.shipping_method,
          items: enriched.map((l) => ({
            sku: l.sku,
            name: l.name,
            qty: l.qty,
            unit_price: l.price,
          })),
          notes: form.notes || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      setDone(data?.id ?? "submitted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Could not submit — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-semibold">Quote request received</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you, {form.name.split(" ")[0] || "friend"}. Our team will review your request and
          email a formal quotation and invoice to <b>{form.email}</b> within 1 business day.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Reference: {done}</p>
        <Button asChild className="mt-8 bg-gradient-fruit text-white">
          <Link to="/shop">Continue browsing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-fruit text-white shadow-glow">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight">Request a Quotation</h1>
          <p className="text-sm text-muted-foreground">
            Tell us where to deliver and which plants you'd like — we'll email a formal quote & invoice.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Contact & Address */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold">Your Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Company (optional)</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>

            <h3 className="mt-6 mb-3 font-display text-lg font-semibold">Delivery Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Street Address *</Label><Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} /></div>
              <div><Label>City / Town *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
              <div><Label>Postal Code</Label><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div className="sm:col-span-2">
                <Label>Preferred Shipping</Label>
                <Select value={form.shipping_method} onValueChange={(v) => setForm({ ...form, shipping_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pudo_locker">PUDO Locker-to-Locker</SelectItem>
                    <SelectItem value="pudo_door">PUDO Door-to-Door</SelectItem>
                    <SelectItem value="pickup">Farm Pickup</SelectItem>
                    <SelectItem value="export">International Export (quote)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label>Notes for our team</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Planting timeline, farm size, questions…" /></div>
            </div>
          </section>

          {/* Plant selection */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold">Select Plants</h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or SKU…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
              <ul className="divide-y divide-border">
                {filtered.map((p) => (
                  <li key={p.sku} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sku} · {formatZAR(p.price)}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addLine(p.sku)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">No products match.</li>
                )}
              </ul>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-xl font-semibold">Your Selection</h2>
          {enriched.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plants selected yet. Add items from the list.</p>
          ) : (
            <ul className="space-y-3">
              {enriched.map((l) => (
                <li key={l.sku} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{formatZAR(l.price)} each</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLine(l.sku)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => setQty(l.sku, parseInt(e.target.value || "0", 10))}
                      className="h-8 w-20"
                    />
                    <div className="ml-auto text-sm font-semibold">{formatZAR(l.price * l.qty)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated subtotal</span>
              <span>{formatZAR(estimate)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shipping and any bulk discount will be calculated on your formal quote.
            </p>
          </div>
          <Button
            disabled={submitting}
            onClick={submit}
            size="lg"
            className="mt-6 w-full bg-gradient-fruit text-white shadow-glow hover:opacity-95"
          >
            {submitting ? "Sending…" : "Send Quote Request"}
          </Button>
        </aside>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { storeApi } from "@/lib/store-api";
import { formatZAR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Product = {
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  stock: number;
  active: boolean;
  version: number;
};
type Inquiry = {
  id: string;
  reference?: string;
  name: string;
  email: string;
  message?: string;
  notes?: string;
  status: string;
  created_at: string;
  items?: { sku: string; name: string; quantity: number }[];
};
type Overview = {
  products: Product[];
  quotes: Inquiry[];
  contacts: Inquiry[];
  orders: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  gateways: { gateway: string; enabled: boolean; mode: string; validation_status: string }[];
};
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "DFSA Administration" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Admin,
});

function Admin() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [section, setSection] = useState("quotes");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      setData(await storeApi<Overview>("/api/admin/overview"));
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load protected records.");
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function updateInquiry(kind: "quote" | "contact", id: string, status: string) {
    setBusy(true);
    try {
      await storeApi("/api/admin/inquiries", { kind, id, status });
      await refresh();
      toast.success("Status saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  async function saveProduct() {
    if (!editing) return;
    setBusy(true);
    try {
      await storeApi("/api/admin/products", { ...editing, active: Boolean(editing.active) });
      setEditing(null);
      await refresh();
      toast.success("Catalogue changes saved to the Manus database.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  async function exportSnapshot() {
    try {
      const snapshot = await storeApi("/api/admin/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "dfsa-administrative-snapshot.json";
      link.click();
      URL.revokeObjectURL(url);
      toast.info(
        "Snapshot downloaded: latest 100 records per inquiry/payment section, not a full backup.",
      );
    } catch {
      toast.error("The protected snapshot could not be exported.");
    }
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Private administration
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Your DFSA operations.</h1>
      {error && (
        <div role="alert" className="mt-8 rounded-xl border border-border p-6">
          <p>{error}</p>
          <Link to="/account" className="mt-4 inline-block text-primary">
            Sign in / verify access →
          </Link>
        </div>
      )}
      {!data && !error && (
        <p role="status" className="mt-8">
          Loading authorized native records…
        </p>
      )}
      {data && (
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            {["quotes", "messages", "catalogue", "orders", "payments"].map((name) => (
              <Button
                key={name}
                variant={section === name ? "default" : "outline"}
                onClick={() => {
                  setSection(name);
                  setQuery("");
                }}
              >
                {name}
              </Button>
            ))}
            <Button variant="outline" onClick={exportSnapshot}>
              Export snapshot
            </Button>
            <Button asChild variant="outline">
              <Link to="/payment-settings">Payment settings</Link>
            </Button>
          </div>
          <input
            aria-label="Search current records"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the current view…"
            className="mt-6 w-full rounded-md border border-input bg-background px-3 py-2"
          />
          {["quotes", "messages"].includes(section) && (
            <div className="mt-6 space-y-4">
              {(section === "quotes" ? data.quotes : data.contacts)
                .filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
                .map((item) => (
                  <article key={item.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{item.reference || item.name}</h2>
                        <p className="mt-1 text-sm">
                          {item.name} ·{" "}
                          <a href={`mailto:${item.email}`} className="text-primary">
                            {item.email}
                          </a>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.created_at}</p>
                      </div>
                      <select
                        disabled={busy}
                        aria-label={`Status for ${item.reference || item.name}`}
                        value={item.status}
                        onChange={(event) =>
                          updateInquiry(
                            section === "quotes" ? "quote" : "contact",
                            item.id,
                            event.target.value,
                          )
                        }
                        className="rounded border border-input bg-background px-3 py-2"
                      >
                        {["new", "reviewing", "responded", "closed"].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    {item.message && (
                      <p className="mt-4 whitespace-pre-wrap text-sm">{item.message}</p>
                    )}
                    {item.notes && <p className="mt-3 whitespace-pre-wrap text-sm">{item.notes}</p>}
                    {item.items && (
                      <ul className="mt-4 space-y-1 text-sm">
                        {item.items.map((line) => (
                          <li key={line.sku}>
                            {line.name} · {line.sku} × {line.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              {(section === "quotes" ? data.quotes : data.contacts).length === 0 && (
                <p className="text-muted-foreground">No inquiries have been received.</p>
              )}
            </div>
          )}
          {section === "catalogue" && (
            <div className="mt-6 space-y-3">
              {data.products
                .filter((product) =>
                  `${product.name} ${product.sku} ${product.category}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((product) => (
                  <div
                    key={product.sku}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
                  >
                    <div>
                      <h2 className="font-medium">{product.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {product.sku} · {product.category} · {product.active ? "active" : "hidden"}
                      </p>
                    </div>
                    <p>
                      {formatZAR(product.price_cents / 100)} · {product.stock} in stock
                    </p>
                    <Button variant="outline" onClick={() => setEditing(product)}>
                      Edit
                    </Button>
                  </div>
                ))}
            </div>
          )}
          {editing && section === "catalogue" && (
            <section className="mt-6 rounded-xl border border-primary p-6">
              <h2 className="font-display text-xl">Edit {editing.sku}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  Name
                  <input
                    value={editing.name}
                    onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </label>
                <label className="text-sm">
                  Category
                  <input
                    value={editing.category}
                    onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </label>
                <label className="text-sm">
                  Price in ZAR
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editing.price_cents / 100}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        price_cents: Math.round(Number(event.target.value) * 100),
                      })
                    }
                    className="mt-1 w-full rounded border p-2"
                  />
                </label>
                <label className="text-sm">
                  Stock
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editing.stock}
                    onChange={(event) =>
                      setEditing({ ...editing, stock: Number(event.target.value) })
                    }
                    className="mt-1 w-full rounded border p-2"
                  />
                </label>
                <label className="text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.active)}
                    onChange={(event) => setEditing({ ...editing, active: event.target.checked })}
                  />{" "}
                  Visible in catalogue
                </label>
              </div>
              <Button disabled={busy} onClick={saveProduct} className="mt-5">
                Save native record
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="ml-3 mt-5">
                Cancel
              </Button>
            </section>
          )}
          {["orders", "payments"].includes(section) && (
            <section className="mt-6 space-y-3">
              {(section === "orders" ? data.orders : data.payments)
                .filter((record) =>
                  JSON.stringify(record).toLowerCase().includes(query.toLowerCase()),
                )
                .map((record) => (
                  <pre
                    key={String(record.id)}
                    className="overflow-auto rounded-xl border border-border p-4 text-xs"
                  >
                    {JSON.stringify(record, null, 2)}
                  </pre>
                ))}
              {(section === "orders" ? data.orders : data.payments).length === 0 && (
                <p className="text-muted-foreground">
                  No {section} have been recorded. Missing payment setup is never simulated.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

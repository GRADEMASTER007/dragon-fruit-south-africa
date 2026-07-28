import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PRODUCTS, CATEGORIES, formatZAR, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import sweetWhiteAsset from "@/assets/sweet-white-crystal.jpg.asset.json";
import rubyAsset from "@/assets/ruby.jpg.asset.json";
import blackDragonAsset from "@/assets/black-dragon-africana.jpg.asset.json";

const CATEGORY_IMAGES: Record<string, string> = {
  "Sweet White Crystal": sweetWhiteAsset.url,
  "Ruby": rubyAsset.url,
  "Black Dragon": blackDragonAsset.url,
};

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Dragon Fruit Plants & Cultivars · DFSA" },
      { name: "description", content: "Buy premium dragon fruit plants online — Sweet White Crystal, Ruby, Black Dragon Africana Hybrid, rare cultivars, cuttings & commercial trays." },
      { property: "og:title", content: "Shop Dragon Fruit Cultivars · DFSA" },
      { property: "og:description", content: "Commercial trays, rare cultivars and cuttings. Worldwide export." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const { add } = useCart();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!s) return true;
      return p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s);
    });
  }, [q, cat]);

  const handleAdd = (p: Product) => {
    add(p, 1);
    toast.success("Added to cart", { description: p.name });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Shop</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Dragon Fruit Plants & Cultivars</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {PRODUCTS.length} products · Commercial trays, rare cultivars, cuttings, services & memberships. Prices in ZAR.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.sku} className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
            <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">{p.category}</Badge>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{p.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">SKU: {p.sku}</p>
            <div className="mt-auto pt-4">
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl font-semibold text-primary">{formatZAR(p.price)}</span>
                <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
              </div>
              <Button
                onClick={() => handleAdd(p)}
                className="mt-4 w-full bg-gradient-fruit text-white shadow-sm hover:opacity-95"
              >
                <Plus className="mr-1 h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          No products match your search.
        </div>
      )}
    </div>
  );
}

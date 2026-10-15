import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatZAR, type Product } from "@/lib/products";
import { getCatalogue } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  loader: () => getCatalogue(),
  head: () => ({
    meta: [
      { title: "Shop Dragon Fruit Plants & Cultivars · DFSA" },
      {
        name: "description",
        content:
          "Buy dragon fruit plants and commercial trays. Browse Sweet White Crystal, Ruby, rare cultivars, cuttings and grower services. Prices in ZAR.",
      },
      { property: "og:title", content: "Shop Dragon Fruit Cultivars · DFSA" },
      {
        property: "og:description",
        content:
          "Commercial trays, cultivars and cuttings from South Africa. Request export quotations.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const products = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name");
  const { add, items, busy, loading } = useCart();
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          (category === "All" || product.category === category) &&
          (!search || `${product.name} ${product.sku}`.toLowerCase().includes(search)),
      )
      .sort((a, b) =>
        sort === "low"
          ? a.price - b.price
          : sort === "high"
            ? b.price - a.price
            : a.name.localeCompare(b.name),
      );
  }, [products, query, category, sort]);

  const handleAdd = async (product: Product) => {
    const quantity = items.find((item) => item.sku === product.sku)?.qty || 0;
    if (quantity >= product.stock)
      return toast.error("The cart already contains the available quantity.");
    if (await add(product, 1)) toast.success("Saved to your cart", { description: product.name });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          The DFSA collection
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          Dragon Fruit Plants & Cultivars
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {products.length} products · Commercial trays, cultivars, cuttings and grower services.
          Prices in ZAR.
        </p>
      </div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search products or SKU"
            placeholder="Search products or SKU…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="name">Name: A to Z</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Product categories">
        {["All", ...categories].map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${category === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} matching products
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <article
            key={product.sku}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/40"
          >
            <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">
              {product.category}
            </Badge>
            <h2 className="mt-3 font-display text-lg font-semibold leading-snug">{product.name}</h2>
            <p className="mt-2 text-xs text-muted-foreground">SKU: {product.sku}</p>
            <div className="mt-auto pt-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <span className="font-display text-2xl font-semibold text-primary">
                  {formatZAR(product.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
              <Button
                disabled={product.stock <= 0 || busy || loading}
                onClick={() => handleAdd(product)}
                className="mt-4 w-full bg-gradient-fruit text-white"
              >
                <Plus className="mr-1 h-4 w-4" /> Add to cart
              </Button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          No products match. Try another search or category.
        </div>
      )}
    </div>
  );
}

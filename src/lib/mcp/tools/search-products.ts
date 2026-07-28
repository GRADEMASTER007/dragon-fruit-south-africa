import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUCTS, formatZAR } from "@/lib/products";

export default defineTool({
  name: "search_products",
  title: "Search dragon fruit products",
  description:
    "Search the DFSA product catalog (plants, cuttings, trays, cultivars, services, memberships). Matches on product name, SKU, or category. Prices in ZAR.",
  inputSchema: {
    query: z.string().describe("Free-text search — matches name, SKU, or category (e.g. 'ruby', 'FARM-500', 'cutting').").optional(),
    category: z.string().describe("Optional exact category filter, e.g. 'Ruby', 'Cuttings', 'Consultation'.").optional(),
    limit: z.number().int().describe("Maximum number of results to return. Default 20, max 100.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, limit }) => {
    const q = (query ?? "").trim().toLowerCase();
    const cap = Math.min(Math.max(limit ?? 20, 1), 100);
    const matches = PRODUCTS.filter((p) => {
      if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }).slice(0, cap);

    return {
      content: [
        {
          type: "text",
          text:
            matches.length === 0
              ? "No products matched."
              : matches
                  .map((p) => `${p.name} · ${p.sku} · ${formatZAR(p.price)} · ${p.stock} in stock · ${p.category}`)
                  .join("\n"),
        },
      ],
      structuredContent: {
        total: matches.length,
        products: matches,
      },
    };
  },
});

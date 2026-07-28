import { defineTool } from "@lovable.dev/mcp-js";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

export default defineTool({
  name: "list_categories",
  title: "List product categories",
  description: "List all DFSA product categories with the number of products in each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const counts = CATEGORIES.map((c) => ({
      category: c,
      count: PRODUCTS.filter((p) => p.category === c).length,
    })).sort((a, b) => b.count - a.count);
    return {
      content: [
        { type: "text", text: counts.map((c) => `${c.category} — ${c.count} product(s)`).join("\n") },
      ],
      structuredContent: { categories: counts, total: PRODUCTS.length },
    };
  },
});

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUCTS, formatZAR } from "@/lib/products";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description: "Fetch a single dragon fruit product by its SKU. Returns price, stock, and category.",
  inputSchema: {
    sku: z.string().describe("Exact product SKU, e.g. 'FARM-500-SW' or 'DFSA-MEM-12M-104'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ sku }) => {
    const p = PRODUCTS.find((x) => x.sku.toLowerCase() === sku.toLowerCase());
    if (!p) {
      return { content: [{ type: "text", text: `No product with SKU ${sku}` }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: `${p.name}\nSKU: ${p.sku}\nPrice: ${formatZAR(p.price)}\nStock: ${p.stock}\nCategory: ${p.category}`,
        },
      ],
      structuredContent: { product: p },
    };
  },
});

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUCTS, formatZAR } from "@/lib/products";

export default defineTool({
  name: "quote_order",
  title: "Quote a dragon fruit order",
  description:
    "Build a price quote from a list of SKUs and quantities. Returns line totals and a grand total in ZAR. Read-only — does not place an order.",
  inputSchema: {
    items: z
      .array(
        z.object({
          sku: z.string().describe("Product SKU"),
          qty: z.number().int().describe("Quantity, minimum 1"),
        }),
      )
      .describe("Line items to price"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ items }) => {
    const lines: Array<{ sku: string; name?: string; qty: number; price?: number; lineTotal?: number; error?: string }> = [];
    let total = 0;
    for (const it of items) {
      const p = PRODUCTS.find((x) => x.sku.toLowerCase() === it.sku.toLowerCase());
      const qty = Math.max(1, Math.floor(it.qty));
      if (!p) {
        lines.push({ sku: it.sku, qty, error: "Unknown SKU" });
        continue;
      }
      const lineTotal = p.price * qty;
      total += lineTotal;
      lines.push({ sku: p.sku, name: p.name, qty, price: p.price, lineTotal });
    }
    const text = [
      ...lines.map((l) =>
        l.error
          ? `${l.sku} × ${l.qty} — ${l.error}`
          : `${l.name} (${l.sku}) × ${l.qty} = ${formatZAR(l.lineTotal!)}`,
      ),
      `\nTotal: ${formatZAR(total)}`,
    ].join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { lines, total, currency: "ZAR" },
    };
  },
});

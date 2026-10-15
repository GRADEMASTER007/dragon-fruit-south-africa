import { z } from "zod";
import { catalogue } from "./store";
import { formatZAR } from "../lib/products";
import { json, readInput } from "./http";

const annotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };
export const catalogueTools = [
  {
    name: "search_products",
    description: "Search public DFSA products by name, SKU or category. Prices in ZAR.",
    annotations,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", maxLength: 300 },
        category: { type: "string", maxLength: 100 },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_product",
    description: "Get public product price, category and stock by SKU.",
    annotations,
    inputSchema: {
      type: "object",
      properties: { sku: { type: "string", maxLength: 100 } },
      required: ["sku"],
      additionalProperties: false,
    },
  },
  {
    name: "list_categories",
    description: "List current public catalogue categories and counts.",
    annotations,
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "quote_order",
    description:
      "Estimate a hypothetical product selection in ZAR. Read-only: does not place an order or save a quotation.",
    annotations,
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          maxItems: 150,
          items: {
            type: "object",
            properties: {
              sku: { type: "string", maxLength: 100 },
              qty: { type: "integer", minimum: 1, maximum: 10000 },
            },
            required: ["sku", "qty"],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    },
  },
];

export async function callCatalogueTool(name: string, input: unknown = {}) {
  const products = await catalogue();
  let result: unknown;
  if (name === "search_products") {
    const params = z
      .object({
        query: z.string().max(300).optional(),
        category: z.string().max(100).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .strict()
      .parse(input);
    const query = params.query?.trim().toLowerCase() || "";
    const matches = products.filter(
      (product) =>
        (!params.category || product.category.toLowerCase() === params.category.toLowerCase()) &&
        (!query ||
          `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query)),
    );
    result = { total: matches.length, products: matches.slice(0, params.limit || 20) };
  } else if (name === "get_product") {
    const { sku } = z
      .object({ sku: z.string().min(1).max(100) })
      .strict()
      .parse(input);
    const product = products.find((product) => product.sku.toLowerCase() === sku.toLowerCase());
    if (!product)
      return { content: [{ type: "text", text: "Unknown product SKU." }], isError: true };
    result = { product };
  } else if (name === "list_categories") {
    z.object({}).strict().parse(input);
    const categories = Array.from(new Set(products.map((product) => product.category))).map(
      (category) => ({
        category,
        count: products.filter((product) => product.category === category).length,
      }),
    );
    result = { categories, total: products.length };
  } else if (name === "quote_order") {
    const { items } = z
      .object({
        items: z
          .array(
            z
              .object({ sku: z.string().min(1).max(100), qty: z.number().int().min(1).max(10000) })
              .strict(),
          )
          .min(1)
          .max(150),
      })
      .strict()
      .parse(input);
    const lines = items.map((line) => {
      const product = products.find(
        (product) => product.sku.toLowerCase() === line.sku.toLowerCase(),
      );
      if (!product) throw new Error("Unknown product SKU.");
      return {
        sku: product.sku,
        name: product.name,
        qty: line.qty,
        price: product.price,
        lineTotal: (Math.round(product.price * 100) * line.qty) / 100,
      };
    });
    const total = lines.reduce((sum, line) => sum + Math.round(line.lineTotal * 100), 0) / 100;
    result = {
      lines,
      total,
      displayTotal: formatZAR(total),
      currency: "ZAR",
      estimateOnly: true,
      excludesShipping: true,
    };
  } else throw new Error("Unknown tool.");
  return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
}

export async function handleCatalogueMcp(request: Request) {
  const path = new URL(request.url).pathname;
  if (path === "/.mcp/list-tools" && request.method === "GET")
    return json({ tools: catalogueTools });
  if (request.method !== "POST") return json({ error: "Use a JSON POST request." }, 405);
  try {
    const input = await readInput(request);
    if (path.startsWith("/.mcp/invoke-tool/"))
      return json(await callCatalogueTool(decodeURIComponent(path.split("/").pop() || ""), input));
    const body = z
      .object({
        jsonrpc: z.string().optional(),
        id: z.union([z.string(), z.number(), z.null()]).optional(),
        method: z.string().optional(),
        params: z.object({ name: z.string(), arguments: z.unknown().optional() }).optional(),
      })
      .passthrough()
      .parse(input);
    const id = body.id ?? null;
    if (body.jsonrpc !== "2.0" || typeof body.method !== "string")
      return json(
        { jsonrpc: "2.0", id, error: { code: -32600, message: "Invalid request." } },
        400,
      );
    if (body.id === undefined) return new Response(null, { status: 202 });
    let result: unknown;
    if (body.method === "initialize")
      result = {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "dfsa-mcp", version: "1.0.0" },
        instructions:
          "Public catalogue from Manus native storage. Tools are read-only and do not take payments or place orders.",
      };
    else if (body.method === "ping") result = {};
    else if (body.method === "tools/list") result = { tools: catalogueTools };
    else if (body.method === "tools/call") {
      try {
        if (!body.params?.name) throw new Error("Tool name is required.");
        result = await callCatalogueTool(body.params?.name, body.params?.arguments || {});
      } catch {
        result = {
          content: [
            {
              type: "text",
              text: "The tool arguments are invalid or the catalogue is temporarily unavailable.",
            },
          ],
          isError: true,
        };
      }
    } else
      return json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found." } });
    return json({ jsonrpc: "2.0", id, result });
  } catch {
    return json({ error: "Invalid request or catalogue temporarily unavailable." }, 400);
  }
}

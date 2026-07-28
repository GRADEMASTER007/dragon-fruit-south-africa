import { defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listCategories from "./tools/list-categories";
import quoteOrder from "./tools/quote-order";

export default defineMcp({
  name: "dfsa-mcp",
  title: "Dragon Fruit South Africa",
  version: "0.1.0",
  instructions:
    "Public MCP for Dragon Fruit South Africa (DFSA). Use these tools to browse the DFSA plant catalog: search products by name/SKU/category, look up a single product by SKU, list product categories, and build a price quote for a hypothetical order. All data is public product catalog information; no authentication is required. Prices are in South African Rand (ZAR).",
  tools: [searchProducts, getProduct, listCategories, quoteOrder],
});

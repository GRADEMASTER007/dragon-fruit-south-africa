import { writeFile } from "node:fs/promises";

const base = process.argv[2];
if (!base || !/^https?:\/\//.test(base)) throw new Error("Supply an actual observed app origin.");
const checks: Record<string, unknown>[] = [];
async function request(path: string, expected: number, init: RequestInit = {}) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  if (response.status !== expected)
    throw new Error(`${path}: expected ${expected}, received ${response.status}.`);
  checks.push({ path, status: response.status, bytes: Buffer.byteLength(text), passed: true });
  return { text, headers: response.headers };
}
async function main() {
  const health = await request("/api/health", 200);
  if (JSON.parse(health.text).database !== "Manus native")
    throw new Error("Native database health declaration missing.");
  const products = JSON.parse((await request("/api/products", 200)).text).products;
  if (products.length !== 141) throw new Error("Expected original 141-SKU catalogue.");
  const shop = await request("/shop", 200);
  if (
    !shop.text.includes("SWEET-WHITE-CRYSTAL") ||
    !shop.text.includes("FARM-1000-SW") ||
    !/<h1/.test(shop.text)
  )
    throw new Error("Native catalogue is absent from initial shop HTML.");
  const blog = await request("/blog", 200);
  if (!blog.text.includes("The grower"))
    throw new Error("Editorial listing is absent from initial HTML.");
  const links = [...blog.text.matchAll(/href="(\/blog\/[^"?#]+)"/g)].map((match) => match[1]);
  if (!links.length) throw new Error("No native article links in HTML.");
  const article = await request(links[0], 200);
  if (!article.text.includes("DFSA editorial"))
    throw new Error("Native article absent from initial HTML.");
  await request("/blog/qa-missing-article", 404);
  await request("/qa-missing-page", 404);
  const routes = JSON.parse((await request("/manus-routes.json", 200)).text).routes;
  if (
    routes.length !== 18 ||
    !routes.some((route: { path: string }) => route.path === "/blog/:slug")
  )
    throw new Error("Page manifest does not match current routes.");
  await request("/api/admin/overview", 401);
  await request("/api/admin/payment-settings", 401);
  await request("/api/admin/export", 401);
  await request("/api/orders/qa-missing-order", 404);
  await request("/api/contact", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base, "X-DFSA-Origin": base },
    body: JSON.stringify({ name: "", email: "bad", message: "" }),
  });
  await request("/api/contact", 403, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://untrusted.example.invalid" },
    body: "{}",
  });
  await request("/api/contact", 403, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      "X-DFSA-Origin": base,
      "Sec-Fetch-Site": "cross-site",
    },
    body: "{}",
  });
  const payments = JSON.parse((await request("/api/payment-options", 200)).text);
  if (payments.gateways.length)
    throw new Error("Unexpected enabled payment option during credential-blocked validation.");
  await request("/api/webhooks/yoco", 503, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const summary = {
    checkedAt: new Date().toISOString(),
    base,
    noBusinessRecordsFabricated: true,
    catalogueCount: products.length,
    gatewayOptions: 0,
    checks,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(summary, null, 2) + "\n");
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

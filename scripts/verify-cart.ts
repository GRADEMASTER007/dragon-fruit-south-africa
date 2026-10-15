const base = process.argv[2];
if (!base || !base.startsWith("https://"))
  throw new Error("Supply the exact observed HTTPS app origin.");
async function main() {
  let cookie = "";
  const stock = async () => {
    const response = await fetch(`${base}/api/products`);
    const data = await response.json();
    return data.products.find((product: { sku: string }) => product.sku === "DF-WC-001").stock;
  };
  const initialStock = await stock();
  async function mutate(body: unknown) {
    const response = await fetch(`${base}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: base,
        "X-DFSA-Origin": base,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
    const savedCookie = response.headers.get("set-cookie");
    if (savedCookie) cookie = savedCookie.split(";")[0];
    return { response, data: await response.json() };
  }
  const added = await mutate({ operation: "add", sku: "DF-WC-001", qty: 1 });
  if (!added.response.ok || !cookie || added.data.items.length !== 1)
    throw new Error("Native QA cart could not be saved.");
  const loaded = await fetch(`${base}/api/cart`, { headers: { Cookie: cookie } }).then((response) =>
    response.json(),
  );
  if (loaded.items[0]?.sku !== "DF-WC-001" || loaded.items[0]?.qty !== 1)
    throw new Error("Native cart did not persist across independent requests.");
  const other = await fetch(`${base}/api/cart`).then((response) => response.json());
  if (other.items.length !== 0) throw new Error("Guest isolation failed.");
  const invalid = await mutate({ operation: "set", sku: "DF-WC-001", qty: 10000 });
  if (invalid.response.status !== 400) throw new Error("Overstock cart mutation was not rejected.");
  const cleared = await mutate({ operation: "clear" });
  if (!cleared.response.ok || cleared.data.items.length)
    throw new Error("Temporary anonymous QA basket could not be cleared.");
  if (initialStock !== (await stock())) throw new Error("Cart test modified product stock.");
  console.log(
    JSON.stringify(
      {
        base,
        nativeCartWrite: true,
        persistedAcrossRequests: true,
        isolatedFromOtherGuest: true,
        overstockRejected: true,
        temporaryQaBasketCleared: true,
        productStockUnchanged: true,
        noCustomerOrderOrPaymentCreated: true,
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

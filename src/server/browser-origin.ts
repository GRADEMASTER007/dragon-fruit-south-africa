export function acceptedBrowserOrigin(request: Request, allowed: readonly string[]): string | null {
  const declared = request.headers.get("x-dfsa-origin");
  const origin = request.headers.get("origin");
  if (
    !declared ||
    !allowed.includes(declared) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return null;
  // Preview rebases Origin to its internal listener. This custom header is sent only
  // by our same-origin JSON client; cross-site scripts cannot add it without CORS
  // preflight, and this app never grants cross-origin API access.
  const internalRequestOrigin = new URL(request.url).origin;
  return origin === declared || origin === internalRequestOrigin ? declared : null;
}

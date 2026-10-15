import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function constantEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function decimalCents(value: string): number {
  if (!/^(0|[1-9]\d{0,8})\.\d{2}$/.test(value)) throw new Error("Invalid monetary amount.");
  const [whole, fraction] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction);
  if (!Number.isSafeInteger(cents)) throw new Error("Invalid monetary amount.");
  return cents;
}

export function payfastEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}
export function payfastParameters(fields: [string, string][]) {
  return fields
    .filter(([name, value]) => name !== "signature" && value !== "")
    .map(([name, value]) => `${name}=${payfastEncode(value)}`)
    .join("&");
}
export function payfastSignature(fields: [string, string][], passphrase: string) {
  const parameters = payfastParameters(fields);
  return createHash("md5")
    .update(`${parameters}${passphrase ? `&passphrase=${payfastEncode(passphrase)}` : ""}`)
    .digest("hex");
}
export function verifyYoco(
  raw: Uint8Array,
  headers: Headers,
  secret: string,
  now = Math.floor(Date.now() / 1000),
) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (
    !id ||
    !timestamp ||
    !signatures ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 180 ||
    !secret.startsWith("whsec_")
  )
    return false;
  const expected = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
    .update(`${id}.${timestamp}.`)
    .update(raw)
    .digest("base64");
  return signatures.split(/\s+/).some((entry) => {
    const [version, value] = entry.split(",", 2);
    return version === "v1" && Boolean(value) && constantEqual(value, expected);
  });
}

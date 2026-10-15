import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  constantEqual,
  decimalCents,
  payfastEncode,
  payfastParameters,
  payfastSignature,
  verifyYoco,
} from "../src/server/payment-security";
import { readInput } from "../src/server/http";

const raw = new TextEncoder().encode('{"id":"test-fixture","type":"payment.succeeded"}');
const secretBytes = Buffer.from("unit-test-fixture-not-a-merchant-secret");
const secret = `whsec_${secretBytes.toString("base64")}`;
function yocoHeaders(timestamp = 100000, body = raw) {
  const signature = createHmac("sha256", secretBytes)
    .update(`fixture-webhook.${timestamp}.`)
    .update(body)
    .digest("base64");
  return new Headers({
    "webhook-id": "fixture-webhook",
    "webhook-timestamp": String(timestamp),
    "webhook-signature": `v1,${signature}`,
  });
}

describe("payment security fixtures, not real transactions", () => {
  it("uses PHP-compatible PayFast form encoding", () =>
    expect(payfastEncode("Fixture & !'()*~")).toBe("Fixture+%26+%21%27%28%29%2A%7E"));
  it("preserves PayFast documentation order and excludes signature and empty fields", () =>
    expect(
      payfastParameters([
        ["merchant_id", "10000100"],
        ["amount", "10.00"],
        ["empty", ""],
        ["item_name", "Fixture & Test"],
        ["signature", "ignored"],
      ]),
    ).toBe("merchant_id=10000100&amount=10.00&item_name=Fixture+%26+Test"));
  it("appends PayFast passphrase last before hashing", () =>
    expect(
      payfastSignature(
        [
          ["merchant_id", "10000100"],
          ["amount", "10.00"],
          ["item_name", "Fixture & Test"],
        ],
        "fixture-secret",
      ),
    ).toBe(
      createHash("md5")
        .update(
          "merchant_id=10000100&amount=10.00&item_name=Fixture+%26+Test&passphrase=fixture-secret",
        )
        .digest("hex"),
    ));
  it("converts exact decimals into integer cents", () =>
    expect(decimalCents("1799.97")).toBe(179997));
  it.each(["1", "1.0", "1.999", "-1.00", "1e2", "NaN", "Infinity", " 1.00", "01.00"])(
    "rejects noncanonical money %s",
    (value) => expect(() => decimalCents(value)).toThrow(),
  );
  it("compares equal values safely", () => expect(constantEqual("fixed", "fixed")).toBe(true));
  it("rejects values with unequal length", () => expect(constantEqual("a", "ab")).toBe(false));
  it("verifies a current authentic Yoco raw-body signature", () =>
    expect(verifyYoco(raw, yocoHeaders(), secret, 100000)).toBe(true));
  it("rejects forged Yoco signatures", () => {
    const headers = yocoHeaders();
    headers.set("webhook-signature", "v1,forged");
    expect(verifyYoco(raw, headers, secret, 100000)).toBe(false);
  });
  it("rejects modified Yoco body bytes", () =>
    expect(verifyYoco(new TextEncoder().encode("{}"), yocoHeaders(), secret, 100000)).toBe(false));
  it("rejects stale and future Yoco timestamps", () => {
    expect(verifyYoco(raw, yocoHeaders(), secret, 100181)).toBe(false);
    expect(verifyYoco(raw, yocoHeaders(), secret, 99819)).toBe(false);
  });
  it("rejects missing Yoco headers or malformed secret", () => {
    expect(verifyYoco(raw, new Headers(), secret, 100000)).toBe(false);
    expect(verifyYoco(raw, yocoHeaders(), "not-a-webhook-secret", 100000)).toBe(false);
  });
  it("accepts any valid v1 signature during signature rotation", () => {
    const headers = yocoHeaders();
    headers.set("webhook-signature", `v1,invalid ${headers.get("webhook-signature")}`);
    expect(verifyYoco(raw, headers, secret, 100000)).toBe(true);
  });
});

describe("bounded native JSON requests", () => {
  it("reads valid bounded JSON", async () =>
    expect(
      await readInput(
        new Request("https://fixture.invalid/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: '{"fixture":true}',
        }),
      ),
    ).toEqual({ fixture: true }));
  it("rejects invalid JSON", async () =>
    expect(
      readInput(
        new Request("https://fixture.invalid/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "bad",
        }),
      ),
    ).rejects.toThrow("invalid JSON"));
  it("rejects incorrect content types", async () =>
    expect(
      readInput(new Request("https://fixture.invalid/api", { method: "POST", body: "{}" })),
    ).rejects.toThrow("JSON request"));
  it("bounds actual streamed body size without relying on content-length", async () =>
    expect(
      readInput(
        new Request("https://fixture.invalid/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: '"' + "x".repeat(50001) + '"',
        }),
      ),
    ).rejects.toThrow("too large"));
});

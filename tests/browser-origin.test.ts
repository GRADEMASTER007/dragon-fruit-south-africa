import { describe, expect, it } from "vitest";
import { acceptedBrowserOrigin } from "../src/server/browser-origin";
import { decodeJsonValue, validApplicationOrigin } from "../src/server/json-value";
const publicOrigin = "https://store.example.invalid";
function request(headers: Record<string, string>, internal = "http://127.0.0.1:3000") {
  return new Request(`${internal}/api/contact`, { method: "POST", headers });
}
describe("explicit public-origin and native JSON handling", () => {
  it("accepts a decoded native JSON string primitive", () =>
    expect(decodeJsonValue(publicOrigin)).toBe(publicOrigin));
  it("accepts a serialized native JSON string primitive", () =>
    expect(decodeJsonValue(JSON.stringify(publicOrigin))).toBe(publicOrigin));
  it("never treats arbitrary text as an application origin", () =>
    expect(validApplicationOrigin("not a URL")).toBe(false));
  it("rejects origins with credentials, paths, non-HTTPS or outer whitespace", () => {
    for (const value of [
      "http://store.example.invalid",
      `${publicOrigin}/path`,
      ` ${publicOrigin}`,
      "https://user:pass@store.example.invalid",
    ])
      expect(validApplicationOrigin(value)).toBe(false);
  });
  it("requires an explicit same-origin client header", () =>
    expect(acceptedBrowserOrigin(request({ Origin: publicOrigin }), [publicOrigin])).toBeNull());
  it("allows the normal published same-origin request", () =>
    expect(
      acceptedBrowserOrigin(
        request(
          { Origin: publicOrigin, "X-DFSA-Origin": publicOrigin, "Sec-Fetch-Site": "same-origin" },
          publicOrigin,
        ),
        [publicOrigin],
      ),
    ).toBe(publicOrigin));
  it("allows the observed Preview Origin rewrite without using it as a public URL", () =>
    expect(
      acceptedBrowserOrigin(
        request({
          Origin: "http://127.0.0.1:3000",
          "X-DFSA-Origin": publicOrigin,
          "Sec-Fetch-Site": "same-origin",
        }),
        [publicOrigin],
      ),
    ).toBe(publicOrigin));
  it("rejects an untrusted declared public origin", () =>
    expect(
      acceptedBrowserOrigin(
        request({ Origin: "http://127.0.0.1:3000", "X-DFSA-Origin": "https://attacker.invalid" }),
        [publicOrigin],
      ),
    ).toBeNull());
  it("rejects cross-site writes even when an attacker declares a known origin", () =>
    expect(
      acceptedBrowserOrigin(
        request({
          Origin: "http://127.0.0.1:3000",
          "X-DFSA-Origin": publicOrigin,
          "Sec-Fetch-Site": "cross-site",
        }),
        [publicOrigin],
      ),
    ).toBeNull());
  it("fails closed on a fresh schema with no configured origins", () =>
    expect(
      acceptedBrowserOrigin(request({ Origin: publicOrigin, "X-DFSA-Origin": publicOrigin }), []),
    ).toBeNull());
});

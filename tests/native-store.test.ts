import { describe, expect, it } from "vitest";
import { contactSchema, quoteSchema } from "../src/lib/store-api";
import { PRODUCTS } from "../src/lib/products";

const validQuote = {
  name: "Explicit test fixture",
  email: "fixture@example.invalid",
  address_line1: "Test fixture address, not a delivery",
  city: "Fixture city",
  country: "South Africa",
  shipping_method: "pickup",
  items: [{ sku: "DF-WC-001", qty: 1 }],
};

describe("native persistence input validation (no database writes)", () => {
  it("validates and trims a contact request", () => {
    const data = contactSchema.parse({
      name: " Fixture ",
      email: "fixture@example.invalid",
      message: " Test fixture ",
    });
    expect(data.name).toBe("Fixture");
    expect(data.message).toBe("Test fixture");
  });
  it("rejects malformed emails", () => {
    expect(
      contactSchema.safeParse({ name: "Fixture", email: "not-an-email", message: "Fixture" })
        .success,
    ).toBe(false);
  });
  it("rejects empty contact names", () => {
    expect(
      contactSchema.safeParse({ name: "  ", email: "fixture@example.invalid", message: "Fixture" })
        .success,
    ).toBe(false);
  });
  it("rejects oversized contact messages", () => {
    expect(
      contactSchema.safeParse({
        name: "Fixture",
        email: "fixture@example.invalid",
        message: "x".repeat(5001),
      }).success,
    ).toBe(false);
  });
  it("rejects extra fields that could alter a status or role", () => {
    expect(
      contactSchema.safeParse({
        name: "Fixture",
        email: "fixture@example.invalid",
        message: "Fixture",
        status: "paid",
      }).success,
    ).toBe(false);
  });
  it("accepts a valid quotation and supplies optional defaults", () => {
    expect(quoteSchema.parse(validQuote).phone).toBe("");
  });
  it("rejects empty quotations", () => {
    expect(quoteSchema.safeParse({ ...validQuote, items: [] }).success).toBe(false);
  });
  it.each([0, -1, 1.5, 10001, NaN])("rejects invalid quantity %s", (qty) => {
    expect(
      quoteSchema.safeParse({ ...validQuote, items: [{ sku: "DF-WC-001", qty }] }).success,
    ).toBe(false);
  });
  it("rejects duplicate quotation SKUs", () => {
    expect(
      quoteSchema.safeParse({
        ...validQuote,
        items: [
          { sku: "DF-WC-001", qty: 1 },
          { sku: "DF-WC-001", qty: 2 },
        ],
      }).success,
    ).toBe(false);
  });
  it("rejects client-supplied quote pricing", () => {
    expect(
      quoteSchema.safeParse({ ...validQuote, items: [{ sku: "DF-WC-001", qty: 1, unit_price: 0 }] })
        .success,
    ).toBe(false);
  });
  it("rejects arbitrary shipping methods", () => {
    expect(
      quoteSchema.safeParse({ ...validQuote, shipping_method: "free-everywhere" }).success,
    ).toBe(false);
  });
});

describe("the original, owner-supplied product catalogue", () => {
  it("contains 141 unique product SKUs", () => {
    expect(PRODUCTS).toHaveLength(141);
    expect(new Set(PRODUCTS.map((product) => product.sku)).size).toBe(141);
  });
  it("contains only non-negative monetary values and stock quantities", () => {
    for (const product of PRODUCTS) {
      expect(product.price).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(product.stock)).toBe(true);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(Number.isSafeInteger(Math.round(product.price * 100))).toBe(true);
    }
  });
  it("preserves the supplied non-round cutting price", () => {
    expect(PRODUCTS.find((product) => product.sku === "DF-BDDFC-085")?.price).toBe(1799.97);
  });
});

import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { database, rows, transaction } from "./database";
import { contactSchema, quoteSchema } from "../lib/store-api";
import type { Product } from "../lib/products";

interface ProductRow extends RowDataPacket {
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  stock: number;
}

export async function catalogue(): Promise<Product[]> {
  const products = await rows<ProductRow>(
    "SELECT sku, name, category, price_cents, stock FROM products WHERE active = TRUE ORDER BY category, name, sku",
  );
  return products.map((product) => ({
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: Number(product.price_cents) / 100,
    stock: Number(product.stock),
  }));
}

export async function saveContact(input: unknown) {
  const data = contactSchema.parse(input);
  const id = randomUUID();
  await database().execute(
    "INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)",
    [id, data.name, data.email, data.message],
  );
  return { id, message: "Your message is saved for the DFSA team." };
}

export async function saveQuote(input: unknown) {
  const data = quoteSchema.parse(input);
  const id = randomUUID();
  const reference = `DFSA-Q-${randomUUID().slice(0, 12).replaceAll("-", "").toUpperCase()}`;
  await transaction(async (connection) => {
    const enriched = [];
    for (const line of data.items) {
      const [product] = await connection.execute<ProductRow[]>(
        "SELECT sku, name, category, price_cents, stock FROM products WHERE sku = ? AND active = TRUE",
        [line.sku],
      );
      if (!product.length)
        throw new Error(
          "One of your selected products is unavailable. Please refresh the catalogue.",
        );
      enriched.push({ ...line, product: product[0] });
    }
    await connection.execute(
      `INSERT INTO quote_requests (id, reference, name, email, phone, company, address_line1, address_line2, city, province, postal_code, country, shipping_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        reference,
        data.name,
        data.email,
        data.phone,
        data.company,
        data.address_line1,
        data.address_line2,
        data.city,
        data.province,
        data.postal_code,
        data.country,
        data.shipping_method,
        data.notes,
      ],
    );
    for (const line of enriched)
      await connection.execute(
        "INSERT INTO quote_items (id, quote_id, sku, name, quantity, unit_price_cents) VALUES (?, ?, ?, ?, ?, ?)",
        [randomUUID(), id, line.sku, line.product.name, line.qty, line.product.price_cents],
      );
  });
  return { id, reference, message: "Your quotation request is saved for review." };
}

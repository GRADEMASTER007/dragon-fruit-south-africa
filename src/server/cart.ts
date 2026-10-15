import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { rows, transaction } from "./database";
import { json } from "./http";

const mutation = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("add"),
      sku: z.string().min(1).max(100),
      qty: z.number().int().min(1).max(10000),
    })
    .strict(),
  z
    .object({
      operation: z.literal("set"),
      sku: z.string().min(1).max(100),
      qty: z.number().int().min(0).max(10000),
    })
    .strict(),
  z.object({ operation: z.literal("remove"), sku: z.string().min(1).max(100) }).strict(),
  z.object({ operation: z.literal("clear") }).strict(),
  z.object({ operation: z.literal("acknowledge_notice") }).strict(),
]);

function guestToken(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("dfsa_guest="))
    ?.slice("dfsa_guest=".length);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function verifiedGuestHash(request: Request): Promise<string | undefined> {
  const token = guestToken(request);
  if (!token) return undefined;
  const hash = digest(token);
  const session = await rows<RowDataPacket>(
    "SELECT token_hash FROM guest_sessions WHERE token_hash = ? AND expires_at > NOW()",
    [hash],
  );
  return session.length ? hash : undefined;
}

async function cartItems(hash: string) {
  const result = await rows<RowDataPacket>(
    `SELECT p.sku, p.name, p.price_cents, p.stock, c.quantity FROM cart_items c
    JOIN guest_sessions s ON s.token_hash = c.session_hash JOIN products p ON p.sku = c.sku
    WHERE c.session_hash = ? AND s.expires_at > NOW() AND p.active = TRUE ORDER BY p.name`,
    [hash],
  );
  return result.map((item) => ({
    sku: item.sku as string,
    name: item.name as string,
    price: Number(item.price_cents) / 100,
    qty: Number(item.quantity),
    stock: Number(item.stock),
  }));
}

export async function handleCart(request: Request, input?: unknown) {
  let token = guestToken(request);
  if (request.method === "GET") {
    if (await verifiedGuestHash(request)) return json({ items: await cartItems(digest(token!)) });
    token = randomBytes(32).toString("hex");
    await transaction(async (connection) => {
      await connection.execute(
        "INSERT INTO guest_sessions (token_hash, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 90 DAY))",
        [digest(token!)],
      );
    });
    const response = json({ items: [] });
    response.headers.set(
      "Set-Cookie",
      `dfsa_guest=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=7776000`,
    );
    return response;
  }
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const data = mutation.parse(input);
  let fresh = false;
  if (token) {
    const session = await rows<RowDataPacket>(
      "SELECT token_hash FROM guest_sessions WHERE token_hash = ? AND expires_at > NOW()",
      [digest(token)],
    );
    if (!session.length) token = undefined;
  }
  if (!token) {
    token = randomBytes(32).toString("hex");
    fresh = true;
  }
  const hash = digest(token);
  await transaction(async (connection) => {
    if (fresh)
      await connection.execute(
        "INSERT INTO guest_sessions (token_hash, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 90 DAY))",
        [hash],
      );
    await connection.execute(
      "SELECT token_hash FROM guest_sessions WHERE token_hash = ? FOR UPDATE",
      [hash],
    );
    if (data.operation === "acknowledge_notice") {
      await connection.execute(
        "INSERT INTO guest_preferences (session_hash, notice_acknowledged) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE notice_acknowledged = TRUE",
        [hash],
      );
      return;
    }
    if (data.operation === "clear") {
      await connection.execute("DELETE FROM cart_items WHERE session_hash = ?", [hash]);
      return;
    }
    if (data.operation === "remove" || (data.operation === "set" && data.qty === 0)) {
      await connection.execute("DELETE FROM cart_items WHERE session_hash = ? AND sku = ?", [
        hash,
        data.sku,
      ]);
      return;
    }
    const [product] = await connection.execute<RowDataPacket[]>(
      "SELECT stock FROM products WHERE sku = ? AND active = TRUE FOR UPDATE",
      [data.sku],
    );
    if (!product.length) throw new Error("This product is no longer available.");
    const [current] = await connection.execute<RowDataPacket[]>(
      "SELECT quantity FROM cart_items WHERE session_hash = ? AND sku = ?",
      [hash, data.sku],
    );
    const qty = data.operation === "add" ? Number(current[0]?.quantity || 0) + data.qty : data.qty;
    if (qty > Number(product[0].stock))
      throw new Error("The requested quantity exceeds available stock.");
    await connection.execute(
      "INSERT INTO cart_items (session_hash, sku, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)",
      [hash, data.sku, qty],
    );
  });
  const response = json({ items: await cartItems(hash) });
  if (fresh)
    response.headers.set(
      "Set-Cookie",
      `dfsa_guest=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=7776000`,
    );
  return response;
}

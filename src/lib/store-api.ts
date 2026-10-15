import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
export const contactSchema = z
  .object({
    name: text(200).min(1, "Name is required"),
    email: text(320).email("Enter a valid email address"),
    message: text(5000).min(1, "Message is required"),
  })
  .strict();

export const lineSchema = z
  .object({ sku: text(100).min(1), qty: z.number().int().min(1).max(10000) })
  .strict();
export const quoteSchema = z
  .object({
    name: text(200).min(1),
    email: text(320).email(),
    phone: text(60).optional().default(""),
    company: text(200).optional().default(""),
    address_line1: text(300).min(1),
    address_line2: text(300).optional().default(""),
    city: text(120).min(1),
    province: text(120).optional().default(""),
    postal_code: text(30).optional().default(""),
    country: text(120).min(1),
    shipping_method: z.enum(["pudo_locker", "pudo_door", "pickup", "export"]),
    notes: text(5000).optional().default(""),
    items: z.array(lineSchema).min(1).max(150),
  })
  .strict()
  .refine((value) => new Set(value.items.map((item) => item.sku)).size === value.items.length, {
    message: "Duplicate product lines are not allowed",
    path: ["items"],
  });

export async function storeApi<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    headers:
      body === undefined
        ? {}
        : { "Content-Type": "application/json", "X-DFSA-Origin": window.location.origin },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "The request could not be completed. Please try again.");
  return result as T;
}

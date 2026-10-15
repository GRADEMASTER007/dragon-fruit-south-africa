import { ZodError } from "zod";
import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { database, transaction } from "./database";
import { catalogue, saveContact, saveQuote } from "./store";
import { handleCart, verifiedGuestHash } from "./cart";
import { beginLogin, finishLogin, logout, sessionUser } from "./auth";
import { adminOverview, updateProduct, updateInquiry, exportNativeRecords } from "./admin";
import { json, readInput } from "./http";
import { paymentSettings, updatePaymentSettings } from "./payment-settings";
import { availableGateways, createCheckout, orderStatus } from "./orders";
import { handleWebhook } from "./webhooks";
import { decodeJsonValue, validApplicationOrigin } from "./json-value";
import { acceptedBrowserOrigin } from "./browser-origin";

async function submissionLimit(request: Request, endpoint: string, perSource = 10) {
  const bucket = Math.floor(Date.now() / 60000);
  const guest = await verifiedGuestHash(request);
  const source = guest || "anonymous";
  const keys = [
    createHash("sha256").update(`${endpoint}:${source}:${bucket}`).digest("hex"),
    createHash("sha256").update(`${endpoint}:global:${bucket}`).digest("hex"),
  ];
  await database().query("DELETE FROM request_limits WHERE expires_at < NOW() LIMIT 100");
  await transaction(async (connection) => {
    for (let index = 0; index < keys.length; index++) {
      await connection.execute(
        "INSERT INTO request_limits (bucket_key, request_count, expires_at) VALUES (?, 1, DATE_ADD(NOW(), INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE request_count = request_count + 1",
        [keys[index]],
      );
      const [record] = await connection.execute<RowDataPacket[]>(
        "SELECT request_count FROM request_limits WHERE bucket_key = ? FOR UPDATE",
        [keys[index]],
      );
      if (
        Number(record[0].request_count) >
        (index === 0 ? (guest ? perSource : Math.max(perSource, 60)) : 300)
      )
        throw new Error("Too many requests. Please wait a minute before trying again.");
    }
  });
}

export async function handleApi(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname;
  try {
    if (path.startsWith("/api/webhooks/"))
      return await handleWebhook(request, path.slice("/api/webhooks/".length));
    if (path === "/api/auth/callback" && request.method === "GET")
      return await finishLogin(request);
    if (path === "/api/account" && request.method === "GET")
      return json({
        user: await sessionUser(request),
        administratorConfigured: Boolean(process.env.DFSA_ADMIN_OPEN_IDS),
      });
    if (request.method === "POST") {
      const [origins] = await database().query<RowDataPacket[]>(
        "SELECT value_json FROM store_settings WHERE setting_key IN ('public_site_origin', 'preview_site_origin')",
      );
      const allowed = origins
        .map((record) => decodeJsonValue(record.value_json))
        .filter(validApplicationOrigin);
      if (!acceptedBrowserOrigin(request, allowed))
        return json(
          { error: "Submissions must originate from this application's configured page." },
          403,
        );
    }
    if (path === "/api/auth/start" && request.method === "POST")
      return await beginLogin(request, await readInput(request));
    if (path === "/api/auth/logout" && request.method === "POST") return logout();
    if (path === "/api/admin/overview" && request.method === "GET")
      return json(await adminOverview(request));
    if (path === "/api/admin/export" && request.method === "GET")
      return await exportNativeRecords(request);
    if (path === "/api/admin/products" && request.method === "POST")
      return await updateProduct(request, await readInput(request));
    if (path === "/api/admin/inquiries" && request.method === "POST")
      return await updateInquiry(request, await readInput(request));
    if (path === "/api/admin/payment-settings" && request.method === "GET")
      return json(await paymentSettings(request));
    if (path === "/api/admin/payment-settings" && request.method === "POST")
      return await updatePaymentSettings(request, await readInput(request));
    if (path === "/api/payment-options" && request.method === "GET")
      return json({ gateways: await availableGateways() });
    if (path === "/api/checkout" && request.method === "POST") {
      const input = await readInput(request);
      await submissionLimit(request, path, 5);
      return await createCheckout(request, input);
    }
    if (path.startsWith("/api/orders/") && request.method === "GET")
      return await orderStatus(request, path.slice("/api/orders/".length));
    if (path === "/api/health" && request.method === "GET") {
      await database().query("SELECT 1");
      const [migration] = await database().execute<RowDataPacket[]>(
        "SELECT migration_name FROM schema_migrations WHERE migration_name = ?",
        ["seed_catalogue_813833f"],
      );
      const [origins] = await database().query<RowDataPacket[]>(
        "SELECT value_json FROM store_settings WHERE setting_key IN ('public_site_origin', 'preview_site_origin')",
      );
      const originsConfigured = origins.some((record) =>
        validApplicationOrigin(decodeJsonValue(record.value_json)),
      );
      return json(
        {
          status: migration.length && originsConfigured ? "ok" : "preparation_required",
          database: "Manus native",
          browserOriginConfigured: originsConfigured,
        },
        migration.length && originsConfigured ? 200 : 503,
      );
    }
    if (path === "/api/products" && request.method === "GET")
      return json({ products: await catalogue() });
    if (path === "/api/preferences" && request.method === "GET") {
      const guest = await verifiedGuestHash(request);
      const [settings] = guest
        ? await database().execute<RowDataPacket[]>(
            "SELECT notice_acknowledged FROM guest_preferences WHERE session_hash = ?",
            [guest],
          )
        : [[]];
      return json({ noticeAcknowledged: Boolean(settings[0]?.notice_acknowledged) });
    }
    if (path === "/api/preferences" && request.method === "POST") {
      await readInput(request);
      await submissionLimit(request, path, 10);
      return await handleCart(request, { operation: "acknowledge_notice" });
    }
    if (path === "/api/cart") {
      if (request.method === "GET") return handleCart(request);
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      if (request.headers.get("sec-fetch-site") === "cross-site")
        return json({ error: "Cross-site submissions are not allowed." }, 403);
      const input = await readInput(request);
      await submissionLimit(request, path, 120);
      return await handleCart(request, input);
    }
    if (["/api/contact", "/api/quotes"].includes(path)) {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      if (request.headers.get("sec-fetch-site") === "cross-site")
        return json({ error: "Cross-site submissions are not allowed." }, 403);
      const input = await readInput(request);
      await submissionLimit(request, path);
      return json(path === "/api/contact" ? await saveContact(input) : await saveQuote(input), 201);
    }
    return json({ error: "Endpoint not found." }, 404);
  } catch (error) {
    if (error instanceof ZodError)
      return json({ error: error.issues[0]?.message || "Please check the supplied fields." }, 400);
    const message = error instanceof Error ? error.message : "";
    if (message === "Authentication required.") return json({ error: message }, 401);
    if (message === "Administrator access required.") return json({ error: message }, 403);
    if (
      [
        "Checkout must start from this site's HTTPS page.",
        "Duplicate checkout lines.",
        "Checkout request changed; reload before trying again.",
        "A selected quantity is no longer available. Refresh your cart.",
        "This service or digital item needs a manual quotation and fulfilment agreement.",
        "Checkout amount is outside the supported range. Request a quotation.",
      ].includes(message)
    )
      return json({ error: message }, 400);
    if (message.startsWith("Too many requests")) return json({ error: message }, 429);
    if (
      [
        "Please send a JSON request.",
        "The request is too large.",
        "The request contains invalid JSON.",
        "One of your selected products is unavailable. Please refresh the catalogue.",
        "This product is no longer available.",
        "The requested quantity exceeds available stock.",
      ].includes(message)
    )
      return json({ error: message }, 400);
    console.error("Native store operation failed", {
      path,
      errorType: error instanceof Error ? error.name : "Unknown",
    });
    return json(
      {
        error:
          "The database operation could not be completed. Please try again or contact our team.",
      },
      503,
    );
  }
}

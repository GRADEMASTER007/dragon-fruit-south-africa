import type { RowDataPacket } from "mysql2/promise";
import { rows } from "./database";
import { decodeJsonValue, validApplicationOrigin } from "./json-value";

export async function publicSiteOrigin(): Promise<string | null> {
  try {
    const record = (
      await rows<RowDataPacket>(
        "SELECT value_json FROM store_settings WHERE setting_key = 'public_site_origin'",
      )
    )[0];
    if (!record) return null;
    const raw = decodeJsonValue(record.value_json);
    return validApplicationOrigin(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function robotsDocument() {
  const origin = await publicSiteOrigin();
  const text = origin
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /account\nDisallow: /payment-settings\nDisallow: /checkout\nSitemap: ${origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

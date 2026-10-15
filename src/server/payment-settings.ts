import { z } from "zod";
import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { requireAdmin } from "./auth";
import { database, rows } from "./database";
import { json } from "./http";

export type Gateway = "payfast" | "yoco" | "paypal";
export const credentialKeys: Record<Gateway, string[]> = {
  payfast: ["PAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_KEY", "PAYFAST_SECURITY_PASSPHRASE"],
  yoco: ["YOCO_SECRET_KEY", "YOCO_WEBHOOK_SECRET"],
  paypal: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID", "PAYPAL_MERCHANT_ID"],
};
export const modeKey = (gateway: Gateway) => `${gateway.toUpperCase()}_MODE`;
export function gatewayCredentials(gateway: Gateway) {
  const mode = process.env[modeKey(gateway)] === "live" ? "live" : "test";
  const present = Object.fromEntries(
    credentialKeys[gateway].map((key) => [key, process.env[key] ? "configured ••••" : "missing"]),
  );
  const signingSecret = process.env.YOCO_WEBHOOK_SECRET || "";
  const encoded = signingSecret.startsWith("whsec_") ? signingSecret.slice(6) : "";
  const validWebhookSecret =
    /^[A-Za-z0-9+/]+={0,2}$/.test(encoded) &&
    Buffer.from(encoded, "base64").length >= 16 &&
    Buffer.from(encoded, "base64").toString("base64").replace(/=+$/, "") ===
      encoded.replace(/=+$/, "");
  const configured =
    credentialKeys[gateway].every((key) => Boolean(process.env[key])) &&
    (gateway !== "yoco" ||
      (validWebhookSecret &&
        Boolean(
          process.env.YOCO_SECRET_KEY?.startsWith(mode === "live" ? "sk_live_" : "sk_test_"),
        )));
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([mode, ...credentialKeys[gateway].map((key) => process.env[key] || "")]))
    .digest("hex");
  return { mode, present, configured, fingerprint };
}

export async function paymentSettings(request: Request) {
  await requireAdmin(request);
  const settings = await rows<RowDataPacket>(
    "SELECT gateway, enabled, mode, validation_status, validated_at, configuration_fingerprint FROM gateway_settings ORDER BY gateway",
  );
  const gateways = settings.map((setting) => {
    const gateway = setting.gateway as Gateway;
    const credentials = gatewayCredentials(gateway);
    return {
      gateway,
      enabled: Boolean(setting.enabled),
      mode: credentials.mode,
      storedMode: setting.mode,
      credentials: credentials.present,
      configured: credentials.configured,
      validationStatus:
        setting.configuration_fingerprint === credentials.fingerprint
          ? setting.validation_status
          : "configuration_changed_or_missing",
      validatedAt: setting.validated_at,
      codeStatus:
        gateway === "paypal"
          ? "creation_adapter_only_currency_policy_pending"
          : gateway === "payfast"
            ? "itn_implemented_checkout_secret_transport_and_live_proxy_policy_blocked"
            : "hosted_checkout_and_signed_webhook_implemented",
      availableForCheckout:
        gateway === "yoco" &&
        Boolean(setting.enabled) &&
        credentials.configured &&
        credentials.mode === "test" &&
        setting.configuration_fingerprint === credentials.fingerprint,
      webhookPath: `/api/webhooks/${gateway}`,
    };
  });
  return {
    gateways,
    secretEntry:
      "Manus Dashboard secure Secrets only; this screen never accepts or retrieves complete credentials.",
    paypalCurrencyPolicy:
      "ZAR is unsupported. The owner's USD quotation or explicit conversion policy is still required.",
    database: "Manus native",
    hosting: "Manus native",
  };
}

export async function updatePaymentSettings(request: Request, input: unknown) {
  await requireAdmin(request);
  const data = z
    .object({ gateway: z.enum(["payfast", "yoco", "paypal"]), enabled: z.boolean() })
    .strict()
    .parse(input);
  const credentials = gatewayCredentials(data.gateway);
  if (
    data.enabled &&
    (!credentials.configured || credentials.mode !== "test" || data.gateway !== "yoco")
  )
    return json(
      {
        error:
          "Only fully configured Yoco sandbox setup can be enabled. PayFast needs a method that does not expose merchant keys in browser form fields and a live proxy validation policy; PayPal needs its currency decision.",
      },
      409,
    );
  if (
    data.enabled &&
    data.gateway === "yoco" &&
    !process.env.YOCO_SECRET_KEY?.startsWith("sk_test_")
  )
    return json({ error: "Yoco secret key must match test mode." }, 409);
  await database().execute(
    "UPDATE gateway_settings SET enabled = ?, mode = ?, validation_status = ?, configuration_fingerprint = ?, validated_at = NULL WHERE gateway = ?",
    [
      data.enabled,
      credentials.mode,
      data.enabled
        ? "configured_for_sandbox"
        : credentials.configured
          ? "not_validated"
          : "not_configured",
      credentials.fingerprint,
      data.gateway,
    ],
  );
  return json({ saved: true, enabled: data.enabled, providerConnectivityVerified: false });
}

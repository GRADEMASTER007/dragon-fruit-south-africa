import { payfastSignature } from "./payment-security";
import { gatewayCredentials, type Gateway } from "./payment-settings";

export type PaymentRequest = {
  paymentId: string;
  orderId: string;
  reference: string;
  amountCents: number;
  currency: string;
  name: string;
  email: string;
  origin: string;
  environment: "test" | "live";
};
export type HostedPayment = {
  reference: string;
  url?: string;
  form?: { action: string; fields: [string, string][] };
  merchantId?: string;
};

async function providerJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new Error(
      "The payment provider could not create this checkout. Your order remains unpaid; please try again or contact the team.",
    );
  return data;
}

export async function yocoCheckout(order: PaymentRequest): Promise<HostedPayment> {
  if (order.currency !== "ZAR" || order.amountCents < 200)
    throw new Error("Yoco requires ZAR and a minimum payment of R2.");
  const secret = process.env.YOCO_SECRET_KEY || "";
  if (!secret.startsWith(order.environment === "live" ? "sk_live_" : "sk_test_"))
    throw new Error("The payment key does not match the configured mode.");
  const result = await providerJson("https://payments.yoco.com/api/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Idempotency-Key": order.paymentId,
    },
    body: JSON.stringify({
      amount: order.amountCents,
      currency: "ZAR",
      successUrl: `${order.origin}/checkout?order=${order.orderId}&return=pending`,
      cancelUrl: `${order.origin}/checkout?order=${order.orderId}&return=cancelled`,
      failureUrl: `${order.origin}/checkout?order=${order.orderId}&return=failed`,
      metadata: { orderId: order.orderId, paymentId: order.paymentId },
      externalId: order.orderId,
      clientReferenceId: order.reference,
    }),
  });
  if (
    typeof result.id !== "string" ||
    typeof result.redirectUrl !== "string" ||
    result.amount !== order.amountCents ||
    result.currency !== "ZAR" ||
    result.processingMode !== order.environment ||
    typeof result.merchantId !== "string"
  )
    throw new Error("The payment provider returned inconsistent checkout details.");
  const url = new URL(result.redirectUrl);
  if (
    url.protocol !== "https:" ||
    !(url.hostname === "yoco.com" || url.hostname.endsWith(".yoco.com"))
  )
    throw new Error("Unexpected payment redirect domain.");
  return { reference: result.id, url: result.redirectUrl, merchantId: result.merchantId };
}

export function payfastCheckout(order: PaymentRequest): HostedPayment {
  if (order.currency !== "ZAR") throw new Error("PayFast checkout requires ZAR.");
  const parts = order.name.trim().split(/\s+/);
  const fields: [string, string][] = [
    ["merchant_id", process.env.PAYFAST_MERCHANT_ID || ""],
    ["merchant_key", process.env.PAYFAST_MERCHANT_KEY || ""],
    ["return_url", `${order.origin}/checkout?order=${order.orderId}&return=pending`],
    ["cancel_url", `${order.origin}/checkout?order=${order.orderId}&return=cancelled`],
    ["notify_url", `${order.origin}/api/webhooks/payfast`],
    ["name_first", parts[0].slice(0, 100)],
    ["name_last", parts.slice(1).join(" ").slice(0, 100)],
    ["email_address", order.email],
    ["m_payment_id", order.paymentId],
    ["amount", (order.amountCents / 100).toFixed(2)],
    ["item_name", `DFSA ${order.reference}`],
  ];
  fields.push([
    "signature",
    payfastSignature(fields, process.env.PAYFAST_SECURITY_PASSPHRASE || ""),
  ]);
  return {
    reference: order.paymentId,
    form: {
      action:
        order.environment === "live"
          ? "https://www.payfast.co.za/eng/process"
          : "https://sandbox.payfast.co.za/eng/process",
      fields,
    },
  };
}

export async function paypalToken(environment: string) {
  const base =
    environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID || ""}:${process.env.PAYPAL_CLIENT_SECRET || ""}`,
  ).toString("base64");
  const result = await providerJson(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (typeof result.access_token !== "string")
    throw new Error("The payment provider authentication failed.");
  return { base, token: result.access_token as string };
}

export async function paypalCheckout(order: PaymentRequest): Promise<HostedPayment> {
  if (order.currency !== "USD")
    throw new Error(
      "PayPal checkout is unavailable until an owner-approved USD quotation is issued. ZAR is not supported.",
    );
  const { base, token } = await paypalToken(order.environment);
  const result = await providerJson(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": order.paymentId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.orderId,
          custom_id: order.paymentId,
          invoice_id: order.reference,
          amount: { currency_code: "USD", value: (order.amountCents / 100).toFixed(2) },
          payee: { merchant_id: process.env.PAYPAL_MERCHANT_ID },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${order.origin}/checkout?order=${order.orderId}&return=approved`,
            cancel_url: `${order.origin}/checkout?order=${order.orderId}&return=cancelled`,
            user_action: "PAY_NOW",
            brand_name: "DFSA",
          },
        },
      },
    }),
  });
  const approval = result.links?.find(
    (link: { rel?: string }) => link.rel === "payer-action" || link.rel === "approve",
  );
  if (typeof result.id !== "string" || typeof approval?.href !== "string")
    throw new Error("The payment provider did not return an approval URL.");
  const url = new URL(approval.href);
  if (
    url.protocol !== "https:" ||
    !(url.hostname === "paypal.com" || url.hostname.endsWith(".paypal.com"))
  )
    throw new Error("Unexpected payment redirect domain.");
  return { reference: result.id, url: approval.href };
}

export async function hostedCheckout(gateway: Gateway, order: PaymentRequest) {
  if (!gatewayCredentials(gateway).configured)
    throw new Error("The payment gateway is not configured.");
  if (gateway === "payfast")
    throw new Error(
      "PayFast hosted form requires a merchant-key browser field. Initiation is blocked to honour the owner's server-only payment-credential rule pending a supported alternative.",
    );
  return gateway === "yoco" ? yocoCheckout(order) : paypalCheckout(order);
}

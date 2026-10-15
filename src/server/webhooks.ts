import { z } from "zod";
import {
  constantEqual,
  decimalCents,
  payfastParameters,
  payfastSignature,
  verifyYoco,
} from "./payment-security";
import { gatewayCredentials } from "./payment-settings";
import { applyVerifiedPayment } from "./payment-events";
import { json } from "./http";

async function rawBody(request: Request, limit = 100000) {
  if (Number(request.headers.get("content-length") || 0) > limit || !request.body)
    throw new Error("Invalid webhook body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new Error("Invalid webhook body.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function handleYoco(request: Request) {
  const config = gatewayCredentials("yoco");
  if (!config.configured) return json({ error: "Webhook is not configured." }, 503);
  const raw = await rawBody(request);
  if (!verifyYoco(raw, request.headers, process.env.YOCO_WEBHOOK_SECRET || ""))
    return json({ error: "Invalid webhook authentication." }, 403);
  const event = z
    .object({
      id: z.string().min(1).max(191),
      type: z.string().max(100),
      payload: z
        .object({
          id: z.string().min(1).max(191),
          amount: z.number().int().min(0),
          currency: z.literal("ZAR"),
          mode: z.enum(["test", "live"]),
          status: z.string(),
          metadata: z.object({ checkoutId: z.string().min(1).max(191) }).passthrough(),
        })
        .passthrough(),
    })
    .passthrough()
    .parse(JSON.parse(new TextDecoder().decode(raw)));
  if (!["payment.succeeded", "payment.failed"].includes(event.type))
    return json({ received: true, ignored: true });
  if (
    event.payload.mode !== config.mode ||
    (event.type === "payment.succeeded" && event.payload.status !== "succeeded") ||
    (event.type === "payment.failed" && event.payload.status !== "failed")
  )
    return json({ error: "Webhook event mismatch." }, 400);
  const result = await applyVerifiedPayment({
    gateway: "yoco",
    environment: event.payload.mode,
    eventId: event.id,
    eventType: event.type,
    reference: event.payload.metadata.checkoutId,
    captureId: event.payload.id,
    amountCents: event.payload.amount,
    currency: "ZAR",
    status: event.type === "payment.succeeded" ? "captured" : "failed",
  });
  return json({ received: true, ...result });
}

export async function handlePayfast(request: Request) {
  const config = gatewayCredentials("payfast");
  if (!config.configured) return json({ error: "Webhook is not configured." }, 503);
  if (config.mode === "live")
    return json(
      {
        error:
          "Live PayFast requires an established trusted-proxy origin/IP validation policy; it is not enabled.",
      },
      503,
    );
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
    return json({ error: "Invalid webhook format." }, 400);
  const entries = Array.from(
    new URLSearchParams(new TextDecoder().decode(await rawBody(request))).entries(),
  );
  if (
    new Set(entries.map(([name]) => name)).size !== entries.length ||
    entries.at(-1)?.[0] !== "signature"
  )
    return json({ error: "Invalid webhook field sequence." }, 400);
  const fields = Object.fromEntries(entries);
  const signature = fields.signature;
  if (
    !signature ||
    !/^[a-f0-9]{32}$/i.test(signature) ||
    !constantEqual(
      payfastSignature(entries, process.env.PAYFAST_SECURITY_PASSPHRASE || ""),
      signature.toLowerCase(),
    )
  )
    return json({ error: "Invalid webhook authentication." }, 403);
  if (
    fields.merchant_id !== process.env.PAYFAST_MERCHANT_ID ||
    !fields.m_payment_id ||
    !fields.pf_payment_id ||
    !["COMPLETE", "CANCELLED"].includes(fields.payment_status)
  )
    return json({ error: "Webhook account/reference/status mismatch." }, 400);
  const parameters = payfastParameters(entries);
  const verified = await fetch("https://sandbox.payfast.co.za/eng/query/validate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: parameters,
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!verified.ok || (await verified.text()) !== "VALID")
    return json({ error: "Provider confirmation failed." }, 403);
  const result = await applyVerifiedPayment({
    gateway: "payfast",
    environment: "test",
    eventId: `${fields.pf_payment_id}:${fields.payment_status}`,
    eventType: fields.payment_status,
    reference: fields.m_payment_id,
    captureId: fields.pf_payment_id,
    merchantId: fields.merchant_id,
    amountCents: decimalCents(fields.amount_gross),
    currency: "ZAR",
    status: fields.payment_status === "COMPLETE" ? "captured" : "cancelled",
  });
  return json({ received: true, ...result });
}

export async function handleWebhook(request: Request, gateway: string) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    return gateway === "yoco"
      ? await handleYoco(request)
      : gateway === "payfast"
        ? await handlePayfast(request)
        : json(
            {
              error: "PayPal webhook is not enabled pending supported-currency workflow approval.",
            },
            503,
          );
  } catch (error) {
    console.error("Payment webhook rejected", {
      gateway,
      errorType: error instanceof Error ? error.name : "Unknown",
    });
    return json(
      { error: "Payment event could not be verified or persisted." },
      error instanceof z.ZodError ? 400 : 409,
    );
  }
}

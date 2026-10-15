import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { storeApi } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Gateway = {
  gateway: string;
  enabled: boolean;
  mode: string;
  credentials: Record<string, string>;
  configured: boolean;
  validationStatus: string;
  validatedAt: string | null;
  codeStatus: string;
  webhookPath: string;
};
type Settings = { gateways: Gateway[]; paypalCurrencyPolicy: string; secretEntry: string };
const instructions: Record<string, string[]> = {
  payfast: [
    "Activate and verify your PayFast merchant account.",
    "Add PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY and PAYFAST_SECURITY_PASSPHRASE through Manus secure Secrets. Existing PAYFAST_PDT_KEY is retained securely but unused by ITN verification.",
    "Set PAYFAST_MODE to test or live and use matching merchant credentials.",
    "Register the published ITN URL and complete signature, account, amount and payment-status verification before enabling.",
  ],
  yoco: [
    "Activate your Yoco merchant account and use the current hosted Checkout API, not the obsolete Popup SDK.",
    "Add YOCO_SECRET_KEY and the webhook signing secret YOCO_WEBHOOK_SECRET through Manus secure Secrets.",
    "Set YOCO_MODE to test or live and use matching keys and webhook registration.",
    "Complete a real sandbox checkout and signed event verification before enabling.",
  ],
  paypal: [
    "Create the matching sandbox or live merchant REST application.",
    "Add PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID and PAYPAL_MERCHANT_ID through Manus secure Secrets.",
    "Set PAYPAL_MODE to test or live. PayPal ZAR checkout is unsupported; owner-approved supported-currency pricing is required.",
    "Register verified capture/payment events and confirm merchant, amount, currency and order identifiers before enabling.",
  ],
};
export const Route = createFileRoute("/payment-settings")({
  head: () => ({
    meta: [
      { title: "Payment Settings · DFSA Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentSettings,
});

function PaymentSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  async function refresh() {
    try {
      setSettings(await storeApi<Settings>("/api/admin/payment-settings"));
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load protected settings.");
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function disable(gateway: string) {
    try {
      await storeApi("/api/admin/payment-settings", { gateway, enabled: false });
      await refresh();
      toast.success("Gateway disabled.");
    } catch {
      toast.error("Could not update the gateway setting.");
    }
  }
  async function enableSandbox(gateway: string) {
    try {
      await storeApi("/api/admin/payment-settings", { gateway, enabled: true });
      await refresh();
      toast.info(
        "Sandbox configuration enabled. A successful provider transaction is still unverified.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sandbox enablement failed.");
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <Link to="/admin" className="text-sm text-primary">
        ← Administration
      </Link>
      <h1 className="mt-5 font-display text-4xl font-semibold">Payment settings.</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Gateway credentials remain in Manus secure Secrets. Only configuration-presence indicators
        and non-sensitive settings are shown here. Configured does not mean connected, verified or
        ready to accept payments.
      </p>
      {error && (
        <div role="alert" className="mt-8 rounded-xl border p-6">
          <p>{error}</p>
          <Link to="/account" className="mt-4 inline-block text-primary">
            Sign in / verify administrator access →
          </Link>
        </div>
      )}
      {!settings && !error && (
        <p className="mt-8" role="status">
          Checking protected gateway settings…
        </p>
      )}
      {settings && (
        <>
          <p className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            {settings.paypalCurrencyPolicy}
          </p>
          <div className="mt-8 space-y-6">
            {settings.gateways.map((gateway) => (
              <section
                key={gateway.gateway}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <h2 className="font-display text-2xl capitalize">{gateway.gateway}</h2>
                  <span className="text-sm">
                    {gateway.enabled ? "Enabled" : "Disabled"} · {gateway.mode} mode
                  </span>
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  {Object.entries(gateway.credentials).map(([key, value]) => (
                    <div key={key} className="flex flex-wrap justify-between gap-3">
                      <dt className="font-mono text-xs">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-sm">
                  Validation: {gateway.validationStatus.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-sm">
                  Implementation: {gateway.codeStatus.replaceAll("_", " ")}
                </p>
                <p className="mt-4 break-all rounded bg-muted p-3 font-mono text-xs">
                  Webhook:{" "}
                  {typeof window !== "undefined" ? window.location.origin : "Your published origin"}
                  {gateway.webhookPath}
                </p>
                <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {instructions[gateway.gateway].map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">
                  Yoco and PayFast sandbox handlers are implemented; provider connectivity is
                  unverified until an actual successful signed sandbox event. Live payments remain
                  blocked. PayFast initiation is blocked because its standard form exposes the
                  merchant key, contrary to your server-only credential requirement; it also needs a
                  production trusted-proxy origin/IP policy. PayPal workflow is blocked by the
                  currency decision. Never register a Preview URL as a live payment endpoint.
                </p>
                {!gateway.enabled &&
                  gateway.gateway === "yoco" &&
                  gateway.configured &&
                  gateway.mode === "test" && (
                    <Button
                      variant="outline"
                      onClick={() => enableSandbox(gateway.gateway)}
                      className="mt-5"
                    >
                      Enable sandbox setup (not verified live)
                    </Button>
                  )}
                {gateway.enabled && (
                  <Button
                    variant="outline"
                    onClick={() => disable(gateway.gateway)}
                    className="mt-5"
                  >
                    Disable gateway
                  </Button>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

# Native setup and activation

## Manus only

The frontend and backend build into one Manus-hosted Node container. The authoritative database is the injected native `DATABASE_URL`; do not configure another DSN. Existing catalogue/blog import is complete. The owner's instruction was **remove old Supabase code/configuration only, leave the old database untouched**. No historic external business records were imported or deleted.

## Required non-sensitive origin bootstrap

Browser writes fail closed if no exact trusted frontend origin is configured. This is intentional and reflected by `/api/health` readiness. After initialization/migration, use the exact `preview_origin` returned by Manus, not a guessed/internal hostname:

```sh
pnpm exec tsx scripts/set-site-origin.ts preview_site_origin <exact-Manus-Preview-HTTPS-origin>
```

After a successful native publication, set the actual returned permanent origin:

```sh
pnpm exec tsx scripts/set-site-origin.ts public_site_origin <actual-published-HTTPS-origin>
```

These values are non-sensitive native `store_settings` records, not payment secrets. No restart is needed for origin/SEO changes. The browser sends `X-DFSA-Origin: window.location.origin` on JSON writes. API validation requires that it match an explicitly configured public/Preview origin, requires actual Origin to be the declared browser origin or observed internal proxy request origin, rejects Sec-Fetch-Site cross-site, and never grants cross-origin CORS preflight permission. This handles the observed Preview ingress Origin rewrite without using internal Host as a public callback URL. Cookie/session/token checks remain necessary; Origin controls do not authenticate direct API clients.

## Administrator

`DFSA_ADMIN_OPEN_IDS` is saved through Manus secure input. It is a comma-separated allow-list of verified Manus openId values, not emails/passwords. Use `/account` to sign in and see your verified identity, then `/admin` for protected native records and `/payment-settings` for masked setup status. Valid session JWTs must match project identity and expiry. The first visitor is never made admin. Restart Preview after a secure environment change; publish to load changed production values where required. Saved setting presence does not prove the full OAuth login/owner-role workflow has been exercised.

## Payment setup — never enter secrets in app forms or Git

Open this Manus project's Dashboard secure **Secrets / environment variables**. Existing values are not displayed or copied to the database. Current keys recognized:

| Gateway | Secure keys | Current activation |
| --- | --- | --- |
| PayFast | PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_SECURITY_PASSPHRASE; PAYFAST_MODE=test or live | Credentials supplied, mode not yet explicitly supplied. PAYFAST_PDT_KEY is retained securely but not used by this ITN flow. Hosted-form initiation remains blocked because the standard integration puts merchant_key in a browser form, contrary to the owner's server-only credential rule. A documented compatible alternative/merchant setup is needed; live origin/IP validation behind Manus proxy is also unresolved. |
| Yoco | YOCO_SECRET_KEY=sk_test_…, YOCO_WEBHOOK_SECRET=whsec_…; YOCO_MODE=test | Missing keys. Current hosted-checkout and raw signed-webhook code exists. A syntactically valid signing secret and matching test key are required before an authorized admin can enable sandbox setup. This is not provider connectivity validation. |
| PayPal | PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_MERCHANT_ID; PAYPAL_MODE=test or live | Missing keys and owner currency decision. ZAR unsupported; no invented conversion. Order-creation adapter is gated on USD; approval/capture/webhook/reconciliation workflow still needs completion after policy approval. |

Do not send full key values in chat. Do not register Preview URLs for live payment notifications. Gateway environment is read server-side; configuration fingerprints invalidate prior enablement after credential changes. All live gateways remain disabled, and no live transactions or refunds were run. Only configured Yoco test flow can currently be enabled; its default is off.

## Stock, shipping and fulfilment

PUDO locker/door and exports remain available as quotation preferences. The source R60/R150 merchant-listed shipping settings are not verified courier API quotations. No package eligibility, courier booking or tracking integration was fabricated. Commercial packaging and digital/service delivery require manual team confirmation. Digital download files and scheduling automation were not supplied. Sandbox pickup flow is visibly test-only and must not consume real stock.

## Backups and historic data

The exposed native capability supplies one shared durable database, not a separate QA database or an advertised point-in-time restore API. `/admin` offers a protected portable administrative snapshot (current catalogue and latest 100 records per section), explicitly not a complete backup. Preserve source checkpoints and obtain an authorized full export process before any destructive data work. Never treat old external payment flags as verified captures without reconciliation.

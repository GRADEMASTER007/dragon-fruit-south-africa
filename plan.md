# DFSA ecommerce migration and completion plan

## Existing application and findings

Source: `GRADEMASTER007/dragon-fruit-south-africa`, main commit `813833f`. Preserve the original source checkout and archive before migration. The existing app uses React 19, TanStack Start/Router, Vite, Tailwind, Radix UI, a TypeScript product catalogue, local cart state, ten blog records, quote/contact forms and legal pages. Current hosting configuration targets Lovable/Cloudflare and persistence uses Supabase. The checkout is unsafe: it creates paid orders from browser callbacks, accepts browser-calculated totals, uses an obsolete Yoco popup flow, and attempts PayPal in ZAR. The existing order policies allow broad authenticated read/update access. No live database export was supplied, so historic records cannot be assumed migrated.

Manus project `wdp_0335a32e33aa04afe026515e` is initialized with both native server and native MySQL-compatible database effective. Workspace `/home/ubuntu/dfsashop`; preview port 3000; canonical storage is Manus-managed; automatic publication is off. Existing-repository adoption is not supported by the managed repository-switch surface. Keep the original GitHub history intact; import its source snapshot into the Manus workspace and deliver changes back to the original repository as a reviewable branch/PR where authorized and available, separately from the Manus checkpoint.

## Implementation approach

Preserve TanStack Start server-rendered pages, components, branding, catalogue SKUs, supplied prices and appropriate assets. Replace the Lovable/Cloudflare-specific build configuration with a supported Node deployment, pin dependencies and package manager, and provide a Dockerfile, runtime health endpoint and complete route manifest. Frontend and backend will be served by one Manus container. Do not use any external database or hosting fallback. Cloudflare Durable Objects are not appropriate under the user's exclusive Manus infrastructure requirement; use native database transactions for coordination and inventory.

Move catalogue/stock, quote requests, contact messages, users/roles, orders, order items, gateway settings, payment attempts and webhook processing records to server-side Manus database access. Seed only supplied catalogue records, never fake buyers or transactions. Use additive, tracked migrations and seed history, foreign keys, indexes and unique gateway/event references. Treat development and publication as sharing the same database. Preserve user edits on redeploy. Document that no native point-in-time recovery or independent development database is exposed by the available capability; provide an application/client export process rather than inventing backup APIs.

Use Manus OAuth for customer and administration login, validating HS256 JWT expiry and project identity and binding OAuth state to a one-time browser nonce. Use the compatible `webdev_app_session` cookie and `SameSite=None; Secure` for public HTTPS preview. Restrict admin settings, catalogue updates, messages, quotes and financial history to verified owner/assigned admin identities, never the first arbitrary visitor. Public submission endpoints validate and rate-limit inputs; checkout recomputes prices and shipping from authoritative records, validates quantities/availability and stores orders before initiating payment. Browser redirect parameters cannot mark payments paid.

Implement PayFast hosted checkout and official ITN verification; Yoco current hosted Checkout API and signed webhooks; PayPal Orders API approval/capture and server-verified webhooks. Use provider timeout/retry handling and idempotency. Validate order, amount, currency, account and environment before an atomic payment/order update. Distinguish initiation, approval, pending, capture, failure, cancellation and refund/reconciliation states. Reject invalid or inconsistent notifications and prevent duplicate and out-of-order processing. Provide gateway-specific connection checks and do not report credential presence as successful provider validation. Store only non-sensitive references, not secrets, card details or raw protected webhook payloads.

Payment Settings exposes gateway mode, enablement, masked credential-presence status, setup checklist, webhook URLs and validation results. Credentials remain authoritative in Dashboard secure Secrets and are available only to server processes through environment injection. Never provide payment-secret forms in the storefront or database. Keep test/live credentials and records separate. Missing credentials mean gateway options stay unavailable, not fake success. Do not initiate live payments, automatic refunds or financial reversals. Where refund APIs cannot be safely verified, link to merchant-led handling and show honest limitations.

## Material choices and blockers

PayPal supported currency policy must be verified from current official documentation. The existing ZAR checkout must not be retained if unsupported. Ask the owner to choose a supported-currency workflow: owner-issued USD international quotations, or automatic supported-currency conversion using an explicitly approved rate source and pricing policy. Do not invent an exchange rate or silently charge a different currency.

PUDO options exist at R60 locker and R150 door in source. Preserve source rates as merchant-configurable settings, clearly distinguish these merchant-listed amounts from verified courier API quotes, and require delivery details. Commercial trays/exports need appropriate quotation rather than falsely free shipping or claiming locker eligibility without package data. Source digital products have no download assets; do not claim automatic fulfilment until files are supplied. Source consultation/membership purchases need manual scheduling/activation unless an actual workflow exists. Source email promises must be revised to manual team follow-up unless a transactional mail service is configured and tested.

Import of historic Supabase orders/quotes/messages requires a legitimate owner export or securely configured access; preserve the original database and avoid deletion. No old financial records may be relabelled verified-paid without gateway reconciliation.

## Design

Reuse the existing African grower/editorial identity: ivory background, deep plum text, dragon-fruit pink signature colour, leaf-green accents; Libre Baskerville display with IBM Plex Sans body. Preserve the wide farm hero and grower-service hierarchy. Retain mobile navigation and clear, spacious forms; improve accessible names, focus states, error messages, empty states and loading states. Honour the source brief's no-product-images instruction: shop cards become text-led with SKU, category, stock and price, without decorative image placeholders. Keep appropriate existing editorial farm/blog imagery. Avoid unnecessary 3D/logo video assets in checkout; requested animation/video skills may guide a later approved marketing deliverable but are not prerequisites for secure commerce. Remove fabricated illustrative testimonials from the live storefront rather than publishing them as customer evidence.

## Search, content and marketing

Preserve existing blog copy/assets and expose the currently orphaned blog data through functional listing/detail routes. Use server-rendered meaningful public HTML, route-specific metadata and actual-public-origin canonicals, product/breadcrumb/article structured data without fabricated review ratings, sitemap/robots controls, FAQs based on real business facts and optional machine-readable business summary. Keep account/checkout/admin/private records noindex. Do not claim rankings, traffic, backlinks or AI-citation gains without actual measurements. Similarweb/Semrush can inform a separately scoped audit of a confirmed domain; backlink pulls require the skill's source and extra competitor-data approval. Do not execute unrelated competitor roundups, send WhatsApp messages or create video assets solely to exercise every named tool. Add an ordinary click-to-chat link using the existing published business number, not unsolicited outreach.

## Project structure

- `src/routes/`: retained storefront, legal and service pages, completed blog/account/order/admin routes and server API handlers.
- `src/components/site/`, `src/components/ui/`: existing branded layout and reusable form/UI primitives.
- `src/lib/`: browser-safe catalogue types, cart, shared validation and formatting.
- `src/server/`: native database connection/queries, migrations/seed runner, OAuth/session/access checks, order service, payment-provider adapters, webhook processing and request validation.
- `migrations/`: tracked native MySQL additive schema migrations.
- `tests/`: application and provider security tests with explicit fixtures, not fake live transactions.
- `public/`: existing favicon, route manifest, discovery files and static assets.
- `Dockerfile`, package/lock/toolchain files: reproducible Manus container build and production entrypoint.
- `TODO.md`, `docs/`: complete outcome requirements, migration/secrets setup and status report.

## Completion and publication

After implementation, run the actual build/types/lint and affected automated checks, validate durable database operations with clearly identified test probes, verify anonymous versus admin authorization and payment failure/duplicate/mismatch handling. Use one read-only implementation review agent for this complex app, correct confirmed defects and rerun affected checks. External sandbox gateway transactions require the owner's credentials and merchant setup, so distinguish code-level tests from real provider verification. Save an accepted Manus checkpoint, publish through the supported native workflow, then verify the actual published pages, health, raw HTML/statuses and essential workflows. Never invent a URL or equate preview/checkpoint with publication. Provide a concise final report plus complete reusable status/secrets instructions, identifying implemented, tested, credential-blocked and remaining outcomes separately.

# DFSA native Manus migration — release report

**Date:** 15 October 2026
**Source repository:** GRADEMASTER007/dragon-fruit-south-africa, imported source commit `813833f`
**Release status:** Functional native storefront and quotation workflow implemented; three-gateway production acceptance remains incomplete. Native publication/checkpoint references are appended only after a successful platform receipt.

## Repository and implemented functionality

The existing React/TanStack Start/Vite interface, identity, source prices, SKUs, stock, farm photograph and blog images were retained rather than replaced. The old Cloudflare-targeted build was replaced with the official Nitro Node deployment preset for Manus. Supabase code, clients, migrations and obsolete editor configuration were removed from the active application **only**. The former external database was never accessed, erased or changed. Its historic customers, orders and payment flags were not silently imported or treated as verified financial records.

New server modules under `src/server/` implement native SQL access, catalogue/editorial reads, validated contact and quotation writes, guest-cart persistence, native cookie-notice preferences, authentication, protected administration, checkout/order snapshots, payment settings/adapters, raw webhook checks and payment accounting. `migrations/`, `scripts/` and `tests/` contain the repeatable native setup and verification. Important UI changes are the native shop, blog index/detail, cart, quote/contact forms, account, admin, checkout and Payment Settings routes. `Dockerfile`, `vite.config.ts`, package/lockfile, route manifest and local font imports define reproducible first-party serving.

The public shop has working search, category filtering, price/name sorting, loading/error/empty states and stock-aware add-to-cart controls. Native blog listing/detail routes expose the ten preserved records. Missing articles and routes return actual 404 responses. Product cards remain image-free as requested. Illustrative testimonials were removed so invented customer evidence is not presented as real. Source editorial agricultural/business claims have not been independently fact-checked or rewritten with invented citations.

Protected administration implements product price/stock/active updates with optimistic version protection, quote/contact status changes, payment/order/event views, payment-reference search/status filters, masked setup status and a recent-record JSON snapshot. Snapshot output is explicitly limited to the latest 100 records per section and is **not** a complete backup. Digital-resource delivery assets, appointment automation, courier booking/tracking, automated customer emails and refunds were not invented.

## Infrastructure and database

Manus native server/database capabilities are enabled. The backend reads injected `DATABASE_URL` only on the server, with no external DSN or fallback. Frontend assets and API run together from the Manus-built Node container. The native database is shared between Preview and deployed instances; testing does not assume an isolated production copy. Persistent data is not stored in the container filesystem or browser local storage.

Six additive SQL migrations cover users/roles; the 141-SKU catalogue; contact/quote records and line snapshots; orders/items; gateway settings; payments and unique provider/capture references; deduplicated non-sensitive webhook results; merchant settings; submission limits; anonymous session hashes/cart items; blog posts; OAuth nonces; notice preferences; provider/security correlation; and environment-separated durable inventory allocations. Foreign keys, uniqueness, validation and transactions preserve relational consistency. Two versioned source seed markers preserve subsequent administrative edits. Verified native counts after migration were **141 products, 10 blog posts, zero orders and zero payments**—no business transaction history was fabricated.

Native read/write/reconnect persistence was verified with a clearly labelled non-business probe. The public cart check saved a temporary anonymous basket containing an existing real SKU, reloaded it in an independent request, verified isolation from another guest, rejected an overstock mutation, cleared only that temporary basket, and confirmed real stock was unchanged. No fake customer, contact inquiry, order or payment was created. Full real business-form creation was not exercised because fabricated business records are prohibited; input validation and persistence code were checked instead.

The available native capability exposes a managed persistent database but not a separately provisioned QA database, an advertised point-in-time recovery endpoint, or a full managed backup/export API. Those capabilities were not claimed. Additive migration history and Git checkpoints preserve source; full authorized business-data export/recovery needs a separately confirmed native process before destructive changes.

## Security and account status

Manus OAuth exchange, project-bound signed session JWTs, expiry, nonce-bound callback state, single-use native nonce records and `SameSite=None; Secure; HttpOnly` cookies are implemented for HTTPS Preview. Admin authorization is derived only from the protected `DFSA_ADMIN_OPEN_IDS` allow-list. The setting was supplied through secure platform input; neither its value nor any payment key was copied to source or application database. No first visitor becomes admin.

The real login button successfully launched the real Manus application login page. The isolated test browser was not logged into the owner's Manus account, so **full OAuth callback, owner-role login and authenticated production admin mutations remain unverified**. Anonymous admin/settings/export requests correctly return 401; missing/unowned order status returns 404. The owner should sign into `/account` and check `/admin` and `/payment-settings` after publication.

A real Preview defect was discovered: ingress rewrites Origin to the internal listener. A dedicated `X-DFSA-Origin` header now carries the frontend's actual origin, which must match exact native-configured Preview/public origins. Original Origin must match the public declaration or observed internal proxy request URL; cross-site fetch metadata is rejected and APIs do not grant cross-origin preflight access. This is a CSRF boundary, not authentication for direct API clients. Native JSON primitive decoding and origin readiness/bootstrap were fixed after an actual 403 regression. Random native-backed guest sessions avoid forcing ordinary new browser users into one anonymous form-limit bucket; a bounded global backstop remains, with no claim of comprehensive bot/DDoS protection.

SQL inputs use parameters and server-side schemas. JSON/raw webhook request sizes are bounded. Private responses are non-cacheable. Browser payment-return flags never confirm payment. A browser-build scan found no configured protected values in public artifacts. Raw card numbers/CVVs are never collected. No live payment or refund was attempted.

## Payment gateways — separate, evidence-based status

| Area | PayFast | Yoco | PayPal |
| --- | --- | --- | --- |
| Implementation | ITN parameter ordering/PHP encoding, passphrase signature, bounded notification parsing, official server confirmation and native event path implemented. Standard hosted-form adapter exists but initiation is blocked. | Current hosted Checkout API, server-only secret use, integer money, references, signed raw webhooks, bounded timestamp replay checks, dedupe and atomic order/payment accounting implemented. | Server order-creation adapter is gated to USD; approval/capture, verified webhook and reconciliation workflow remains incomplete pending the currency decision. |
| Credential status | Merchant ID/key/security passphrase supplied through Manus. Existing PDT key retained securely but unused by this ITN flow. | Missing merchant test secret key and webhook signing secret. | Missing client ID/secret, webhook ID and merchant ID. |
| Mode | Explicit PAYFAST_MODE not supplied; code defaults to test and does not prove keys are sandbox keys. All initiation/live activation remains disabled. | Default test; only a matching sk_test_ key and syntactically valid whsec_ signing secret can enable an authorized test setup. Disabled currently. | Default test; unavailable for ZAR transactions. |
| Checkout test | Not run against provider. | Not run against provider. | Not run against provider. |
| Webhook test | Local encoding/signature fixtures pass; authentic merchant ITN not verified. Live source/IP validation behind Manus proxy unresolved. | Raw HMAC, replay, forged/modified-body and state-event fixture tests pass; no authentic provider event received. | Authentic callback/capture/webhook not implemented/verified. Endpoint fails closed. |
| Native persistence | Shared schemas/atomic event code exist; no actual PayFast payment record created. | Native payment/order/allocation schema exists; state/idempotency/stock tests are isolated fixtures. No actual Yoco payment record created. | Schema exists but no actual PayPal capture persisted. |
| Exact blockers | Standard integration places merchant_key in a browser form, conflicting with the owner's server-only-credential rule. A documented compatible alternative/merchant arrangement is needed; explicit sandbox mode and live proxy/IP policy also required. | Add YOCO_SECRET_KEY and YOCO_WEBHOOK_SECRET in secure Manus Secrets, set YOCO_MODE=test, register actual published webhook URL, then conduct authorized provider test-mode validation. | Owner must choose manual USD quotations or an explicit conversion/rate policy because PayPal does not support ZAR. Then supply secrets and complete/verify approval, capture and webhook flows. |

**No gateway is reported production-ready.** PayFast and PayPal are not checkout options. Yoco appears only when authorized test configuration is complete and enabled; presently the public gateway list is empty and checkout clearly offers the working quotation alternative. Standard merchant-owned PUDO locker/door prices are not described as verified courier API quotations; exports/commercial packaging require quotation, and the current sandbox checkout is pickup-only.

### Integrity and inventory

Order lines, totals and balances are calculated from native records with unique idempotency and provider/capture references. Only verified captured payment affects paid amount; approval or redirect alone does not. Duplicate/out-of-order events do not double-count money or consume allocations. Partial amounts do not mark an order fully paid. Test/live rows and inventory allocations are separate. Sandbox captures **never decrement real product stock**.

Inventory is reserved natively before a provider redirect, not merely checked. Sandbox reserved/consumed allocations consume test capacity only. Successful full captures consume matching allocations; missing allocations or live stock anomalies retain verified financial accounting in a visible `paid_stock_review` state rather than falsely claiming fulfilment. Failed events, browser return/cancel and time alone do not automatically release a potentially payable checkout. No documented Yoco checkout-close/retrieve API was assumed, so holds require merchant reconciliation before safe release. Automated hold release/refunds are not implemented or simulated.

Refund initiation, direct Yoco checkout-status lookup and automated multi-gateway reconciliation are unavailable; references/events/history support manual investigation, not fabricated live reconciliation. No external action claims an unsupported operation succeeded.

## Tests and fixes

| Check | Evidence/result |
| --- | --- |
| TypeScript | pnpm check passed. |
| Unit/security/state tests | Four files, **67 tests passed**. These are isolated fixtures, not merchant sandbox transaction evidence. |
| Lint | Zero errors; seven pre-existing React fast-refresh export warnings remain. |
| Production build | Native frontend/server build passed; dependency-level use-client bundler warnings are nonfatal. Final release rebuild is recorded with the checkpoint. |
| Public HTTP | Native health/products/initial shop/blog/article HTML, 18-page manifest, missing page/article 404s, admin/settings/export denials, order ownership/missing denial, invalid form validation, forged-origin/cross-site rejection and disabled gateway list verified. |
| Native cart | Actual public write/read/reload/isolation/overstock/clear checks passed with unchanged real stock and no created order/payment. |
| Browser | Shop hydrates; SKU search narrowed to the correct White Crystal product. No console output observed in the checked state. Real login launch reaches Manus; owner login remains manual/unverified. |
| Responsive | Phone/desktop passed initially; actual 768px overflow was traced to navigation and corrected by delaying full navigation until the large breakpoint. Targeted retest passed at 390, 768, 1024 and 1280px with no horizontal overflow. |
| Performance | First-party fonts replace external font requests. Owned hero compressed from 293,446 to 222,102 bytes (71,344 bytes saved), with explicit dimensions and high fetch priority. No Lighthouse score or field Core Web Vitals measurements were invented; no performance-trace tool was available. |

## Requested research/media capabilities

MCP and relevant native web/SEO/security/performance guidance were used where applicable. Official payment research is preserved in `docs/payment-contracts.md` and `docs/research-sources.md`. No live Similarweb/Semrush/backlink report was fabricated; no competitor credit-consuming comparison was run without approval. External Cloudflare Durable Objects would conflict with the Manus-only database instruction, so durable coordination uses native SQL transactions instead. Unrequested logo/video/listicle rewrites or outbound WhatsApp campaigns were not added. Existing business contact actions remain ordinary user-initiated links.

## Remaining owner actions and acceptance limits

1. After publication, sign into `/account` using the owner's own Manus account and verify authorized `/admin` and `/payment-settings` access. A saved allow-list does not substitute for this workflow check.
2. Enter missing merchant values only through Manus Dashboard secure Secrets. Exact recognized variable names and checklists are in `docs/setup.md` and the protected Payment Settings screen; never paste keys into chat, source or app forms.
3. Resolve PayFast's no-browser-key transport/proxy validation requirements and PayPal's supported-currency policy. Then finish the gated workflows and independently verify each provider's sandbox lifecycle, genuine signed webhooks, amount/reference checks and persisted balances.
4. Before any live activation, confirm verified merchant accounts, permissions, matching live keys/modes, HTTPS published webhook URLs, permitted currencies, fulfilment/shipping, reconciliation and explicit refund authorization. Live activation is deliberately not available in this release.
5. Provide an authorized historic-data export if migration/reconciliation is desired. No old external records were erased or claimed migrated. Confirm native full-backup/recovery and retention procedures before any destructive administration.

This cycle delivers a functional native storefront/quotation foundation with secure, explicitly gated payment work. It is **not** a claim that the complete three-gateway production requirements have been met.

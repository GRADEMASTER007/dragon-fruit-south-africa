# DFSA outcomes

## Native database and preservation — authorized by the database request
- [ ] Manus must be the exclusive platform for application hosting, deployment and the primary authoritative database. No Firebase, Supabase, Vercel, Netlify, AWS, Azure, Google Cloud, external VPS or external database fallback.
- [x] Preserve valid existing source, SKUs, names, supplied prices, stock, branding, assets, navigation and important records. Do not unnecessarily rebuild or delete valid work. Inspect actual existing functionality and verify native capabilities.
- [ ] Store catalogue, user/role records, quotes, messages, orders/items, gateway settings, payment attempts and non-sensitive webhook records persistently in the native database. Do not fabricate real customers, transactions or financial records.
- [x] Correct schemas/relationships/indexes/foreign keys and unique identifiers, validation and duplicate prevention; secure server-only access, restricted sensitive information, safe errors and consistency; updates preserve related data.
- [x] Deterministic additive migrations and versioned supplied-catalogue seed preserve later edits; no deletion/overwrite of existing data without authorization and safe recovery. Historic external records require authorized export and reconciliation, not invented migration success.
- [ ] Verify actual database reads/writes and persistence after page refresh, sign-out/sign-in and redeployment where those workflows are available. Assess actual backup/recovery capabilities; do not invent native backup endpoints.
- [x] Use one read-only implementation review agent for this complex app and correct confirmed defects.

## Existing website connected to persistence
- [ ] Contact and quotation forms create real validated native records, return meaningful success/error messages and references, disable repeated in-progress submission and show loading states.
- [ ] Functional pages/navigation/buttons/forms; genuine CRUD where appropriate, search/filter/sort, validation, loading/error/empty states, desktop/tablet/mobile layouts and consistent accessible design; no fake integration or nonfunctional buttons.
- [x] Preserve existing catalogue and no-product-images instruction, existing service/legal/editorial content and PUDO option. PUDO merchant rates must not be described as live API quotes; exports/commercial packaging require quotation rather than misleading free shipping.
- [ ] Authentication and access control protect private data, database credentials, sessions/tokens, uploads/downloads and sensitive actions; secrets never appear in source, GitHub, frontend, logs or public endpoints; important operations validated server-side.
- [x] Review injection, XSS, unauthorized access and insecure data handling. Preserve existing valid authentication or use supported Manus login when adding it; do not invent Preview users or make the first visitor admin.

## Secure checkout and authoritative orders — provider activation remains gated
- [ ] Save order with unique reference before payment. Recompute SKU prices, quantity, stock, shipping and total server-side; browser price/payment status is never authoritative. Correct order reference, currency and amount visible before hosted payment.
- [ ] Customer may choose only enabled, configured gateway options applicable to the transaction. Explain pending/success/cancel/failure states. Responsive checkout never collects/stores raw card number, CVV or sensitive card data.
- [x] Sandbox and live credentials/records remain separate; do not run live payments for tests without explicit authorization. Never automatically refund or reverse financial transactions.

## Payment Settings and secrets
- [x] Dedicated protected settings section has separate PayFast merchant ID/key/passphrase/mode, Yoco secret key/test-live mode, PayPal client ID/secret/mode and supported webhook configuration.
- [x] Mask secret values and do not retrieve previously saved secrets in full; Dashboard Secrets remains authoritative, and database stores only non-sensitive settings. Verify environment delivery to server code.
- [x] Setup checklists cover merchant activation, account verification, permissions, webhook registration and currency support; distinguish configured from validated/connected. Missing credentials remain clearly identified.

## PayFast
- [ ] Current official hosted integration, payment initiation, merchant/transaction reference, amount/currency validation, secure return/cancel URLs, server-to-server ITN signature/authenticity and official verification, duplicate protection and pending/completed/cancelled/failed handling.
- [ ] Validate notifications server-side before setting paid; never trust browser redirect. Validate merchant, order, amount, currency and environment, then update native payment/order atomically.

## Yoco
- [ ] Current official hosted Checkout API, secure session creation, integer amount/currency, order/invoice references, success/cancel navigation, signed webhook verification and supported server-side status checks; no deprecated popup/token-as-payment-success flow.
- [ ] Duplicate protection and pending/success/failed/cancel states. Never mark paid solely from success return; reject forged, unrelated, incorrect-amount/order notifications.

## PayPal
- [ ] Current official Orders Checkout API: server order creation, customer approval, server capture and verified capture, correct references, supported currency/amount, webhook authentication, duplicate protection and approved/captured/pending/cancelled/failed states.
- [ ] Approval is not proof of capture. Verify capture status and merchant/account/order/amount/currency before native financial updates. Do not attempt ZAR where unsupported or invent conversion; owner currency policy choice is pending.

## Payment records, event integrity and administration
- [x] Native records include internal payment/order IDs, gateway/transaction/reference, amount/currency, status, created/updated/verified-completion timestamps, non-sensitive event results and refund references/status where supported. No secrets or card data.
- [ ] Verify authenticity/event type/order/amount/currency/account/status, deduplicate processing, record result and update atomically; handle retries and out-of-order events safely. Reject invalid/inconsistent/unrelated notifications; safe investigation for unverifiable transactions.
- [ ] Unique transaction/idempotency references prevent duplicate charges/accounting. Only verified successful payments affect paid/outstanding amount; preserve any existing partial-payment support and do not mark partial invoice fully paid.
- [ ] Transaction history, gateway-reference search and status filters, failed-payment investigation, supported reconciliation and refund tracking; unsupported operations explained, never simulated. Refund initiation requires an explicitly authorized workflow and appropriate confirmation.

## Content/search and related requested capabilities
- [ ] Public pages contain meaningful initial HTML, accurate per-route metadata, real-public-origin canonical/social metadata, correct 404s, synchronized route manifest/sitemap/robots; private account/order/admin pages remain restricted and noindex.
- [x] Existing ten blog records get usable listing/detail navigation without invented sourced claims or unapproved full rewrites. Remove illustrative customer claims from production presentation.
- [x] Use relevant named skills and MCP capabilities only where they serve the app. Do not introduce Cloudflare storage, irrelevant competitor listicles, unapproved media, outbound WhatsApp campaigns or fabricated analytics. Extra competitor backlink pulls require approval.

## Actual testing, publishing and status
- [ ] Build/compilation, existing/added tests, types/lint, navigation/forms/validation, database persistence, auth/authorization, core workflows, available API integrations, applicable files, responsive/error/console/server behavior; correct and retest discovered errors.
- [ ] Gateway sandbox checks include creation, amounts/currency, success/failure/cancel/pending, invalid signatures, duplicate/mismatched webhooks/references, persistence and outstanding balances, secrets safety and deployed webhook access. Without credentials, report code tests separately from unverified live-provider sandbox flows.
- [x] Production activation checklist covers accounts, live secrets, webhook URLs, currencies and configuration before enabling live processing. Never claim production-ready while critical flows remain unverified.
- [ ] Save accepted Manus checkpoint and native publication, verify actual deployed version/URL and essential workflows/data. No invented deployment URL; exact errors/blockers reported while independent work continues.
- [ ] Final report separately states repository/files/features, hosting/deployment/native DB/URL, schema/migrations/integrity/persistence tests, passed checks/fixed issues/bugs, each gateway's implementation/credential/mode/checkout/webhook/persistence status and exact remaining user actions; clearly distinguish implemented/tested/partial/not implemented.

## Evidence update — 15 October 2026

The original criteria above are retained. A checked item means the full stated clause is evidenced; broad clauses that include unavailable owner/provider workflows remain open even when their implemented subset works.

- Native backend/database are provisioned; six additive SQL migrations plus two versioned source seeds applied. Native counts: **141 products, 10 blog posts, 0 invented orders, 0 invented payments**. Old Supabase code/configuration is removed and the old database was never accessed or changed.
- Native cart writes persist across separate public requests; guest isolation, overstock rejection, QA-cart clear and unchanged real stock verified. Browser private/business data remains native; signed/opaque cookies are identifiers, not an external datastore. Contact/quote input validation checked without submitting fake business inquiries.
- Native account/OAuth launch reaches the real Manus app login; full callback and owner-role browser session still require the owner's own login. DFSA_ADMIN_OPEN_IDS is configured through protected input; no first-visitor privilege. Anonymous admin/payment-settings/export reads return 401; foreign/missing guest-order access returns 404.
- Owner-protected product update/version guard, inquiry status management, payment history/reference/status filtering, masked setup and recent-record export are implemented; they have not all been exercised in an owner-authenticated production browser. Export is not a full backup/PITR service.
- Hosted Yoco checkout/signature/event/amount/environment/idempotency code and durable environment-separated allocations are implemented; sandbox never consumes real product stock. No provider transaction/webhook has been verified without merchant test secrets. Live activation stays blocked.
- PayFast credentials are supplied securely; PAYFAST_SECURITY_PASSPHRASE is the actual key name and existing PDT key is retained but unused by ITN. Explicit mode and real provider checks remain absent. Standard hosted form would expose merchant_key, conflicting with the owner's server-only credential rule, so initiation is blocked; live IP/proxy-origin policy also unresolved.
- PayPal's USD quotation versus explicit conversion choice remains unanswered; no ZAR/imaginary conversion. Creation adapter only is present and gated; approval/capture/webhook/reconciliation remains incomplete.
- Four isolated test files currently pass **67 tests**. TypeScript and native production build pass; lint has zero errors and seven existing React fast-refresh warnings. Exact PayFast encoding, raw Yoco HMAC/replay checks, forged/modified/duplicate/incorrect-amount/currency events, partial/overpaid states, missing stock allocations and test/live stock separation are covered by fixtures, not claimed as provider integration tests.
- Actual public HTTP checks verify native initial shop/blog/article HTML, 18-route manifest, real missing-page/article 404s, protected API denials, invalid form validation, cross-site rejection and no improperly enabled payment options. A real Preview Origin rewrite defect was found and fixed via an explicitly allow-listed custom frontend-origin header plus strict same-origin/no-CORS checks; native JSON decoding and readiness/bootstrap checks were corrected.
- Browser shop hydration/search works with no observed console messages. Phone/tablet/desktop layout checks and published-runtime checks are being recorded separately; no fabricated Lighthouse/Core Web Vitals scores.
- Blog records/assets remain the supplied copy; no invented citations, analytics, backlinks, competitors or media. The owned hero is WebP-compressed and fonts are first-party. No Cloudflare Durable Object/external datastore, unrequested video or outbound WhatsApp campaign was introduced.
- Publication and canonical checkpoint are still pending at this update. Published URL must come from the successful Manus receipt, followed by exact non-sensitive native public-origin setup and production HTTP/cart checks.

Responsive retest: 390, 768, 1024 and 1280px storefront frames have no horizontal overflow. The compact menu is visible at phone/tablet sizes and desktop navigation fits at large sizes. Actual Manus login portal launch is verified; owner completion remains required.

# Wonderful Dragon Fruit Company · DFSA

The active application uses **Manus-managed frontend/backend hosting and the Manus native MySQL-compatible database exclusively**. No external hosting/database fallback is configured. The old external database has not been accessed, altered or erased; the owner authorized removal of its code/configuration only.

The preserved source is `GRADEMASTER007/dragon-fruit-south-africa`, source commit `813833f`. Supplied SKUs, prices and stock are retained. The catalogue contains 141 source products. Ten existing editorial records are imported into the native database; their agricultural/business claims are supplied source copy, not newly verified research. Existing farm/editorial assets are served by the Manus application. Product cards contain no product images.

## Native data

Persistent application tables cover products, users/roles, quote requests/items, contact messages, orders/items, gateway configuration, payments, non-sensitive webhook results, merchant store settings, anonymous carts/session hashes and editorial posts. No customers, orders or payments are fabricated. Migration history and versioned source seeds preserve subsequent edits. Browser cart state is a display of the native record, not authoritative local storage. Anonymous carts use a high-entropy HttpOnly `SameSite=None; Secure` cookie; the database stores its hash and a 90-day session expiry.

`DATABASE_URL` is injected by Manus for server code. Never paste it into source, client code, application tables, logs or Git. Development and deployed instances share the same database. Do not run destructive SQL or clear business data without explicit authorization. The available native capability does not expose a separate testing database, point-in-time restore, or managed backup/export API.

## Commands

Use Node 22 and pinned `pnpm@11.25.0`:

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm exec tsx scripts/import-blog.ts
pnpm exec tsx scripts/set-site-origin.ts preview_site_origin <exact-returned-Manus-Preview-origin>
pnpm check
pnpm test
pnpm build
pnpm dev
```

Migrations and imports are finite administrative steps, not implicit container compilation or startup tasks. `pnpm db:verify` writes a clearly labelled persistence probe (not a business record), closes the connection and verifies the record after reconnect. Source tests make no business-data writes.

## Serving

The preserved React/TanStack Start/Vite frontend and native APIs are built together with the official Nitro Node preset. Manus runs `Dockerfile`, starts `.output/server/index.mjs` and checks `/api/health`. Preview listens on port 3000; published startup honours `PORT`. `public/manus-routes.json` lists page routes. Public catalogue MCP endpoints read the same native catalogue and do not require an external adapter or database.

## Current status

Native catalogue, blog, carts, notice preferences, quotation/contact writes and protected administration are implemented. Manus JWT/OAuth account login, owner-identity allow-list, catalogue optimistic edits, inquiry status management, protected snapshots and masked Payment Settings are implemented. No enabled payment option is currently exposed, no real payment was taken and no payment history was invented. Yoco hosted Checkout, signed webhook processing, atomic order accounting and environment-separated inventory allocation have code-level tests; actual provider verification is blocked by missing Yoco credentials. PayFast ITN/signature code exists, but initiation is blocked by the standard form's browser merchant-key requirement and unresolved live origin/IP policy. PayPal creation adapter is gated on USD; capture/webhooks await the owner's supported-currency quotation/conversion decision and credentials. All live payments remain disabled.

See `docs/setup.md` for exact origin bootstrap, secure key names, current blockers and activation constraints. Browser POSTs intentionally fail closed without trusted native origin settings; health reports preparation_required in that state. `docs/inventory-allocation.md` documents native reservation handling and why browser cancellation/clock expiry cannot release potentially payable Yoco checkouts automatically. Sandbox captures never decrement real catalogue stock. No direct Yoco Checkout retrieve endpoint, automatic email delivery, courier booking or refund action is simulated.

A working Preview or passing build is not a published or payment-ready release. See `plan.md`, `TODO.md` and `docs/research-sources.md` for remaining scope and verified references.

# Application constraints

The active frontend, backend, database and deployment are exclusively Manus-managed. Use the injected server-only native `DATABASE_URL`; do not configure an external database or hosting fallback. Preserve the original source repository history; never force-push.

The owner explicitly requested removal of the previous database integration's code and configuration, while leaving its old external database untouched. Do not contact, migrate or delete that old database without new explicit authorization. The native catalogue import contains 141 supplied product records, not historic orders or messages.

Native development and deployment share database state. Use additive versioned migrations and preserve owner edits. Keep credentials in Manus secure Secrets, never in source, browser bundles, logs or application tables. Do not seed fabricated customers, orders or payments. Only a server-verified gateway event/capture may mark an order paid; browser redirects cannot do so. Keep payment options unavailable until configured and verified. Live transactions and refunds are not automatic test actions.

Follow `plan.md` and `TODO.md` for implemented versus outstanding scope. Use `pnpm check`, `pnpm test`, `pnpm build`, `pnpm db:migrate` and `pnpm db:verify` as appropriate; migrations and database writes affect durable shared state. The original repository snapshot and its database have been preserved outside this active application.

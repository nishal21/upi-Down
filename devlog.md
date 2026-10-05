# Devlog

## 2026-10-05 — v0.1 built

Done
- Monorepo (pnpm): `apps/web` (Next 16 static export + Capacitor 8 Android), `apps/api` (Fastify + Postgres + Redis), `packages/shared`.
- Board of 42 banks + 8 UPI apps, report flow, favourites, WhatsApp share, Hindi/English, dark/light, PWA, 42 SEO bank pages.
- API: in-memory 15-min windows, 5s Postgres flush, SSE broadcast, Redis rate limits, Turnstile only during spikes, degrade switch.
- Android: targetSdk 36, R8 + resource shrinking, no backup, predictive back.
- Deploy kit in `deploy/` with CPU/RAM caps so NMhelper is not affected.
- Web build verified (51 pages). Browser-tested report flow live.

Next
- Create upload keystore + `keystore.properties`, run `gradlew bundleRelease`, Play closed test (12 testers / 14 days).
- Deploy per `deploy/DEPLOY.md`. Confirm `privacy@nishal.dev` exists or change it in `apps/web/src/app/privacy/page.tsx`.
- Rotate the Aceternity key (it was pasted in chat). Optional: Turnstile site key.
- Gotcha: after any `shadcn add`, fix `from "cn"` imports to `@/lib/utils` and remove the stray `cn` package.

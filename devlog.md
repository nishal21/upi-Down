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
- Gotcha: after any `shadcn add`

## NPCI data, Turnstile, 13 languages
Done
- Uses NPCI's full member list: 751 banks are searchable, 41 are on the board, and there are 61 extra apps. The drawer has an app search. Refresh steps are in the README.
- Turnstile: site key in `apps/web/.env.production`. The API checks the action, the hostname and a timeout. Paytm Payments Bank was dropped because it is no longer live.
- Languages: en, hi, bn, mr, te, ta, gu, ur (RTL), kn, or, ml, pa, as. Checked in the browser on mobile in ta, ml and ur.
- License is PolyForm Noncommercial. Caches and temp files go to `D:\DevCache` (Gradle, npm, pnpm, pip).
- Build verified: 760 pages, prod bundle has the real site key and no localhost, cap sync done.
Next
- Put the Turnstile secret in `deploy/.env` on the VPS. Run `gradlew bundleRelease` with `GRADLE_USER_HOME=D:\DevCache\gradle`.
- Still missing scheduled languages: Kashmiri, Konkani, Maithili, Manipuri, Nepali, Sanskrit, Santali, Sindhi, Bodo, Dogri.

## Hero, lag, 12h IST, error pages
Done
- Hero backdrop is a full layered aurora: 3 blurred orbs + sheen + ring, status-tinted, grid wash. Quiet/unknown tone mixes ink + green so it does not vanish on cream.
- Bank drawer shows short code, Own UPI app / wallet tags, NPCI member. Panel is code-split; open uses `startTransition`.
- ⌘K suggestion list max height ~180px; denser rows. Header IST is `7:28 AM IST` (explicit AM/PM).
- 404 / error / global-error share the aurora. 404 lists major banks with short + full name.
Next
- Put the Turnstile secret in `deploy/.env`. `gradlew bundleRelease` with Gradle on D:.

## Static export 404 in next dev
Done
- `apps/web/next.config.ts` only sets `output: "export"` in production. Unknown bank URLs now hit `not-found` in `next dev`; `next build` still exports static HTML for Capacitor / nginx.

## Full-bleed hero + ticker clicks
Done
- Hero sits outside `max-w-6xl` so the backdrop and bank ticker run edge-to-edge on wide screens; headline stays in the content column.
- Removed the hero ring circle.
- Ticker pauses on pointer hover so CSS transform no longer eats clicks; open bank is synchronous again.

## Empty bank drawer + short panel
Done
- Dropped dynamic import of BankPanel (skeleton could stick forever after search submit).
- Right drawer is `h-dvh` full height; bottom sheet allows `94dvh`.
- Search submit captures the query before the vanish animation clears the field.

## SEO + GEO + AEO
Done
- `apps/web/src/lib/seo.ts`: titles, keywords, home/bank FAQs, major bank links, JSON-LD helper.
- Home: absolute title, WebSite SearchAction (`?q=`), WebApplication, Organization, WebPage+Speakable; crawlable `HomeSeo` FAQ + bank links.
- Bank pages: question H1, answer blurb, FAQPage + BreadcrumbList + Speakable; richer meta.
- Layout: en-IN OG, geo.region IN, googleBot max-snippet; robots allow AI crawlers; sitemap priorities by tier; `public/llms.txt`; footer link.
- `BankSearch` opens first match from `?q=`. Typecheck clean.
Next
- Deploy, then Search Console: submit sitemap `https://upidown.nishal.dev/sitemap.xml`, request indexing on home + tier-1 banks.
- Ranking is not guaranteed; needs crawl time, backlinks, and real report traffic.

## About + footer credits
Done
- About “Made by”: Nishal K, github.com/nishal21, nishal.dev, repo link.
- Footer: © {year} Nishal K + repo URL; GitHub nav link.
- Layout author/creator + llms.txt author/source updated.

## Deploy Dockerfile.api fix
Done
- Runtime stage used `require('./package.json.src')` which Node parses as JS → SyntaxError on `"name":`.
- Now `JSON.parse(fs.readFileSync(...))`. Push + rebuild on VPS.

## Deploy nginx http2
Done
- VPS nginx rejected `http2 on;` → use `listen 443 ssl http2;`. 526 was origin never loading the site.

## VPS live (upidown.nishal.dev)
Done
- API + Postgres + Redis healthy on 127.0.0.1:3020/5442/6390.
- Static `web/out` built on VPS; Nginx + CF Origin cert; degrade cron installed.
- Verified: public 200, `/api/healthz` ok, `/sbi-upi-down/` 200.
Next
- Commit/push Dockerfile.api + nginx http2 fixes so VPS matches GitHub.
- Optional CF cache: `/api/status` 5s; bypass stream + report.
- Search Console sitemap; confirm Turnstile hostnames include upidown.nishal.dev.

## Favicon
Done
- `favicon.ico` (public + app), layout icon links, `pnpm icons` / `prebuild` via `scripts/icons.mjs`.
- VPS: git pull → rebuild web → rsync `web/out`.

## Board load + tab lag
Done
- Show BOARD_BANKS names immediately (no skeleton wait on API).
- Tabs `forceMount` + hide inactive; drop staggered `row-in` remount animation.
- Tab change via `startTransition`; hydrate status from localStorage on client module load.

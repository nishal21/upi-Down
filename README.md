# UPI Down?

Open it when a UPI payment fails. See which banks and UPI apps other people are reporting as slow or down right now, tap once to add your own report, and share the status on WhatsApp. No login. Status comes from user reports, not NPCI.

Web: https://upidown.nishal.dev · Android: Capacitor wrapper of the same static site.

## Layout

- `apps/web`: Next.js 16 static export, Tailwind 4 + daisyUI 5, shadcn, Magic UI, Aceternity. `android/` is the Capacitor project.
- `apps/api`: Fastify 5, Postgres, Redis. Live updates over SSE.
- `packages/shared`: bank list, status algorithm, types, share text.
- `deploy/`: Docker Compose, Nginx and the VPS guide (`deploy/DEPLOY.md`).

## Run locally (no Docker needed)

```sh
pnpm install
pnpm --filter @upi-down/api dev:db   # PGlite on :5442
pnpm --filter @upi-down/api dev      # API on :3020 (REDIS_URL=memory)
pnpm --filter web dev                # http://localhost:3000
pnpm --filter @upi-down/api seed     # optional fake reports
```

Copy `apps/api/.env.example` to `.env` and `apps/web/.env.example` to `.env.development.local` first. Don't use `.env.local` in `apps/web`: Next reads it during production builds too, and it overrides `.env.production`.

## Bank and app data

`data/npci-upi-members.json` is a copy of NPCI's [UPI members list](https://www.npci.org.in/product/upi/all-members): 751 banks and 61 extra apps. `node scripts/npci-sync.mjs` regenerates `packages/shared/src/npci.generated.ts` from it. NPCI blocks scripted requests, so to refresh it, open that page in a browser and save the responses from `/api/all-members-tab-details?product_name=UPI&tab_name=<upi|3rd-party-apps|ppi-apps>&page_no=1&page_size=2000&locale=en`.

## Languages

English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu (right to left), Kannada, Odia, Malayalam, Punjabi and Assamese. Strings live in `apps/web/src/lib/locales/`. Every file is typed as `Dict` from `en.ts`, so a missing key fails typecheck.

## License

[PolyForm Noncommercial 1.0.0](LICENSE.md). Free for personal and non-commercial use. Commercial use needs permission.

## Android

`pnpm android` builds the site and runs `cap sync`. Release builds use R8 (minify + resource shrinking). Signing setup is in `deploy/DEPLOY.md`.

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

Copy `apps/api/.env.example` to `.env` and `apps/web/.env.example` to `.env.local` first.

## Android

`pnpm android` builds the site and runs `cap sync`. Release builds use R8 (minify + resource shrinking). Signing setup is in `deploy/DEPLOY.md`.

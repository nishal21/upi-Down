# Learning journal

- PGlite socket server takes one connection at a time: set `DB_POOL=1` in dev or you get ECONNRESET.
- `REDIS_URL=memory` uses ioredis-mock (dynamic import, so prod image doesn't need it).
- Magic UI BlurFade triggers on in-view; inside scroll lists rows stayed invisible. A CSS `row-in` keyframe is cheaper and reliable on Android WebView.
- Radix Tooltip `data-state` overwrites Toggle's `data-state` when using `asChild`; wrap the Toggle in a `<span>`.
- Capacitor 8 SystemBars key is `initialViewportFitValueHint: "cover"`, not `initialViewportFitCover`.
- Capacitor Android serves from `https://localhost`, so the API CORS list must include it.
- On a shared VPS: Docker `cpus` + `mem_limit` + low `cpu_shares` plus an Nginx `limit_conn` on SSE keeps a viral spike from hurting other apps. Cloudflare 5s edge cache on `/api/status` absorbs most reads.
- Status rule: down = ≥15 reports, ≥5× baseline, ≥50% failures; slow = ≥6 and ≥2.5×.

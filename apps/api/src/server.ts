import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ServerResponse } from "node:http";
import {
  BANK_BY_ID,
  REPORT_KINDS,
  UPI_APP_BY_ID,
  verdict,
  type ApiError,
  type ReportBody,
  type ReportResult,
} from "@upi-down/shared";
import { config } from "./config";
import { migrate, purge, sql } from "./db";
import { isDegraded, rateLimit, redis } from "./redis";
import {
  appStatus,
  bankStatus,
  flushPending,
  getSnapshot,
  getSnapshotJson,
  isSpike,
  rebuild,
  record,
  refreshBaselines,
  refreshSparks,
  warmStart,
} from "./store";

const app = Fastify({ logger: { level: "info" }, trustProxy: true, bodyLimit: 4096 });

await app.register(cors, {
  origin: config.corsOrigins,
  methods: ["GET", "POST"],
  maxAge: 86400,
});

const sseClients = new Set<ServerResponse>();
let degraded = false;

function clientIp(req: { headers: Record<string, unknown>; ip: string }): string {
  // Nginx sets X-Real-IP from Cloudflare's verified ranges (real_ip module); never trust client headers directly.
  return String(req.headers["x-real-ip"] ?? req.ip);
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!config.turnstileSecret) return true;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;
  if (config.turnstileHostnames.size === 0) return false;
  let result: { success?: boolean; action?: string; hostname?: string };
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret: config.turnstileSecret, response: token, remoteip: ip }),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = (await r.json()) as typeof result;
  } catch (err) {
    app.log.warn({ err }, "turnstile siteverify failed");
    return false;
  }
  return (
    result.success === true &&
    result.action === "report" &&
    typeof result.hostname === "string" &&
    config.turnstileHostnames.has(result.hostname)
  );
}

app.get("/api/healthz", async () => ({ ok: true, sse: sseClients.size, degraded }));

app.get("/api/status", async (_req, reply) => {
  reply.header("cache-control", "public, max-age=5, stale-while-revalidate=25");
  reply.type("application/json").send(getSnapshotJson());
});

app.get("/api/status/stream", (req, reply) => {
  if (degraded || sseClients.size >= config.maxSse) {
    reply.code(503).header("retry-after", "30").send({ ok: false, error: "server" });
    return;
  }
  const res = reply.raw;
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
    "access-control-allow-origin": String(req.headers.origin ?? "*"),
  });
  res.write(`retry: 10000\nevent: status\ndata: ${getSnapshotJson()}\n\n`);
  sseClients.add(res);
  req.raw.on("close", () => sseClients.delete(res));
  reply.hijack();
});

app.post<{ Body: ReportBody }>("/api/report", async (req, reply) => {
  const b = req.body;
  if (
    !b ||
    typeof b.bankId !== "string" ||
    !BANK_BY_ID[b.bankId] ||
    !REPORT_KINDS.includes(b.kind) ||
    typeof b.deviceId !== "string" ||
    b.deviceId.length < 8 ||
    b.deviceId.length > 64 ||
    (b.appId !== undefined && !UPI_APP_BY_ID[b.appId])
  ) {
    return reply.code(400).send({ ok: false, error: "invalid" } satisfies ApiError);
  }

  const ip = clientIp(req);
  if (isSpike(config.spikePerMinute) && !(await verifyTurnstile(b.turnstileToken, ip))) {
    return reply.code(403).send({ ok: false, error: "captcha" } satisfies ApiError);
  }

  const wait = await rateLimit(b.deviceId, ip, b.bankId);
  if (wait > 0) {
    reply.header("retry-after", String(wait));
    return reply.code(429).send({ ok: false, error: "rate_limited", retryAfter: wait } satisfies ApiError);
  }

  record(b.bankId, b.kind, b.appId ?? null);
  const bank = bankStatus(b.bankId);
  const appS = b.appId ? appStatus(b.appId) : undefined;
  return {
    ok: true,
    verdict: verdict({ bankStatus: bank.status, bankTotal: bank.total, appStatus: appS?.status }),
    bank,
  } satisfies ReportResult;
});

function broadcast() {
  const payload = `event: status\ndata: ${getSnapshotJson()}\n\n`;
  for (const res of sseClients) res.write(payload);
}

function every(ms: number, fn: () => Promise<unknown> | unknown) {
  const run = async () => {
    try {
      await fn();
    } catch (err) {
      app.log.error(err);
    }
  };
  setInterval(run, ms).unref();
}

await migrate();
await warmStart();
await Promise.all([refreshSparks(), refreshBaselines()]);
rebuild(false);

every(5_000, async () => {
  await flushPending();
  degraded = await isDegraded();
  if (degraded) for (const res of sseClients) res.end();
  if (rebuild(degraded)) broadcast();
});
every(25_000, () => {
  for (const res of sseClients) res.write(": ping\n\n");
});
every(60_000, refreshSparks);
every(10 * 60_000, refreshBaselines);
every(6 * 60 * 60_000, purge);

const shutdown = async () => {
  for (const res of sseClients) res.end();
  await flushPending().catch(() => {});
  await app.close();
  await sql.end({ timeout: 5 });
  redis.disconnect();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: config.port, host: config.host });
app.log.info(`UPI Down API on ${config.host}:${config.port} · ${getSnapshot().banks.length} banks`);

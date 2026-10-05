function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3020),
  host: process.env.HOST ?? "127.0.0.1",
  databaseUrl: req("DATABASE_URL", "postgres://upidown:upidown@127.0.0.1:5442/upidown"),
  redisUrl: req("REDIS_URL", "redis://127.0.0.1:6390"),
  hashSecret: req("HASH_SECRET", process.env.NODE_ENV === "production" ? undefined : "dev-secret"),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  maxSse: Number(process.env.MAX_SSE ?? 2000),
  turnstileSecret: process.env.TURNSTILE_SECRET || undefined,
  /** Frontend hostnames siteverify must report. Never include localhost in production. */
  turnstileHostnames: new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
  ),
  spikePerMinute: Number(process.env.SPIKE_PER_MINUTE ?? 600),
};

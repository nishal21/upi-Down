import postgres from "postgres";
import { config } from "./config";

export const sql = postgres(config.databaseUrl, {
  max: Number(process.env.DB_POOL ?? 4),
  idle_timeout: 30,
  onnotice: () => {},
});

export async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id         bigserial PRIMARY KEY,
      bank_id    text NOT NULL,
      app_id     text,
      kind       text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS reports_created_idx ON reports (created_at)`;
  await sql`
    CREATE TABLE IF NOT EXISTS hourly_counts (
      entity text NOT NULL,
      hour   timestamptz NOT NULL,
      count  integer NOT NULL,
      PRIMARY KEY (entity, hour)
    )`;
}

export interface PendingReport {
  bankId: string;
  appId: string | null;
  kind: string;
  at: Date;
}

export async function flush(rows: PendingReport[]): Promise<void> {
  if (rows.length === 0) return;
  await sql`
    INSERT INTO reports ${sql(
      rows.map((r) => ({ bank_id: r.bankId, app_id: r.appId, kind: r.kind, created_at: r.at })),
    )}`;

  const hourly = new Map<string, number>();
  for (const r of rows) {
    const hour = new Date(r.at);
    hour.setUTCMinutes(0, 0, 0);
    const h = hour.toISOString();
    for (const entity of [`bank:${r.bankId}`, r.appId ? `app:${r.appId}` : null]) {
      if (!entity) continue;
      const k = `${entity}|${h}`;
      hourly.set(k, (hourly.get(k) ?? 0) + 1);
    }
  }
  const values = [...hourly].map(([k, count]) => {
    const [entity, hour] = k.split("|");
    return { entity, hour, count };
  });
  await sql`
    INSERT INTO hourly_counts ${sql(values)}
    ON CONFLICT (entity, hour) DO UPDATE SET count = hourly_counts.count + EXCLUDED.count`;
}

/** Last 24 hourly buckets per entity, oldest first. */
export async function sparks(): Promise<Map<string, number[]>> {
  const rows = await sql<{ entity: string; idx: number; count: number }[]>`
    SELECT entity,
           (23 - floor(extract(epoch FROM date_trunc('hour', now()) - hour) / 3600))::int AS idx,
           count
    FROM hourly_counts
    WHERE hour > date_trunc('hour', now()) - interval '24 hours'`;
  const out = new Map<string, number[]>();
  for (const r of rows) {
    if (r.idx < 0 || r.idx > 23) continue;
    const arr = out.get(r.entity) ?? Array<number>(24).fill(0);
    arr[r.idx] = r.count;
    out.set(r.entity, arr);
  }
  return out;
}

/** Avg reports per 15-min window at the current hour-of-day, last 7 days. */
export async function baselines(): Promise<Map<string, { baseline: number; hasHistory: boolean }>> {
  const rows = await sql<{ entity: string; same_hour: number; any: number }[]>`
    SELECT entity,
           coalesce(sum(count) FILTER (WHERE extract(hour FROM hour) = extract(hour FROM now())), 0)::int AS same_hour,
           sum(count)::int AS any
    FROM hourly_counts
    WHERE hour > now() - interval '7 days' AND hour < date_trunc('hour', now())
    GROUP BY entity`;
  const out = new Map<string, { baseline: number; hasHistory: boolean }>();
  for (const r of rows) {
    out.set(r.entity, { baseline: r.same_hour / 7 / 4, hasHistory: r.any > 0 });
  }
  return out;
}

export async function recentWindow(): Promise<PendingReport[]> {
  const rows = await sql<{ bank_id: string; app_id: string | null; kind: string; created_at: Date }[]>`
    SELECT bank_id, app_id, kind, created_at FROM reports
    WHERE created_at > now() - interval '15 minutes'`;
  return rows.map((r) => ({ bankId: r.bank_id, appId: r.app_id, kind: r.kind, at: r.created_at }));
}

export async function purge(): Promise<void> {
  await sql`DELETE FROM reports WHERE created_at < now() - interval '30 days'`;
  await sql`DELETE FROM hourly_counts WHERE hour < now() - interval '400 days'`;
}

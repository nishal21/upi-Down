import {
  BOARD_APPS,
  BOARD_BANKS,
  STATUS_RANK,
  WINDOW_MINUTES,
  score,
  type EntityStatus,
  type RecentReport,
  type ReportKind,
  type StatusSnapshot,
  type WindowCounts,
} from "@upi-down/shared";
import { baselines, flush, recentWindow, sparks, type PendingReport } from "./db";

type Buckets = Map<number, WindowCounts>;

const windows = new Map<string, Buckets>();
const pending: PendingReport[] = [];
const recent: RecentReport[] = [];
let sparkCache = new Map<string, number[]>();
let baselineCache = new Map<string, { baseline: number; hasHistory: boolean }>();
let reportsThisMinute = { minute: 0, count: 0 };

let snapshot: StatusSnapshot = {
  updatedAt: new Date().toISOString(),
  degraded: false,
  banks: [],
  apps: [],
  recent: [],
};
let snapshotJson = JSON.stringify(snapshot);

const minuteOf = (d: Date) => Math.floor(d.getTime() / 60_000);
const empty = (): WindowCounts => ({ failed: 0, pending: 0, slow: 0 });

function bump(entity: string, kind: ReportKind, at: Date) {
  const m = minuteOf(at);
  let b = windows.get(entity);
  if (!b) windows.set(entity, (b = new Map()));
  const c = b.get(m) ?? empty();
  c[kind] += 1;
  b.set(m, c);
}

function windowFor(entity: string, nowMinute: number): WindowCounts {
  const out = empty();
  const b = windows.get(entity);
  if (!b) return out;
  for (const [m, c] of b) {
    if (m <= nowMinute - WINDOW_MINUTES) {
      b.delete(m);
      continue;
    }
    out.failed += c.failed;
    out.pending += c.pending;
    out.slow += c.slow;
  }
  return out;
}

export function record(bankId: string, kind: ReportKind, appId: string | null, at = new Date()) {
  bump(`bank:${bankId}`, kind, at);
  if (appId) bump(`app:${appId}`, kind, at);
  pending.push({ bankId, appId, kind, at });
  recent.unshift({ bankId, appId: appId ?? undefined, kind, at: at.toISOString() });
  if (recent.length > 20) recent.length = 20;

  const m = minuteOf(at);
  if (reportsThisMinute.minute !== m) reportsThisMinute = { minute: m, count: 0 };
  reportsThisMinute.count += 1;
}

export function isSpike(limit: number): boolean {
  return reportsThisMinute.minute === minuteOf(new Date()) && reportsThisMinute.count > limit;
}

function entityStatus(entity: string, id: string, nowMinute: number): EntityStatus {
  const counts = windowFor(entity, nowMinute);
  const base = baselineCache.get(entity) ?? { baseline: 0, hasHistory: false };
  const s = score({ window: counts, ...base });
  return {
    id,
    status: s.status,
    total: s.total,
    counts,
    spark: sparkCache.get(entity) ?? Array<number>(24).fill(0),
  };
}

const bySeverity = (a: EntityStatus, b: EntityStatus) =>
  STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.total - a.total;

function tracked(prefix: "bank" | "app", always: { id: string }[], nowMinute: number): EntityStatus[] {
  const pinned = new Set(always.map((e) => e.id));
  const ids = new Set(pinned);
  for (const key of [...windows.keys(), ...sparkCache.keys()]) {
    if (key.startsWith(`${prefix}:`)) ids.add(key.slice(prefix.length + 1));
  }
  const out: EntityStatus[] = [];
  for (const id of ids) {
    const e = entityStatus(`${prefix}:${id}`, id, nowMinute);
    if (pinned.has(id) || e.total > 0 || e.spark.some((v) => v > 0)) out.push(e);
  }
  return out.sort(bySeverity);
}

export function rebuild(degraded: boolean): boolean {
  const nowMinute = minuteOf(new Date());
  const next: StatusSnapshot = {
    updatedAt: new Date().toISOString(),
    degraded,
    banks: tracked("bank", BOARD_BANKS, nowMinute),
    apps: tracked("app", BOARD_APPS, nowMinute),
    recent: recent.slice(0, 12),
  };
  const { updatedAt: _a, ...nextBody } = next;
  const { updatedAt: _b, ...prevBody } = snapshot;
  const changed = JSON.stringify(nextBody) !== JSON.stringify(prevBody);
  snapshot = next;
  snapshotJson = JSON.stringify(next);
  return changed;
}

export const getSnapshot = () => snapshot;
export const getSnapshotJson = () => snapshotJson;

export function bankStatus(bankId: string): EntityStatus {
  return entityStatus(`bank:${bankId}`, bankId, minuteOf(new Date()));
}

export function appStatus(appId: string): EntityStatus {
  return entityStatus(`app:${appId}`, appId, minuteOf(new Date()));
}

export async function flushPending(): Promise<void> {
  if (pending.length === 0) return;
  const batch = pending.splice(0, pending.length);
  try {
    await flush(batch);
  } catch (err) {
    pending.unshift(...batch.slice(-5000));
    throw err;
  }
}

export async function refreshSparks() {
  sparkCache = await sparks();
}

export async function refreshBaselines() {
  baselineCache = await baselines();
}

export async function warmStart() {
  for (const r of await recentWindow()) {
    bump(`bank:${r.bankId}`, r.kind as ReportKind, r.at);
    if (r.appId) bump(`app:${r.appId}`, r.kind as ReportKind, r.at);
  }
}

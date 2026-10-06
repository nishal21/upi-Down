"use client";

import { useSyncExternalStore } from "react";
import type { ApiError, ReportBody, ReportResult, StatusSnapshot } from "@upi-down/shared";
import { API_URL } from "./config";

export type Connection = "connecting" | "live" | "polling" | "offline";

interface LiveState {
  snapshot: StatusSnapshot | null;
  connection: Connection;
  /** Snapshot came from the on-device cache, not the network. */
  stale: boolean;
}

const CACHE_KEY = "upidown-last-status";
const listeners = new Set<() => void>();

function readCache(): StatusSnapshot | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const snap = JSON.parse(cached) as StatusSnapshot;
    if (!snap || !Array.isArray(snap.banks) || !Array.isArray(snap.apps)) return null;
    return snap;
  } catch {
    return null;
  }
}

/** Client module load: show last snapshot immediately (names + status), then refresh. */
let state: LiveState =
  typeof window !== "undefined"
    ? (() => {
        const snap = readCache();
        return { snapshot: snap, connection: "connecting" as Connection, stale: !!snap };
      })()
    : { snapshot: null, connection: "connecting", stale: false };
let started = false;
let source: EventSource | null = null;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let sseFailures = 0;

function emit(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function accept(snapshot: StatusSnapshot) {
  emit({ snapshot, stale: false });
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {}
}

async function poll() {
  if (pollTimer) clearTimeout(pollTimer);
  try {
    const res = await fetch(`${API_URL}/api/status`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const snap = (await res.json()) as StatusSnapshot;
    accept(snap);
    if (state.connection !== "live") emit({ connection: "polling" });
    pollTimer = setTimeout(tick, snap.degraded ? 60_000 : 30_000);
  } catch {
    emit({ connection: navigator.onLine ? "polling" : "offline", stale: true });
    pollTimer = setTimeout(tick, 20_000);
  }
}

function tick() {
  if (document.visibilityState !== "visible") return;
  if (sseFailures < 2 && !state.snapshot?.degraded && typeof EventSource !== "undefined") connect();
  else void poll();
}

function connect() {
  source?.close();
  const es = new EventSource(`${API_URL}/api/status/stream`);
  source = es;
  es.addEventListener("status", (e) => {
    sseFailures = 0;
    accept(JSON.parse((e as MessageEvent).data) as StatusSnapshot);
    emit({ connection: "live" });
  });
  es.onerror = () => {
    es.close();
    if (source === es) source = null;
    sseFailures += 1;
    void poll();
  };
}

function disconnect() {
  source?.close();
  source = null;
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
}

function start() {
  if (started) return;
  started = true;
  if (!state.snapshot) {
    const cached = readCache();
    if (cached) emit({ snapshot: cached, stale: true });
  }

  void poll().then(() => {
    if (sseFailures < 2 && !state.snapshot?.degraded) connect();
  });

  // Close the stream when the app is in the background: saves battery and VPS connections.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      sseFailures = 0;
      void poll().then(tick);
    } else disconnect();
  });
  window.addEventListener("online", () => void poll());
  window.addEventListener("offline", () => emit({ connection: "offline", stale: true }));
}

/** Kick off status polling before Home mounts (e.g. during onboarding). */
export function warmLive() {
  start();
}

function subscribe(l: () => void) {
  listeners.add(l);
  start();
  return () => listeners.delete(l);
}

const SERVER_STATE: LiveState = { snapshot: null, connection: "connecting", stale: false };

export function useLive(): LiveState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

export async function sendReport(body: ReportBody): Promise<ReportResult | ApiError> {
  try {
    const res = await fetch(`${API_URL}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as ReportResult | ApiError;
    if (data.ok) void poll();
    return data;
  } catch {
    return { ok: false, error: "server" };
  }
}

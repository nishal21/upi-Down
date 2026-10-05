import type { ReportKind, Status, Verdict, WindowCounts } from "./status";

export interface EntityStatus {
  id: string;
  status: Status;
  total: number;
  counts: WindowCounts;
  /** 24 hourly buckets, oldest first. */
  spark: number[];
}

export interface StatusSnapshot {
  updatedAt: string;
  degraded: boolean;
  banks: EntityStatus[];
  apps: EntityStatus[];
  recent: RecentReport[];
}

export interface RecentReport {
  bankId: string;
  appId?: string;
  kind: ReportKind;
  at: string;
}

export interface ReportBody {
  bankId: string;
  kind: ReportKind;
  appId?: string;
  deviceId: string;
  turnstileToken?: string;
}

export interface ReportResult {
  ok: true;
  verdict: Verdict;
  bank: EntityStatus;
}

export interface ApiError {
  ok: false;
  error: "rate_limited" | "invalid" | "captcha" | "server";
  retryAfter?: number;
}

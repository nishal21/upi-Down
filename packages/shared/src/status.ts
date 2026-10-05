export type Status = "down" | "slow" | "ok" | "unknown";
export type ReportKind = "failed" | "pending" | "slow";

export const REPORT_KINDS: ReportKind[] = ["failed", "pending", "slow"];
export const WINDOW_MINUTES = 15;

export interface WindowCounts {
  failed: number;
  pending: number;
  slow: number;
}

export interface ScoreInput {
  window: WindowCounts;
  /** Average reports per 15-min window at this hour over the last 7 days. */
  baseline: number;
  /** Any reports at all in the last 7 days. */
  hasHistory: boolean;
}

export interface Score {
  status: Status;
  total: number;
  ratio: number;
}

const DOWN_MIN = 15;
const DOWN_RATIO = 5;
const SLOW_MIN = 6;
const SLOW_RATIO = 2.5;
const BASELINE_FLOOR = 1;

export function totalOf(w: WindowCounts): number {
  return w.failed + w.pending + w.slow;
}

export function score({ window, baseline, hasHistory }: ScoreInput): Score {
  const total = totalOf(window);
  const ratio = total / Math.max(baseline, BASELINE_FLOOR);

  if (total >= DOWN_MIN && ratio >= DOWN_RATIO && window.failed >= total / 2) {
    return { status: "down", total, ratio };
  }
  if (total >= SLOW_MIN && ratio >= SLOW_RATIO) {
    return { status: "slow", total, ratio };
  }
  if (total === 0 && !hasHistory) {
    return { status: "unknown", total, ratio };
  }
  return { status: "ok", total, ratio };
}

export const STATUS_RANK: Record<Status, number> = { down: 0, slow: 1, ok: 2, unknown: 3 };

export type Verdict = "bank" | "app" | "you";

export interface VerdictInput {
  bankStatus: Status;
  bankTotal: number;
  appStatus?: Status;
}

/** "Is it just me?" — answered right after a report. */
export function verdict({ bankStatus, bankTotal, appStatus }: VerdictInput): Verdict {
  if (bankStatus === "down" || bankStatus === "slow" || bankTotal >= SLOW_MIN) return "bank";
  if (appStatus === "down" || appStatus === "slow") return "app";
  return "you";
}

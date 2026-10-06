import type { Status } from "./status";

const PHRASE: Record<Status, string> = {
  down: "looks down",
  slow: "looks slow",
  ok: "looks fine",
  unknown: "has no recent reports",
};

export function istTime(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = (parts.find((p) => p.type === "dayPeriod")?.value ?? "").toUpperCase();
  return `${hour}:${minute} ${dayPeriod}`.trim();
}

export function shareLine(short: string, status: Status, date: Date = new Date()): string {
  return `${short} UPI ${PHRASE[status]} · ${istTime(date)} IST`;
}

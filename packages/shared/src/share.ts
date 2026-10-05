import type { Status } from "./status";

const PHRASE: Record<Status, string> = {
  down: "looks down",
  slow: "looks slow",
  ok: "looks fine",
  unknown: "has no recent reports",
};

export function istTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function shareLine(short: string, status: Status, date: Date = new Date()): string {
  return `${short} UPI ${PHRASE[status]} · ${istTime(date)} IST`;
}

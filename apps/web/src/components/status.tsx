"use client";

import { CircleCheck, CircleDashed, Hourglass, OctagonX, type LucideIcon } from "lucide-react";
import type { Status } from "@upi-down/shared";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const STATUS_ICON: Record<Status, LucideIcon> = {
  down: OctagonX,
  slow: Hourglass,
  ok: CircleCheck,
  unknown: CircleDashed,
};

export const STATUS_TEXT: Record<Status, string> = {
  down: "text-down",
  slow: "text-slow",
  ok: "text-ok",
  unknown: "text-unknown",
};

const STATUS_DOT: Record<Status, string> = {
  down: "status-error",
  slow: "status-warning",
  ok: "status-success",
  unknown: "status-neutral",
};

const CHIP: Record<Status, string> = {
  down: "border-down/60 bg-down/12 text-down",
  slow: "border-slow/60 bg-slow/12 text-slow",
  ok: "border-ok/50 bg-ok/10 text-ok",
  unknown: "border-unknown/40 bg-transparent text-unknown",
};

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("relative inline-flex", className)} aria-hidden>
      {status === "down" && <span className={cn("status absolute animate-ping", STATUS_DOT[status])} />}
      <span className={cn("status", STATUS_DOT[status])} />
    </span>
  );
}

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  const { t } = useT();
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "badge badge-sm h-auto min-h-6 max-w-[9rem] py-0.5 gap-1.5 rounded-[3px] border px-2 font-mono text-[11px] font-semibold uppercase tracking-wider",
        CHIP[status],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
      <span className="truncate">{t.status[status]}</span>
    </span>
  );
}

export function SignalPlate({ label, status, size = "md" }: { label: string; status: Status; size?: "md" | "lg" }) {
  const text = label.length > 5 ? label.slice(0, 5) : label;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[3px] border font-mono font-extrabold tracking-tight",
        size === "lg" ? "size-16 text-base" : "size-11 text-[11px]",
        status === "down" && "border-down bg-down text-error-content",
        status === "slow" && "border-slow/70 bg-slow/10 text-slow",
        status === "ok" && "border-base-300 bg-base-200 text-base-content",
        status === "unknown" && "border-dashed border-base-300 bg-transparent text-muted-foreground",
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}

/** 24 tick bars, oldest left. Height is relative to the busiest hour. */
export function Sparkline({
  data,
  status,
  className,
  tall = false,
}: {
  data: number[];
  status: Status;
  className?: string;
  tall?: boolean;
}) {
  const max = Math.max(1, ...data);
  const h = tall ? 56 : 22;
  const w = tall ? 6 : 3;
  const gap = tall ? 3 : 1.5;
  const width = data.length * (w + gap) - gap;
  return (
    <svg
      viewBox={`0 0 ${width} ${h}`}
      width={width}
      height={h}
      className={cn("overflow-visible", STATUS_TEXT[status === "unknown" ? "unknown" : status], className)}
      role="img"
      aria-label={`${data.reduce((a, b) => a + b, 0)} reports in 24 hours`}
    >
      {data.map((v, i) => {
        const bh = v === 0 ? 1.5 : Math.max(2.5, (v / max) * h);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bh}
            width={w}
            height={bh}
            rx={0.5}
            className={v === 0 ? "fill-base-300" : "fill-current"}
            opacity={i === data.length - 1 ? 1 : 0.55 + (i / data.length) * 0.45}
          />
        );
      })}
    </svg>
  );
}

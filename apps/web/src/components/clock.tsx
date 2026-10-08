"use client";

import { useEffect, useState } from "react";
import { istTime } from "@upi-down/shared";

export function IstClock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(istTime());
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className={className} dateTime={now ?? undefined} suppressHydrationWarning>
      <span className="whitespace-nowrap">
        {now ?? "--:-- --"} <span className="text-muted-foreground">IST</span>
      </span>
    </time>
  );
}

export function minutesAgo(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
}

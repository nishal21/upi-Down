"use client";

import { AnimatePresence } from "motion/react";
import { BANK_BY_ID, UPI_APP_BY_ID, istTime } from "@upi-down/shared";
import { AnimatedListItem } from "@/components/ui/animated-list";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";

export function LiveFeed() {
  const { t } = useT();
  const { snapshot } = useLive();
  const recent = snapshot?.recent ?? [];

  return (
    <aside className="rounded-[4px] border border-base-300 p-3" aria-label={t.feed}>
      <p className="board-label mb-3 flex items-center gap-2">
        <span className="status status-error animate-pulse [--duration:1.6s]" aria-hidden />
        {t.feed}
      </p>
      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t.feedEmpty}</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {recent.slice(0, 8).map((r) => (
              <AnimatedListItem key={`${r.at}-${r.bankId}-${r.kind}`}>
                <li className="tnum grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 rounded-[3px] bg-base-200 px-2.5 py-2 font-mono text-[12px]">
                  <span className="whitespace-nowrap text-muted-foreground">{istTime(new Date(r.at))}</span>
                  <span className="truncate font-semibold">
                    {BANK_BY_ID[r.bankId]?.short}
                    {r.appId && <span className="font-normal text-muted-foreground"> · {UPI_APP_BY_ID[r.appId]?.name}</span>}
                  </span>
                  <span
                    className={cn(
                      "uppercase tracking-wider",
                      r.kind === "failed" ? "text-down" : r.kind === "pending" ? "text-slow" : "text-muted-foreground",
                    )}
                  >
                    {t.kind[r.kind]}
                  </span>
                </li>
              </AnimatedListItem>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </aside>
  );
}

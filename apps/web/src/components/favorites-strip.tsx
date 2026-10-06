"use client";

import { BANK_BY_ID, type Status } from "@upi-down/shared";
import { useFavorites } from "@/lib/favorites";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useBoard } from "./board-context";
import { StatusChip } from "./status";

const EDGE: Record<Status, string> = {
  down: "border-s-down bg-down/[0.06]",
  slow: "border-s-slow bg-slow/[0.05]",
  ok: "border-s-ok",
  unknown: "border-s-base-300",
};

export function FavoritesStrip() {
  const { t } = useT();
  const { favorites } = useFavorites();
  const { snapshot } = useLive();
  const { setOpenBank } = useBoard();
  if (favorites.length === 0) return null;

  return (
    <section aria-label={t.tabFav}>
      <p className="board-label mb-2">{t.tabFav}</p>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {favorites
          .filter((id) => BANK_BY_ID[id])
          .map((id) => {
            const e = snapshot?.banks.find((b) => b.id === id);
            const status = e?.status ?? "unknown";
            return (
              <button
                key={id}
                type="button"
                onClick={() => setOpenBank(id)}
                className={cn(
                  "flex w-40 shrink-0 snap-start flex-col items-start gap-3 rounded-[4px] border border-s-[3px] border-base-300 bg-base-200 p-3 text-start transition-colors hover:border-base-content",
                  EDGE[status],
                )}
              >
                <span className="font-mono text-lg font-extrabold leading-none">{BANK_BY_ID[id].short}</span>
                <StatusChip status={status} />
                <span className="tnum font-mono text-[11px] text-muted-foreground">
                  {e && e.total > 0 ? t.reportsIn15(e.total) : t.noReports15}
                </span>
              </button>
            );
          })}
      </div>
    </section>
  );
}

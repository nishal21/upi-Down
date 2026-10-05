"use client";

import { BANK_BY_ID, type Status } from "@upi-down/shared";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useFavorites } from "@/lib/favorites";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { useBoard } from "./board-context";
import { StatusChip } from "./status";

const RING: Record<Status, string> = {
  down: "var(--color-error)",
  slow: "var(--color-warning)",
  ok: "var(--color-success)",
  unknown: "var(--color-neutral)",
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
              <HoverBorderGradient
                key={id}
                as="button"
                onClick={() => setOpenBank(id)}
                color={RING[status]}
                duration={status === "down" ? 0.6 : 1.4}
                containerClassName="snap-start shrink-0"
                className="flex w-40 flex-col items-start gap-3 p-3 text-start"
              >
                <span className="font-mono text-lg font-extrabold leading-none">{BANK_BY_ID[id].short}</span>
                <StatusChip status={status} />
                <span className="tnum font-mono text-[11px] text-muted-foreground">
                  {e && e.total > 0 ? t.reportsIn15(e.total) : t.noReports15}
                </span>
              </HoverBorderGradient>
            );
          })}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { BANK_BY_ID, BOARD_BANKS, STATUS_RANK, type EntityStatus, type Status } from "@upi-down/shared";
import { useT } from "@/lib/i18n";
import { useLive, type Connection } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useBoard } from "./board-context";
import { minutesAgo } from "./clock";
import { StatusDot } from "./status";

const ORDER: Status[] = ["down", "slow", "ok", "unknown"];

const TEXT: Record<Status, string> = {
  down: "text-down",
  slow: "text-slow",
  ok: "text-ok",
  unknown: "text-muted-foreground",
};

function ConnectionPill({ connection, updatedAt }: { connection: Connection; updatedAt?: string }) {
  const { t } = useT();
  const label = { live: t.live, polling: t.polling, offline: t.offline, connecting: t.connecting }[connection];
  return (
    <span className="tnum inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
      <StatusDot status={connection === "live" ? "ok" : connection === "offline" ? "down" : "unknown"} />
      {label}
      {updatedAt && connection !== "live" && <span>· {minutesAgo(updatedAt)}m</span>}
    </span>
  );
}

function TickerItem({ e, onOpen, hidden }: { e: EntityStatus; onOpen: (id: string) => void; hidden?: boolean }) {
  return (
    <button
      type="button"
      tabIndex={hidden ? -1 : undefined}
      onClick={() => onOpen(e.id)}
      className={cn(
        "tnum relative z-10 inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-[3px] border px-2.5 font-mono text-[12px] font-bold transition-colors",
        e.status === "down" && "border-down bg-down text-error-content",
        e.status === "slow" && "border-slow/60 bg-slow/12 text-slow",
        e.status === "ok" && "border-base-300 bg-base-100/70 hover:border-base-content",
        e.status === "unknown" && "border-dashed border-base-300 bg-base-100/50 text-muted-foreground hover:border-base-content",
      )}
    >
      <StatusDot status={e.status} />
      {BANK_BY_ID[e.id]?.short}
      {e.total > 0 && <span className="font-medium opacity-70">{e.total}</span>}
    </button>
  );
}

/** Every board bank scrolling past. Two copies make the loop seamless; the second is hidden from AT. */
function Ticker({ items, onOpen }: { items: EntityStatus[]; onOpen: (id: string) => void }) {
  // Pause while the pointer is over the strip so transform animation does not steal the click.
  const [paused, setPaused] = useState(false);

  return (
    <div
      dir="ltr"
      className="ticker-wrap relative z-10 mt-7 w-full overflow-hidden"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className={cn("ticker flex w-max gap-2 px-4 sm:px-6 lg:px-10", paused && "ticker-paused")}
        style={{ "--ticker-duration": `${Math.max(items.length, 1) * 2.2}s` } as React.CSSProperties}
      >
        {items.map((e) => (
          <TickerItem key={e.id} e={e} onOpen={onOpen} />
        ))}
        <div className="ticker-copy flex gap-2" aria-hidden>
          {items.map((e) => (
            <TickerItem key={e.id} e={e} onOpen={onOpen} hidden />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useT();
  const { snapshot, connection } = useLive();
  const { setOpenBank } = useBoard();

  const board = useMemo(() => {
    const byId = new Map(snapshot?.banks.map((b) => [b.id, b]));
    return BOARD_BANKS.map(
      (b): EntityStatus =>
        byId.get(b.id) ?? { id: b.id, status: "unknown", total: 0, counts: { failed: 0, pending: 0, slow: 0 }, spark: [] },
    ).sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.total - a.total);
  }, [snapshot]);

  const count = (s: Status) => board.filter((b) => b.status === s).length;
  const down = board.filter((b) => b.status === "down");
  const slow = board.filter((b) => b.status === "slow");
  const quiet = snapshot !== null && board.every((b) => b.total === 0);

  let headline = t.heroOk;
  let sub = t.heroSubOk;
  let tone: Status = "ok";
  if (!snapshot) {
    headline = "UPI Down?";
    sub = t.disclaimer;
    tone = "unknown";
  } else if (down.length === 1) {
    headline = t.heroOneDown(BANK_BY_ID[down[0].id]?.short ?? down[0].id);
    sub = t.heroSubBad;
    tone = "down";
  } else if (down.length > 1) {
    headline = t.heroManyDown(down.length + slow.length);
    sub = t.heroSubBad;
    tone = "down";
  } else if (slow.length > 0) {
    headline = t.heroSlow(slow.length);
    sub = t.heroSubBad;
    tone = "slow";
  } else if (quiet) {
    headline = t.heroQuiet;
    sub = t.heroSubQuiet;
    tone = "unknown";
  }

  return (
    <section className="relative w-full overflow-hidden pt-8 pb-7 sm:pt-14 sm:pb-10">
      <div aria-hidden data-tone={tone} className="hero-backdrop pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-aurora absolute">
          <span className="hero-orb hero-orb-a" />
          <span className="hero-orb hero-orb-b" />
          <span className="hero-orb hero-orb-c" />
          <span className="hero-sheen" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <ConnectionPill connection={connection} updatedAt={snapshot?.updatedAt} />
        <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(1.05rem,2.8vw,1.35rem)] font-bold tracking-tight text-muted-foreground">
          Is UPI down right now?
        </h1>
        <p
          aria-live="polite"
          className={cn(
            "fade-up mt-2 max-w-[14ch] font-display text-[clamp(2.6rem,9vw,5.25rem)] font-extrabold leading-[0.92] tracking-[-0.02em] text-balance",
            tone === "down" && "text-down",
            tone === "slow" && "text-slow",
          )}
        >
          {headline}
        </p>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">{sub}</p>

        {snapshot && (
          <dl className="tnum mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px]">
            {ORDER.filter((s) => count(s) > 0).map((s) => (
              <div key={s} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{t.status[s]}</dt>
                <dd className={cn("text-xl font-extrabold leading-none", TEXT[s])}>{count(s)}</dd>
                <span aria-hidden className="uppercase tracking-[0.12em] text-muted-foreground">
                  {t.status[s]}
                </span>
              </div>
            ))}
          </dl>
        )}
      </div>

      <Ticker items={board} onOpen={setOpenBank} />
    </section>
  );
}

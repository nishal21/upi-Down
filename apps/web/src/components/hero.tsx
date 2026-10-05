"use client";

import dynamic from "next/dynamic";
import { BANK_BY_ID, type EntityStatus } from "@upi-down/shared";
import { BlurFade } from "@/components/ui/blur-fade";
import { useT } from "@/lib/i18n";
import { useLive, type Connection } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useBoard } from "./board-context";
import { minutesAgo } from "./clock";
import { StatusDot } from "./status";

const Spotlight = dynamic(() => import("@/components/ui/spotlight-new").then((m) => m.Spotlight), { ssr: false });

const SINDOOR = {
  gradientFirst:
    "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(8, 77%, 60%, .10) 0, hsla(8, 77%, 50%, .03) 50%, hsla(8, 77%, 45%, 0) 80%)",
  gradientSecond: "radial-gradient(50% 50% at 50% 50%, hsla(8, 77%, 60%, .07) 0, hsla(8, 77%, 50%, .02) 80%, transparent 100%)",
  gradientThird: "radial-gradient(50% 50% at 50% 50%, hsla(8, 77%, 60%, .05) 0, hsla(8, 77%, 45%, .02) 80%, transparent 100%)",
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

export function Hero() {
  const { t } = useT();
  const { snapshot, connection } = useLive();
  const { setOpenBank } = useBoard();

  const banks = snapshot?.banks ?? [];
  const down = banks.filter((b) => b.status === "down");
  const slow = banks.filter((b) => b.status === "slow");
  const quiet = snapshot !== null && banks.every((b) => b.total === 0);
  const majorDown = down.some((b) => BANK_BY_ID[b.id]?.tier === 1);

  let headline = t.heroOk;
  let sub = t.heroSubOk;
  let tone: "down" | "slow" | "ok" | "unknown" = "ok";
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

  const trouble: EntityStatus[] = [...down, ...slow].slice(0, 6);

  return (
    <section className="relative overflow-hidden pt-8 pb-6 sm:pt-14 sm:pb-10">
      {majorDown && (
        <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
          <Spotlight {...SINDOOR} />
        </div>
      )}
      <BlurFade key={headline} duration={0.35} offset={6} className="relative z-10">
        <ConnectionPill connection={connection} updatedAt={snapshot?.updatedAt} />
        <h1
          className={cn(
            "mt-4 max-w-[14ch] font-display text-[clamp(2.6rem,9vw,5.25rem)] font-extrabold leading-[0.92] tracking-[-0.02em] text-balance",
            tone === "down" && "text-down",
            tone === "slow" && "text-slow",
          )}
        >
          {headline}
        </h1>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">{sub}</p>

        {trouble.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {trouble.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setOpenBank(b.id)}
                  className={cn(
                    "badge h-9 gap-2 rounded-[3px] px-3 font-mono text-[13px] font-bold",
                    b.status === "down" ? "border-down bg-down text-error-content" : "border-slow/60 bg-slow/12 text-slow",
                  )}
                >
                  {BANK_BY_ID[b.id]?.short}
                  <span className="tnum opacity-80">{b.total}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </BlurFade>
    </section>
  );
}

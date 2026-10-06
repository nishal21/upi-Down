"use client";

import Link from "next/link";
import { ArrowLeft, RotateCw, Search } from "lucide-react";
import { BANKS } from "@upi-down/shared";
import { bankSlug } from "@/lib/config";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MAJOR = BANKS.filter((b) => b.tier <= 2).slice(0, 16);

export function ErrorScreen({ code, onRetry }: { code: string; onRetry?: () => void }) {
  const { t } = useT();
  const missing = !onRetry;

  return (
    <section className="relative isolate -mx-4 overflow-hidden px-4 pt-12 pb-[max(4rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] sm:pt-20">
      <div
        aria-hidden
        data-tone={missing ? "unknown" : "down"}
        className="hero-backdrop pointer-events-none absolute inset-0 -z-10"
      >
        <div className="hero-grid absolute inset-0" />
        <div className="hero-aurora absolute">
          <span className="hero-orb hero-orb-a" />
          <span className="hero-orb hero-orb-b" />
          <span className="hero-orb hero-orb-c" />
          <span className="hero-sheen" />
        </div>
      </div>

      <div dir="ltr" className="flex gap-2" aria-hidden>
        {code.split("").map((ch, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 70}ms` }}
            className={cn(
              "fade-up grid size-16 place-items-center rounded-[4px] border font-mono text-3xl font-extrabold sm:size-20 sm:text-4xl",
              missing ? "border-dashed border-base-300 text-muted-foreground" : "border-down bg-down text-error-content",
            )}
          >
            {ch}
          </span>
        ))}
      </div>

      <h1 className="mt-8 max-w-[18ch] font-display text-[clamp(2.2rem,7vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-balance">
        {missing ? t.nfTitle : t.errTitle}
      </h1>
      <p className="mt-4 max-w-[50ch] text-[17px] leading-relaxed text-muted-foreground">
        {missing ? t.nfBody : t.errBody}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-12 items-center gap-2 rounded-[4px] bg-base-content px-5 font-display font-bold text-base-100"
          >
            <RotateCw className="size-4" aria-hidden /> {t.retry}
          </button>
        )}
        <Link
          href="/"
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-[4px] px-5 font-display font-bold",
            onRetry ? "border border-base-300 hover:border-base-content" : "bg-base-content text-base-100",
          )}
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t.goHome}
        </Link>
        <Link
          href="/#board"
          className="inline-flex h-12 items-center gap-2 rounded-[4px] border border-base-300 px-5 font-display font-bold hover:border-base-content"
        >
          <Search className="size-4" aria-hidden /> {t.search[0]}
        </Link>
      </div>

      <nav className="mt-12" aria-label={t.allBanks}>
        <p className="board-label mb-3">{t.allBanks}</p>
        <ul className="flex flex-wrap gap-2">
          {MAJOR.map((b) => (
            <li key={b.id}>
              <Link
                href={`/${bankSlug(b.id)}/`}
                className="inline-flex h-9 items-center gap-2 rounded-[3px] border border-base-300 bg-base-100/70 px-3 font-mono text-xs font-bold hover:border-base-content"
              >
                <span className="text-muted-foreground">{b.short}</span>
                <span className="max-w-[10rem] truncate font-sans font-medium normal-case tracking-normal text-base-content">
                  {b.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

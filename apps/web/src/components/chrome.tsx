"use client";

import Link from "next/link";
import { Languages, Moon, Sun, WifiOff } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LANGS, useT, type Lang } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { useTheme } from "@/lib/theme";
import { IstClock } from "./clock";

function Mark() {
  const { snapshot } = useLive();
  const anyDown = snapshot?.banks.some((b) => b.status === "down");
  return (
    <span className="relative grid size-8 place-items-center rounded-[3px] bg-base-content font-mono text-[10px] font-extrabold text-base-100">
      UPI
      <span
        className={`absolute -top-1 -end-1 size-2.5 rounded-full ring-2 ring-base-100 ${anyDown ? "bg-down" : "bg-ok"}`}
        aria-hidden
      />
    </span>
  );
}

export function Header() {
  const { t, lang, setLang } = useT();
  const { theme, toggle } = useTheme();
  return (
    <header className="app-header sticky top-0 z-40 border-b border-base-300 bg-base-100/92 backdrop-blur-sm supports-[backdrop-filter]:bg-base-100/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="UPI Down? home">
          <Mark />
          <span className="font-display text-lg font-extrabold tracking-tight">
            UPI Down<span className="text-down">?</span>
          </span>
        </Link>
        <IstClock className="tnum ms-auto font-mono text-[11px] font-semibold sm:text-sm" />
        <div className="flex items-center gap-1 sm:ms-1">
          <label className="relative flex h-9 items-center rounded-[3px] text-muted-foreground focus-within:text-base-content hover:text-base-content">
            <Languages className="pointer-events-none absolute start-2 size-4" aria-hidden />
            <span className="sr-only">{t.language}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="h-9 max-w-[7.5rem] cursor-pointer appearance-none truncate rounded-[3px] bg-transparent ps-8 pe-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-base-content/40"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code} lang={l.tag} className="bg-base-100 text-base-content">
                  {l.native}
                </option>
              ))}
            </select>
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
              <Toggle
                pressed={theme === "light"}
                onPressedChange={toggle}
                aria-label={t.theme}
                className="size-9 min-w-9 rounded-[3px] data-[state=on]:bg-transparent data-[state=on]:text-base-content"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Toggle>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t.theme}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

export function Banners() {
  const { t } = useT();
  const { connection, stale, snapshot } = useLive();
  let text: string | null = null;
  if (connection === "offline") text = t.offlineBanner;
  else if (snapshot?.degraded) text = t.degraded;
  else if (stale && snapshot) text = t.staleBanner;
  if (!text) return null;
  return (
    <div role="status" className="border-b border-slow/40 bg-slow/10 text-slow">
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-medium">
        {connection === "offline" && <WifiOff className="size-4 shrink-0" aria-hidden />}
        {text}
      </p>
    </div>
  );
}

export function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer mt-16 border-t border-base-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[60ch] space-y-1.5">
          <p className="font-medium text-base-content">{t.disclaimer}</p>
          <p className="web-seo">{t.notAffiliated}</p>
          <p className="web-seo pt-1 text-xs">
            © {year} Nishal K.{" "}
            <a
              href="https://github.com/nishal21/upi-Down"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-base-content"
            >
              github.com/nishal21/upi-Down
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.14em]">
          <Link href="/about/" className="hover:text-base-content">
            {t.about}
          </Link>
          <Link href="/privacy/" className="hover:text-base-content">
            {t.privacy}
          </Link>
          <a
            href="https://github.com/nishal21/upi-Down"
            target="_blank"
            rel="noopener noreferrer"
            className="web-seo hover:text-base-content"
          >
            GitHub
          </a>
          <a href="/llms.txt" className="web-seo hover:text-base-content">
            llms.txt
          </a>
        </nav>
      </div>
    </footer>
  );
}

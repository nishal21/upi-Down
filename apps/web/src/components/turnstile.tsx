"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/config";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

export const TURNSTILE_ACTION = "report";

let loader: Promise<void> | null = null;
function load(): Promise<void> {
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

/**
 * Loaded only when the API asks for it during a traffic spike.
 * Tokens are single-use: bump `resetKey` after every request that sent one.
 */
export function Turnstile({
  onToken,
  theme,
  lang,
  resetKey,
}: {
  onToken: (t: string | undefined) => void;
  theme: "dark" | "light";
  lang: string;
  resetKey: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string | undefined>(undefined);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    load()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: TURNSTILE_ACTION,
          theme,
          language: lang,
          size: "flexible",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(undefined),
          "error-callback": () => cb.current(undefined),
        });
      })
      .catch(() => cb.current(undefined));
    return () => {
      cancelled = true;
      if (id.current) window.turnstile?.remove(id.current);
      id.current = undefined;
    };
  }, [theme, lang]);

  useEffect(() => {
    if (resetKey > 0 && id.current) window.turnstile?.reset(id.current);
  }, [resetKey]);

  return <div ref={ref} className="min-h-[65px] w-full" />;
}

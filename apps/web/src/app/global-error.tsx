"use client";

import { useEffect } from "react";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

function isNativeHost() {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) return true;
    return location.hostname === "app.upidown.nishal.dev";
  } catch {
    return false;
  }
}

// Replaces the root layout — kept plain on purpose.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (!isNativeHost()) return;
    try {
      if (sessionStorage.getItem("upidown-hard-reload") === "1") return;
      sessionStorage.setItem("upidown-hard-reload", "1");
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      window.location.replace(`${window.location.origin}/`);
    }, 150);
    return () => window.clearTimeout(t);
  }, [error]);

  // Native: blank while auto-reloading — never flash the ERR chrome.
  if (typeof window !== "undefined" && isNativeHost()) {
    return (
      <html lang="en-IN" data-theme="upidown-dark" suppressHydrationWarning>
        <body className="min-h-dvh bg-[#0f110e]" />
      </html>
    );
  }

  return (
    <html lang="en-IN" data-theme="upidown-dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <title>UPI Down? · Something broke</title>
      </head>
      <body className="min-h-dvh bg-base-100 text-base-content">
        <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center overflow-hidden px-6 py-16">
          <div aria-hidden data-tone="down" className="hero-backdrop pointer-events-none absolute inset-0">
            <div className="hero-grid absolute inset-0" />
            <div className="hero-aurora absolute">
              <span className="hero-orb hero-orb-a" />
              <span className="hero-orb hero-orb-b" />
              <span className="hero-sheen" />
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-2" aria-hidden>
              {["E", "R", "R"].map((ch) => (
                <span
                  key={ch}
                  className="grid size-16 place-items-center rounded-[4px] border border-down bg-down font-mono text-3xl font-extrabold text-error-content"
                >
                  {ch}
                </span>
              ))}
            </div>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight">The app failed to load</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
              This is a problem with this page, not with UPI or your bank.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="h-12 rounded-[4px] bg-base-content px-5 font-bold text-base-100"
              >
                Try again
              </button>
              <a href="/" className="inline-flex h-12 items-center rounded-[4px] border border-base-300 px-5 font-bold">
                Reload home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

"use client";

import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Replaces the root layout, so it can't use the header, fonts or translations. Kept plain on purpose.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
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
              {["E", "R", "R"].map((ch, i) => (
                <span
                  key={i}
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
                onClick={retry}
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

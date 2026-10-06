"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // One automatic remount — first paint in the WebView sometimes races localStorage/API.
  useEffect(() => {
    const key = "upidown-err-autoretry";
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
      const t = window.setTimeout(() => reset(), 120);
      return () => window.clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, [reset]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <ErrorScreen code="ERR" onRetry={reset} />
    </div>
  );
}

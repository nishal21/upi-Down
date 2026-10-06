"use client";

import { useEffect, useRef } from "react";
import { ErrorScreen } from "@/components/error-screen";
import { detectNative } from "@/lib/native";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const acted = useRef(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // In the app, soft reset() often fails once; a single hard reload matches the
  // working "Back to all banks" button. Only once per session to avoid loops.
  useEffect(() => {
    if (acted.current) return;
    acted.current = true;

    if (!detectNative()) {
      const t = window.setTimeout(() => reset(), 120);
      return () => window.clearTimeout(t);
    }

    try {
      if (sessionStorage.getItem("upidown-hard-reload") === "1") return;
      sessionStorage.setItem("upidown-hard-reload", "1");
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      window.location.replace(`${window.location.origin}/`);
    }, 200);
    return () => window.clearTimeout(t);
  }, [error, reset]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <ErrorScreen
        code="ERR"
        onRetry={() => {
          try {
            sessionStorage.removeItem("upidown-hard-reload");
          } catch {
            /* ignore */
          }
          if (detectNative()) window.location.replace(`${window.location.origin}/`);
          else reset();
        }}
      />
    </div>
  );
}

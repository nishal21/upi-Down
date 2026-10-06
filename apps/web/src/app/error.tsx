"use client";

import { useEffect, useRef } from "react";
import { ErrorScreen } from "@/components/error-screen";
import { detectNative } from "@/lib/native";

/** First native ERR this session → blank + hard reload. Already tried → show UI. */
function nativeAutoReloadPending(): boolean {
  if (!detectNative()) return false;
  try {
    if (sessionStorage.getItem("upidown-hard-reload") === "1") return false;
    sessionStorage.setItem("upidown-hard-reload", "1");
    return true;
  } catch {
    return true;
  }
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const acted = useRef(false);
  const blankNative = useRef(nativeAutoReloadPending());

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    if (acted.current) return;
    acted.current = true;

    if (!detectNative()) {
      const t = window.setTimeout(() => reset(), 120);
      return () => window.clearTimeout(t);
    }

    if (!blankNative.current) return;

    const t = window.setTimeout(() => {
      window.location.replace(`${window.location.origin}/`);
    }, 200);
    return () => window.clearTimeout(t);
  }, [error, reset]);

  if (blankNative.current) {
    return <div className="min-h-dvh bg-[#0f110e]" aria-busy aria-hidden />;
  }

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

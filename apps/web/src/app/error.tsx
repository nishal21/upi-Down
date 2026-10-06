"use client";

import { useEffect, useRef } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const tries = useRef(0);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Auto-recover from first-paint races (e.g. right after onboarding).
  useEffect(() => {
    if (tries.current >= 2) return;
    tries.current += 1;
    const t = window.setTimeout(() => reset(), 100 * tries.current);
    return () => window.clearTimeout(t);
  }, [error, reset]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <ErrorScreen code="ERR" onRetry={reset} />
    </div>
  );
}

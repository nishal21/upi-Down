"use client";

import { useEffect, type ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

/** Native app chrome: onboarding first; keep children mounted so API can warm up. */
export function AppShell({ children }: { children: ReactNode }) {
  const native = useNativeClass();
  const done = useOnboarded();
  const gating = native && !done;

  useEffect(() => {
    setNeedsOnboard(gating);
  }, [gating]);

  return (
    <>
      <Onboarding />
      <div
        aria-hidden={gating || undefined}
        className={gating ? "pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-0" : undefined}
      >
        {children}
      </div>
    </>
  );
}

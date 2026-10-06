"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { SwRegister } from "./sw-register";
import { detectNative, markHtmlNative } from "@/lib/native";
import { warmLive } from "@/lib/live";
import { readOnboarded, useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

/**
 * Native: onboarding first. After onboarding, finish() does a full navigation
 * to `/` (same as the working "Back to all banks" button) — in-place mount was
 * still hitting ERR.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const native = useNativeClass();
  const done = useOnboarded();
  const [settled, setSettled] = useState(() => {
    if (typeof window === "undefined") return true;
    if (detectNative()) {
      markHtmlNative();
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (settled) return;
    if (detectNative()) {
      markHtmlNative();
      setSettled(true);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      if (detectNative()) {
        markHtmlNative();
        setSettled(true);
        window.clearInterval(id);
        return;
      }
      if (Date.now() - started > 500) {
        setSettled(true);
        window.clearInterval(id);
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [settled]);

  useEffect(() => {
    if (settled && native && !done) warmLive();
  }, [settled, native, done]);

  const gating = settled && native && !done;

  useEffect(() => {
    setNeedsOnboard(gating);
  }, [gating]);

  // Clear one-shot hard-reload guard once the app shell is healthy.
  useEffect(() => {
    if (!gating && settled) {
      try {
        sessionStorage.removeItem("upidown-hard-reload");
      } catch {
        /* ignore */
      }
    }
  }, [gating, settled]);

  const showChrome = settled && !gating;

  return (
    <>
      <Onboarding />
      <SwRegister />
      {showChrome ? children : <div className="min-h-dvh bg-background" aria-hidden />}
    </>
  );
}

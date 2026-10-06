"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { SwRegister } from "./sw-register";
import { detectNative, markHtmlNative } from "@/lib/native";
import { readOnboarded, useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

/**
 * Native: onboarding first. Do not mount Header/Home until done.
 * Never force-show the web shell while Cap/native is still settling.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const native = useNativeClass();
  const done = useOnboarded();
  const [settled, setSettled] = useState(() => {
    if (typeof window === "undefined") return true;
    // Already know we're in the app → don't wait; gate on onboarding instead.
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
      // Web only: after a short wait, show the site.
      if (Date.now() - started > 500) {
        setSettled(true);
        window.clearInterval(id);
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [settled]);

  const gating = settled && native && !done;

  useEffect(() => {
    setNeedsOnboard(gating);
  }, [gating]);

  // Until settled, keep chrome unmounted if boot already marked needs-onboard / native.
  const waitingNative =
    typeof window !== "undefined" &&
    !settled &&
    (document.documentElement.classList.contains("needs-onboard") ||
      document.documentElement.classList.contains("native") ||
      detectNative());

  const showChrome = settled ? !gating : !waitingNative;

  return (
    <>
      <Onboarding />
      <SwRegister />
      {showChrome ? children : <div className="min-h-dvh bg-background" aria-hidden />}
    </>
  );
}

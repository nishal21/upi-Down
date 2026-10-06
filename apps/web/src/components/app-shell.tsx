"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { SoftBoundary } from "./soft-boundary";
import { SwRegister } from "./sw-register";
import { detectNative, markHtmlNative } from "@/lib/native";
import { warmLive } from "@/lib/live";
import { readOnboarded, useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

/**
 * Native: onboarding first. Reveal the app a beat after onboarding so motion
 * cleanup can't race the first Home mount (that race was the ERR loop).
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
  const [reveal, setReveal] = useState(() => {
    if (typeof window === "undefined") return true;
    if (!detectNative()) return true;
    return readOnboarded();
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

  // Warm API while onboarding so Home isn't cold on first paint.
  useEffect(() => {
    if (settled && native && !done) warmLive();
  }, [settled, native, done]);

  useEffect(() => {
    const gating = settled && native && !done;
    setNeedsOnboard(gating);

    if (!native) {
      setReveal(true);
      return;
    }
    if (!done) {
      setReveal(false);
      return;
    }
    const t = window.setTimeout(() => setReveal(true), 180);
    return () => window.clearTimeout(t);
  }, [settled, native, done]);

  const showChrome = settled && reveal;

  return (
    <>
      <Onboarding />
      <SwRegister />
      {showChrome ? (
        <SoftBoundary resetKey={done ? "in" : "out"}>{children}</SoftBoundary>
      ) : (
        <div className="min-h-dvh bg-background" aria-hidden />
      )}
    </>
  );
}

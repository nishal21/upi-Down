"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { BootSplash } from "./boot-splash";
import { Onboarding } from "./onboarding";
import { SoftBoundary } from "./soft-boundary";
import { SwRegister } from "./sw-register";
import { detectNative, markHtmlNative } from "@/lib/native";
import { warmLive } from "@/lib/live";
import { useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

const SPLASH_SEEN = "upidown-splash-seen";

function splashAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN) === "1";
  } catch {
    return false;
  }
}

function clearBootCover() {
  document.getElementById("upidown-boot-cover")?.remove();
  document.documentElement.classList.remove("needs-splash");
}

/**
 * Native: system splash (kept) → Lottie → onboarding → home.
 * Web: children immediately (SEO). Blocking boot script covers native SSR HTML.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const native = useNativeClass();
  const done = useOnboarded();

  const [bootReady, setBootReady] = useState(false);
  const [splashDone, setSplashDone] = useState(true);

  useLayoutEffect(() => {
    const isNative = detectNative();
    if (isNative) markHtmlNative();

    if (isNative && !splashAlreadySeen()) {
      document.documentElement.classList.add("needs-splash");
      setSplashDone(false);
    } else {
      clearBootCover();
      setSplashDone(true);
    }
    setBootReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!bootReady) return;
    if (native && !done) warmLive();
  }, [bootReady, native, done]);

  const showSplash = bootReady && native && !splashDone;
  const gating = bootReady && native && !done;

  useLayoutEffect(() => {
    setNeedsOnboard(gating);
  }, [gating]);

  const onSplashDone = () => {
    try {
      sessionStorage.setItem(SPLASH_SEEN, "1");
    } catch {
      /* ignore */
    }
    clearBootCover();
    setSplashDone(true);
  };

  // SSR: show children for SEO (native covered by blocking boot script).
  // Native after boot: wait for splash + onboarding before chrome/home.
  const showChrome = !bootReady || (!gating && !showSplash);

  return (
    <>
      {showSplash ? <BootSplash onDone={onSplashDone} /> : null}
      {bootReady && !showSplash ? <Onboarding /> : null}
      <SwRegister />
      {showChrome ? (
        <SoftBoundary resetKey={done ? "in" : "out"}>{children}</SoftBoundary>
      ) : (
        <div className="min-h-dvh bg-[#0f110e]" aria-hidden />
      )}
    </>
  );
}

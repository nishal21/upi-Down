"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BootSplash } from "./boot-splash";
import { Onboarding } from "./onboarding";
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

/**
 * Native: Cap splash → Lottie → onboarding (or home). After onboarding, finish()
 * does a full navigation to `/` — in-place mount was still hitting ERR.
 * Session splash skip avoids replaying Lottie on that hard nav.
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
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === "undefined") return true;
    if (!detectNative()) return true;
    return splashAlreadySeen();
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
    if (!settled) return;
    if (!native) {
      setSplashDone(true);
      return;
    }
    if (splashAlreadySeen()) setSplashDone(true);
  }, [settled, native]);

  useEffect(() => {
    if (settled && native && !done) warmLive();
  }, [settled, native, done]);

  const showSplash = settled && native && !splashDone;
  // Keep needs-onboard through splash so chrome never flashes under Lottie.
  const gating = settled && native && !done;

  useEffect(() => {
    setNeedsOnboard(gating);
  }, [gating]);

  // Clear one-shot hard-reload guard once the app shell is healthy.
  useEffect(() => {
    if (!gating && settled && !showSplash) {
      try {
        sessionStorage.removeItem("upidown-hard-reload");
      } catch {
        /* ignore */
      }
    }
  }, [gating, settled, showSplash]);

  const onSplashDone = () => {
    try {
      sessionStorage.setItem(SPLASH_SEEN, "1");
    } catch {
      /* ignore */
    }
    setSplashDone(true);
  };

  const showChrome = settled && !gating && !showSplash;

  return (
    <>
      {showSplash ? <BootSplash onDone={onSplashDone} /> : null}
      {!showSplash ? <Onboarding /> : null}
      <SwRegister />
      {showChrome ? children : <div className="min-h-dvh bg-[#0f110e]" aria-hidden />}
    </>
  );
}

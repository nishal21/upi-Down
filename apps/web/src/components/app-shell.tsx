"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { SwRegister } from "./sw-register";
import { isNative } from "@/lib/native";
import { readOnboarded, useOnboarded } from "@/lib/onboarding-store";
import { setNeedsOnboard, useNativeClass } from "@/lib/use-native";

/**
 * Native: onboarding first. Do not mount Header/Home until done — a throw while
 * Home is "hidden" under onboarding sticks the page error boundary on ERR forever.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const native = useNativeClass();
  const done = useOnboarded();
  const [boot, setBoot] = useState<"wait" | "go">(() => {
    if (typeof window === "undefined") return "go";
    const html = document.documentElement;
    if (html.classList.contains("needs-onboard")) return "wait";
    if ((html.classList.contains("native") || isNative()) && !readOnboarded()) return "wait";
    return "go";
  });

  useEffect(() => {
    const adoptNative = () => {
      document.documentElement.classList.add("native");
      if (!readOnboarded()) {
        setNeedsOnboard(true);
        setBoot("wait");
      } else {
        setBoot("go");
      }
    };

    if (isNative() || document.documentElement.classList.contains("native")) {
      adoptNative();
      return;
    }

    let alive = true;
    const started = Date.now();
    const id = window.setInterval(() => {
      if (!alive) return;
      if (isNative()) {
        adoptNative();
        window.clearInterval(id);
        return;
      }
      if (Date.now() - started > 600) {
        window.clearInterval(id);
        setBoot("go");
      }
    }, 16);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const gating = native && !done;

  useEffect(() => {
    setNeedsOnboard(gating);
    if (gating) setBoot("wait");
    else setBoot("go");
  }, [gating]);

  const showChrome = boot === "go" && !gating;

  return (
    <>
      <Onboarding />
      <SwRegister />
      {showChrome ? children : null}
    </>
  );
}

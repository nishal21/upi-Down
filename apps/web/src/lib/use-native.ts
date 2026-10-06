"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { detectNative, markHtmlNative } from "./native";

function readNative(): boolean {
  return detectNative();
}

/** True in Capacitor. Hostname + html.native work before the bridge injects. */
export function useIsNative() {
  return useSyncExternalStore(
    (onChange) => {
      if (readNative()) {
        markHtmlNative();
        return () => {};
      }
      const id = window.setInterval(() => {
        if (readNative()) {
          markHtmlNative();
          onChange();
          window.clearInterval(id);
        }
      }, 16);
      const stop = window.setTimeout(() => window.clearInterval(id), 2500);
      return () => {
        window.clearInterval(id);
        window.clearTimeout(stop);
      };
    },
    readNative,
    () => false,
  );
}

/** Keep html.native for CSS — never strip it (hydration used to toggle it off and show SEO). */
export function useNativeClass() {
  const native = useIsNative();
  useLayoutEffect(() => {
    if (native) markHtmlNative();
  }, [native]);
  return native;
}

export function setNeedsOnboard(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("needs-onboard", on);
}

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isNative } from "./native";

function readNative(): boolean {
  if (typeof window === "undefined") return false;
  if (isNative()) return true;
  return document.documentElement.classList.contains("native");
}

/** True in Capacitor. Also respects html.native from the boot script (no one-frame flash). */
export function useIsNative() {
  return useSyncExternalStore(
    (onChange) => {
      if (readNative()) return () => {};
      // Capacitor bridge can appear a tick after first paint
      const id = window.setInterval(() => {
        if (readNative()) {
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

/** Marks <html class="native"> for CSS and layout tweaks. */
export function useNativeClass() {
  const native = useIsNative();
  useEffect(() => {
    document.documentElement.classList.toggle("native", native);
  }, [native]);
  return native;
}

export function setNeedsOnboard(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("needs-onboard", on);
}

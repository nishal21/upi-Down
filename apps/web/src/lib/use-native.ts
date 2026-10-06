"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isNative } from "./native";

/** Hydration-safe: false on SSR / first paint, then true inside Capacitor. */
export function useIsNative() {
  return useSyncExternalStore(
    () => () => {},
    () => isNative(),
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

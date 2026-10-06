"use client";

import type { ReactNode } from "react";
import { useIsNative } from "@/lib/use-native";

/** Hide crawl/SEO / web-only chrome inside the Capacitor app. */
export function WebOnly({ children }: { children: ReactNode }) {
  const native = useIsNative();
  // CSS also hides .web-seo under html.native — this skips mounting entirely in-app.
  if (native) return null;
  if (typeof document !== "undefined" && document.documentElement.classList.contains("native")) return null;
  return <>{children}</>;
}

export function NativeOnly({ children }: { children: ReactNode }) {
  const native = useIsNative();
  if (!native) return null;
  return <>{children}</>;
}

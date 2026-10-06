"use client";

import { useEffect } from "react";
import { bindBackButton, ensureNativeSafeArea, isNative, syncStatusBar } from "@/lib/native";

export function SwRegister() {
  useEffect(() => {
    if (isNative()) {
      ensureNativeSafeArea();
      const dark = document.documentElement.dataset.theme !== "upidown-light";
      void syncStatusBar(dark ? "dark" : "light");
      void bindBackButton();
      return;
    }
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

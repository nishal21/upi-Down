"use client";

import type { ReactNode } from "react";
import { Onboarding } from "./onboarding";
import { useNativeClass } from "@/lib/use-native";

/** Native app chrome: onboarding + html.native class. Web is unchanged. */
export function AppShell({ children }: { children: ReactNode }) {
  useNativeClass();
  return (
    <>
      <Onboarding />
      {children}
    </>
  );
}

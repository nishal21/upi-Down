"use client";

import { SoftBoundary } from "./soft-boundary";
import { Home } from "./home";
import { useOnboarded } from "@/lib/onboarding-store";

/** Home behind a soft error boundary so first-paint crashes after onboarding remount. */
export function AppHome() {
  const done = useOnboarded();
  return (
    <SoftBoundary resetKey={done ? "on" : "off"}>
      <Home />
    </SoftBoundary>
  );
}

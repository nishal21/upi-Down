"use client";

import { Home } from "./home";
import { SoftBoundary } from "./soft-boundary";

/** Home wrapped so first-paint crashes remount quietly instead of flashing ERR. */
export function AppHome() {
  return (
    <SoftBoundary>
      <Home />
    </SoftBoundary>
  );
}

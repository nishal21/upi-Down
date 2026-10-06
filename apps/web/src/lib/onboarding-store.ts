"use client";

import { createStored } from "./store";
import { setNeedsOnboard } from "./use-native";

const stored = createStored<boolean>("upidown-onboarded", false);

export function useOnboarded() {
  return stored.use();
}

export function markOnboarded() {
  stored.set(true);
  setNeedsOnboard(false);
}

export function readOnboarded() {
  return stored.read();
}

"use client";

import { createStored } from "./store";

const stored = createStored<string[]>("upidown-favorites", []);

const toggle = (id: string) =>
  stored.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-8)));

/** Merge pinned banks to the front (used by onboarding). */
export function pinFavorites(ids: string[]) {
  if (!ids.length) return;
  stored.set((prev) => {
    const merged = [...ids, ...prev.filter((id) => !ids.includes(id))];
    return merged.slice(0, 8);
  });
}

export function useFavorites() {
  const favorites = stored.use();
  return { favorites, toggle, isFav: (id: string) => favorites.includes(id) };
}

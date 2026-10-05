"use client";

import { createStored } from "./store";

const stored = createStored<string[]>("upidown-favorites", []);

export function useFavorites() {
  const favorites = stored.use();
  const toggle = (id: string) =>
    stored.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-8)));
  return { favorites, toggle, isFav: (id: string) => favorites.includes(id) };
}

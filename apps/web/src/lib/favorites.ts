"use client";

import { createStored } from "./store";

const stored = createStored<string[]>("upidown-favorites", []);

const toggle = (id: string) =>
  stored.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-8)));

export function useFavorites() {
  const favorites = stored.use();
  return { favorites, toggle, isFav: (id: string) => favorites.includes(id) };
}

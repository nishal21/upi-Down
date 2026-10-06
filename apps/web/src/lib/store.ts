"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

/** Tiny localStorage-backed store usable from React via useSyncExternalStore. */
export function createStored<T>(key: string, fallback: T, firstRun?: () => T) {
  const listeners = new Set<Listener>();
  let cache: T | undefined;

  const coerce = (value: unknown): T => {
    if (Array.isArray(fallback)) {
      return (Array.isArray(value) ? value : fallback) as T;
    }
    if (typeof fallback === "boolean") {
      return (typeof value === "boolean" ? value : fallback) as T;
    }
    if (typeof fallback === "string") {
      return (typeof value === "string" ? value : fallback) as T;
    }
    return value as T;
  };

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw === null ? (firstRun?.() ?? fallback) : coerce(JSON.parse(raw));
    } catch {
      cache = fallback;
    }
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
    cache = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    listeners.forEach((l) => l());
  };

  const subscribe = (l: Listener) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const use = (): T => useSyncExternalStore(subscribe, read, () => fallback);

  return { read, set, use };
}

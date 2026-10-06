"use client";

import { useEffect, useSyncExternalStore } from "react";
import { en, type Dict } from "./locales/en";
import { hi } from "./locales/hi";
import { createStored } from "./store";

export const LANGS = [
  { code: "en", native: "English", tag: "en-IN" },
  { code: "hi", native: "हिन्दी", tag: "hi-IN" },
  { code: "bn", native: "বাংলা", tag: "bn-IN" },
  { code: "mr", native: "मराठी", tag: "mr-IN" },
  { code: "te", native: "తెలుగు", tag: "te-IN" },
  { code: "ta", native: "தமிழ்", tag: "ta-IN" },
  { code: "gu", native: "ગુજરાતી", tag: "gu-IN" },
  { code: "ur", native: "اردو", tag: "ur-IN", rtl: true },
  { code: "kn", native: "ಕನ್ನಡ", tag: "kn-IN" },
  { code: "or", native: "ଓଡ଼ିଆ", tag: "or-IN" },
  { code: "ml", native: "മലയാളം", tag: "ml-IN" },
  { code: "pa", native: "ਪੰਜਾਬੀ", tag: "pa-IN" },
  { code: "as", native: "অসমীয়া", tag: "as-IN" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

const LOADERS: Record<Exclude<Lang, "en" | "hi">, () => Promise<Dict>> = {
  bn: () => import("./locales/bn").then((m) => m.bn),
  mr: () => import("./locales/mr").then((m) => m.mr),
  te: () => import("./locales/te").then((m) => m.te),
  ta: () => import("./locales/ta").then((m) => m.ta),
  gu: () => import("./locales/gu").then((m) => m.gu),
  ur: () => import("./locales/ur").then((m) => m.ur),
  kn: () => import("./locales/kn").then((m) => m.kn),
  or: () => import("./locales/or").then((m) => m.or),
  ml: () => import("./locales/ml").then((m) => m.ml),
  pa: () => import("./locales/pa").then((m) => m.pa),
  as: () => import("./locales/as").then((m) => m.as),
};

const loaded = new Map<Lang, Dict>([
  ["en", en],
  ["hi", hi],
]);
const listeners = new Set<() => void>();
let version = 0;

function ensure(lang: Lang) {
  if (loaded.has(lang) || lang === "en" || lang === "hi") return;
  LOADERS[lang]().then((d) => {
    loaded.set(lang, d);
    version++;
    listeners.forEach((l) => l());
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const isLang = (v: string): v is Lang => LANGS.some((l) => l.code === v);

function initialLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const pref = navigator.languages?.map((l) => l.slice(0, 2)).find(isLang);
  return pref ?? "en";
}

const stored = createStored<Lang>("upidown-lang", "en", initialLang);

export function useT() {
  const raw = stored.use();
  const lang: Lang = isLang(raw) ? raw : "en";
  useSyncExternalStore(subscribe, () => version, () => 0);
  ensure(lang);
  const meta = LANGS.find((l) => l.code === lang)!;
  const dir: "ltr" | "rtl" = "rtl" in meta && meta.rtl ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = meta.tag;
    html.dir = dir;
  }, [meta, dir]);

  return { t: loaded.get(lang) ?? en, lang, dir, setLang: (l: Lang) => stored.set(l) };
}

export type { Dict };

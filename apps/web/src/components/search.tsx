"use client";

import { useEffect, useState } from "react";
import { searchBanks } from "@upi-down/shared";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useT } from "@/lib/i18n";
import { useIsNative } from "@/lib/use-native";
import { BankPick } from "./bank-pick";
import { useBoard } from "./board-context";

export function BankSearch() {
  const { t } = useT();
  const { setQuery, setOpenBank } = useBoard();
  const native = useIsNative();

  // Honor ?q= from WebSite SearchAction / shared links.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    setQuery(q);
    const first = searchBanks(q, 1)[0];
    if (first) setOpenBank(first.id);
  }, [setQuery, setOpenBank]);

  // Capacitor: plain input — the vanish/canvas search has crashed first paint after onboarding.
  if (native) {
    return (
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          const q = typeof value === "string" ? value.trim() : "";
          if (!q) return;
          const first = searchBanks(q, 1)[0];
          setQuery("");
          e.currentTarget.reset();
          if (first) setOpenBank(first.id);
        }}
      >
        <input
          name="q"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t.search[0]}
          aria-label={t.search[0]}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-[4px] border border-base-300 bg-base-200 px-4 text-base text-base-content outline-none focus:border-base-content"
        />
      </form>
    );
  }

  return (
    <PlaceholdersAndVanishInput
      placeholders={t.search}
      ariaLabel={t.search[0]}
      onChange={(e) => setQuery(e.target.value)}
      onSubmit={(value) => {
        const first = searchBanks(value, 1)[0];
        setQuery("");
        if (first) setOpenBank(first.id);
      }}
    />
  );
}

/** ⌘K / Ctrl+K or "/" anywhere. Same sheet as "My payment failed". */
export function CommandSearch() {
  const { t } = useT();
  const { setOpenBank } = useBoard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <BankPick
      open={open}
      onOpenChange={setOpen}
      title={t.search[0]}
      description={t.searchAll}
      onPick={setOpenBank}
    />
  );
}

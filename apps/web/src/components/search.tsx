"use client";

import { useEffect, useState } from "react";
import { BANK_BY_ID, searchBanks } from "@upi-down/shared";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { useBoard } from "./board-context";
import { SignalPlate, StatusChip } from "./status";

export function BankSearch() {
  const { t } = useT();
  const { setQuery, setOpenBank } = useBoard();

  // Honor ?q= from WebSite SearchAction / shared links.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    setQuery(q);
    const first = searchBanks(q, 1)[0];
    if (first) setOpenBank(first.id);
  }, [setQuery, setOpenBank]);

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

/** ⌘K / Ctrl+K or "/" anywhere. */
export function CommandSearch() {
  const { t } = useT();
  const { snapshot } = useLive();
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

  const [q, setQ] = useState("");
  const statusOf = (id: string) => snapshot?.banks.find((b) => b.id === id)?.status ?? "unknown";
  const results = searchBanks(q, 8);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
      title={t.search[0]}
      description={t.disclaimer}
      shouldFilter={false}
    >
      <CommandInput placeholder={t.search[0]} value={q} onValueChange={setQ} />
      <CommandList className="max-h-[min(36vh,180px)]">
        <CommandEmpty>{t.noMatch}</CommandEmpty>
        <CommandGroup heading={q ? t.searchAll : t.tabAll}>
          {results.map((b) => (
            <CommandItem
              key={b.id}
              value={b.id}
              onSelect={() => {
                setOpen(false);
                setOpenBank(b.id);
              }}
              className="h-10 gap-2.5 rounded-[3px] py-0 data-[selected=true]:bg-base-200"
            >
              <SignalPlate label={BANK_BY_ID[b.id].short} status={statusOf(b.id)} />
              <span className="min-w-0 flex-1 truncate text-sm">{b.name}</span>
              <StatusChip status={statusOf(b.id)} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

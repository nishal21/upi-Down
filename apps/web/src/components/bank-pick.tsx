"use client";

import { useMemo, useState } from "react";
import { BOARD_BANKS, BANK_BY_ID, searchBanks } from "@upi-down/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useT } from "@/lib/i18n";
import { useIsNative } from "@/lib/use-native";
import { SignalPlate } from "./status";

const MAJOR = BOARD_BANKS.filter((b) => b.tier <= 2).slice(0, 16);

function BankList({ query, onPick }: { query: string; onPick: (id: string) => void }) {
  const { t } = useT();
  const list = useMemo(() => {
    const q = query.trim();
    if (!q) return MAJOR;
    return searchBanks(q, 12);
  }, [query]);

  if (list.length === 0) {
    return <p className="px-1 py-8 text-center text-sm text-muted-foreground">{t.noMatch}</p>;
  }

  return (
    <ul className="flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
      {list.map((b) => (
        <li key={b.id}>
          <button
            type="button"
            onClick={() => onPick(b.id)}
            className="flex w-full items-center gap-3 rounded-[4px] border border-transparent px-2 py-2.5 text-start hover:border-base-300 hover:bg-base-200"
          >
            <SignalPlate label={b.short} status="unknown" />
            <span className="min-w-0">
              <span className="block truncate font-display text-[15px] font-semibold">{b.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{b.short}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Shared bank search sheet for Ctrl+K and "My payment failed". */
export function BankPick({
  open,
  onOpenChange,
  title,
  description,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  onPick: (id: string) => void;
}) {
  const native = useIsNative();
  const [query, setQuery] = useState("");

  const pick = (id: string) => {
    if (!BANK_BY_ID[id]) return;
    onOpenChange(false);
    setQuery("");
    onPick(id);
  };

  const body = (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={title}
        aria-label={title}
        className="mb-3 h-11 w-full rounded-[4px] border border-base-300 bg-base-200 px-3 text-base outline-none focus:border-base-content"
        autoFocus
      />
      <BankList query={query} onPick={pick} />
    </>
  );

  if (native) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="border-base-300 bg-base-100 px-4 pb-[max(1rem,var(--safe-area-inset-bottom,0px))]">
          <DrawerHeader className="px-0 text-start">
            <DrawerTitle className="font-display text-xl font-extrabold">{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-base-300 bg-base-100 duration-100 sm:rounded-[6px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

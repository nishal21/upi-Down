"use client";

import { useT } from "@/lib/i18n";
import { useBoard } from "./board-context";
import { BankPick } from "./bank-pick";

/** Pick a bank, then open the bank sheet to send a report. */
export function ReportPicker({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useT();
  const { setOpenBank } = useBoard();

  return (
    <BankPick
      open={open}
      onOpenChange={onOpenChange}
      title={t.reportPickTitle}
      description={t.reportPickHint}
      onPick={setOpenBank}
    />
  );
}

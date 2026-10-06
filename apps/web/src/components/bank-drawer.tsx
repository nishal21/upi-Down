"use client";

import { useEffect, useState } from "react";
import { BANK_BY_ID } from "@upi-down/shared";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useT } from "@/lib/i18n";
import { BankPanel } from "./bank-panel";
import { useBoard, useOpenBank } from "./board-context";

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export function BankDrawer() {
  const { t } = useT();
  const { setOpenBank } = useBoard();
  const openBank = useOpenBank();
  const wide = useWide();
  const bank = openBank ? BANK_BY_ID[openBank] : null;
  const isOpen = !!bank;

  // The drawer owns one history entry so the phone/browser back button closes it instead of leaving.
  useEffect(() => {
    if (!isOpen) return;
    if (history.state?.drawer !== true) history.pushState({ ...history.state, drawer: true }, "");
    const onPop = () => setOpenBank(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isOpen, setOpenBank]);

  const close = () => {
    if (history.state?.drawer === true) history.back();
    else setOpenBank(null);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(o) => !o && close()}
      direction={wide ? "right" : "bottom"}
    >
      <DrawerContent className="border-base-300 bg-base-100 data-[vaul-drawer-direction=right]:w-[min(100vw,28rem)] data-[vaul-drawer-direction=right]:max-w-[28rem] data-[vaul-drawer-direction=bottom]:max-h-[94dvh]">
        {bank && (
          <>
            <DrawerTitle className="sr-only">{t.isItDown(bank.short)}</DrawerTitle>
            <DrawerDescription className="sr-only">{t.disclaimer}</DrawerDescription>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <BankPanel key={bank.id} bankId={bank.id} onPickBank={setOpenBank} />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

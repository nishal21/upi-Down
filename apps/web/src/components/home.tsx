"use client";

import { useIsNative } from "@/lib/use-native";
import { BankDrawer } from "./bank-drawer";
import { Board } from "./board";
import { FavoritesStrip } from "./favorites-strip";
import { BoardProvider } from "./board-context";
import { Hero } from "./hero";
import { LiveFeed } from "./live-feed";
import { BankSearch, CommandSearch } from "./search";

export function Home() {
  const native = useIsNative();

  return (
    <BoardProvider>
      <Hero />
      <div className={native ? "mx-auto max-w-6xl px-3 pb-[max(1rem,env(safe-area-inset-bottom))]" : "mx-auto max-w-6xl px-4"}>
        <div className={native ? "flex flex-col gap-4" : "grid gap-6 lg:grid-cols-[1fr_300px]"}>
          <div className="flex min-w-0 flex-col gap-4">
            <BankSearch />
            <FavoritesStrip />
            <div id="board">
              <Board />
            </div>
          </div>
          <div className={native ? "mt-2" : "lg:sticky lg:top-20 lg:self-start"}>
            <LiveFeed />
          </div>
        </div>
      </div>
      <BankDrawer />
      {!native && <CommandSearch />}
    </BoardProvider>
  );
}

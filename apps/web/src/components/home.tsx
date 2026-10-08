"use client";

import { useIsNative } from "@/lib/use-native";
import { BankDrawer } from "./bank-drawer";
import { Board } from "./board";
import { FavoritesStrip } from "./favorites-strip";
import { BoardProvider, useQuery } from "./board-context";
import { Hero } from "./hero";
import { LiveFeed } from "./live-feed";
import { BankSearch, CommandSearch } from "./search";

function HomeBody({ native }: { native: boolean }) {
  const query = useQuery();
  const searching = query.trim().length > 0;

  return (
    <div
      className={
        native
          ? "mx-auto max-w-6xl px-3 pb-[max(1.25rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]"
          : "mx-auto max-w-6xl px-4"
      }
    >
      <div className={native ? "flex flex-col gap-4" : "grid gap-6 lg:grid-cols-[1fr_300px]"}>
        <div className="flex min-w-0 flex-col gap-4">
          <div id="bank-search">
            <BankSearch />
          </div>
          {!searching && <FavoritesStrip />}
          <div id="board">
            <Board />
          </div>
        </div>
        {!searching && (
          <div className={native ? "mt-2" : "lg:sticky lg:top-20 lg:self-start"}>
            <LiveFeed />
          </div>
        )}
      </div>
    </div>
  );
}

export function Home() {
  const native = useIsNative();

  return (
    <BoardProvider>
      <Hero />
      <HomeBody native={native} />
      <BankDrawer />
      {!native && <CommandSearch />}
    </BoardProvider>
  );
}

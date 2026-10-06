"use client";

import { memo, startTransition, useDeferredValue, useMemo, useState } from "react";
import { Star } from "lucide-react";
import {
  BANK_BY_ID,
  BANKS,
  BOARD_APPS,
  BOARD_BANKS,
  STATUS_RANK,
  UPI_APP_BY_ID,
  searchBanks,
  type EntityStatus,
} from "@upi-down/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/lib/favorites";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useBoard, useQuery } from "./board-context";
import { SignalPlate, Sparkline, StatusChip } from "./status";

const SEARCH_LIMIT = 10;
const EMPTY_SPARK = Array(24).fill(0) as number[];

const emptyEntity = (id: string): EntityStatus => ({
  id,
  status: "unknown",
  total: 0,
  counts: { failed: 0, pending: 0, slow: 0 },
  spark: EMPTY_SPARK,
});

/** Keep tabs mounted; only hide inactive so bank↔apps doesn't remount 40+ rows. */
const tabPanel =
  "m-0 data-[state=inactive]:hidden data-[state=inactive]:pointer-events-none";

function HeaderRow() {
  const { t } = useT();
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-base-300 px-3 pb-2 sm:grid-cols-[1fr_9rem_6.5rem_5.5rem_2.5rem]">
      <span className="board-label truncate">{t.colBank}</span>
      <span className="board-label hidden truncate sm:block">{t.colStatus}</span>
      <span className="board-label hidden truncate text-end sm:block">{t.colFails}</span>
      <span className="board-label hidden truncate text-end sm:block">{t.col24h}</span>
      <span className="board-label truncate sm:hidden">{t.colStatus}</span>
    </div>
  );
}

const Row = memo(function Row({
  entity,
  label,
  name,
  onOpen,
  fav,
  onFav,
  favAdd,
  favRemove,
  reportsLabel,
}: {
  entity: EntityStatus;
  label: string;
  name: string;
  onOpen?: (id: string) => void;
  fav?: boolean;
  onFav?: (id: string) => void;
  favAdd?: string;
  favRemove?: string;
  reportsLabel: string;
}) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <SignalPlate label={label} status={entity.status} />
        <span className="min-w-0">
          <span className="block truncate font-display text-[15px] font-semibold leading-tight">{name}</span>
          <span className="tnum block font-mono text-[11px] text-muted-foreground sm:hidden">{reportsLabel}</span>
        </span>
      </span>
      <span className="hidden sm:block">
        <StatusChip status={entity.status} />
      </span>
      <span className="tnum hidden text-end font-mono text-sm font-semibold sm:block">
        {entity.total > 0 ? entity.total : <span className="text-muted-foreground">—</span>}
      </span>
      <span className="hidden justify-end sm:flex">
        <Sparkline data={entity.spark} status={entity.status} />
      </span>
      <span className="sm:hidden">
        <StatusChip status={entity.status} />
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "group relative flex items-stretch border-b border-base-300/70 transition-colors",
        onOpen && "hover:bg-base-200/70",
        entity.status === "down" && "bg-down/[0.04]",
      )}
    >
      {entity.status === "down" && <span className="absolute inset-y-0 start-0 w-[3px] bg-down" aria-hidden />}
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(entity.id)}
          className="grid min-h-[52px] flex-1 grid-cols-[1fr_auto] items-center gap-3 px-3 py-1.5 text-start sm:grid-cols-[1fr_9rem_6.5rem_5.5rem]"
        >
          {body}
        </button>
      ) : (
        <div className="grid min-h-[52px] flex-1 grid-cols-[1fr_auto] items-center gap-3 px-3 py-1.5 sm:grid-cols-[1fr_9rem_6.5rem_5.5rem]">
          {body}
        </div>
      )}
      {onFav ? (
        <button
          type="button"
          onClick={() => onFav(entity.id)}
          aria-label={fav ? favRemove : favAdd}
          aria-pressed={fav}
          className="grid w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-base-content sm:w-10"
        >
          <Star className={cn("size-4", fav && "fill-current text-base-content")} />
        </button>
      ) : (
        <span className="hidden w-10 sm:block" />
      )}
    </div>
  );
});

export function Board() {
  const { t, dir } = useT();
  const { snapshot } = useLive();
  const { favorites, toggle } = useFavorites();
  const { setOpenBank } = useBoard();
  const query = useDeferredValue(useQuery());
  const [tab, setTab] = useState(favorites.length > 0 ? "fav" : "all");

  const bankMap = useMemo(() => new Map(snapshot?.banks.map((b) => [b.id, b])), [snapshot]);
  const banks = useMemo(() => {
    if (!query.trim()) {
      // Names from BOARD_BANKS immediately — don't wait on the API for the list.
      const ordered = snapshot ? snapshot.banks : BOARD_BANKS.map((b) => emptyEntity(b.id));
      return ordered.filter((e) => BANK_BY_ID[e.id]);
    }
    const found = searchBanks(query, SEARCH_LIMIT).map((b) => bankMap.get(b.id) ?? emptyEntity(b.id));
    return found.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.total - a.total);
  }, [snapshot, query, bankMap]);
  const favs = useMemo(
    () => favorites.map((id) => bankMap.get(id) ?? emptyEntity(id)).filter((e) => BANK_BY_ID[e.id]),
    [favorites, bankMap],
  );
  const apps = useMemo(
    () => (snapshot?.apps ?? BOARD_APPS.map((a) => emptyEntity(a.id))).filter((e) => UPI_APP_BY_ID[e.id]),
    [snapshot],
  );
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const bankRows = (list: EntityStatus[]) =>
    list.map((e) => {
      const b = BANK_BY_ID[e.id];
      return (
        <Row
          key={e.id}
          entity={e}
          label={b.short}
          name={b.name}
          onOpen={setOpenBank}
          fav={favSet.has(e.id)}
          onFav={toggle}
          favAdd={t.favAdd}
          favRemove={t.favRemove}
          reportsLabel={e.total > 0 ? t.reportsIn15(e.total) : t.noReports15}
        />
      );
    });

  const trigger =
    "h-9 min-w-0 flex-1 rounded-[3px] px-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:flex-none sm:px-3";

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => startTransition(() => setTab(v))}
      dir={dir}
      className="gap-4"
    >
      <TabsList className="h-auto w-full justify-start gap-1 rounded-[4px] border border-base-300 bg-transparent p-1 sm:w-auto">
        <TabsTrigger value="all" className={trigger}>
          <span className="truncate">{t.tabAll}</span>
        </TabsTrigger>
        <TabsTrigger value="fav" className={trigger}>
          <span className="truncate">{t.tabFav}</span>
          {favorites.length > 0 && <span className="tnum ms-1 opacity-70">{favorites.length}</span>}
        </TabsTrigger>
        <TabsTrigger value="apps" className={trigger}>
          <span className="truncate">{t.tabApps}</span>
        </TabsTrigger>
      </TabsList>

      <section className="rounded-[4px] border border-base-300 bg-base-100 pt-3">
        <TabsContent value="all" forceMount className={tabPanel}>
          <HeaderRow />
          {banks.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">{t.noMatch}</p>
          ) : (
            bankRows(banks)
          )}
          <p className="px-3 py-3 text-center text-xs text-muted-foreground">
            {query.trim() && banks.length >= SEARCH_LIMIT ? t.keepTyping : t.allMembers(BANKS.length)}
          </p>
        </TabsContent>

        <TabsContent value="fav" forceMount className={tabPanel}>
          <HeaderRow />
          {favs.length === 0 ? (
            <p className="flex items-center justify-center gap-2 px-3 py-10 text-center text-sm text-muted-foreground">
              <Star className="size-4" aria-hidden /> {t.favEmpty}
            </p>
          ) : (
            bankRows(favs)
          )}
        </TabsContent>

        <TabsContent value="apps" forceMount className={tabPanel}>
          <p className="border-b border-base-300 px-3 pb-3 text-sm text-muted-foreground">{t.appsNote}</p>
          {apps.map((e) => (
            <Row
              key={e.id}
              entity={e}
              label={UPI_APP_BY_ID[e.id].short}
              name={UPI_APP_BY_ID[e.id].name}
              reportsLabel={e.total > 0 ? t.reportsIn15(e.total) : t.noReports15}
            />
          ))}
        </TabsContent>
      </section>
    </Tabs>
  );
}

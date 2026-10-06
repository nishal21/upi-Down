"use client";

import { memo, useDeferredValue, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/lib/favorites";
import { useT } from "@/lib/i18n";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";
import { useBoard, useQuery } from "./board-context";
import { SignalPlate, Sparkline, StatusChip } from "./status";

const SEARCH_LIMIT = 10;

const emptyEntity = (id: string): EntityStatus => ({
  id,
  status: "unknown",
  total: 0,
  counts: { failed: 0, pending: 0, slow: 0 },
  spark: Array(24).fill(0),
});

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
  index,
  onOpen,
  fav,
  onFav,
}: {
  entity: EntityStatus;
  label: string;
  name: string;
  index: number;
  onOpen?: (id: string) => void;
  fav?: boolean;
  onFav?: (id: string) => void;
}) {
  const { t } = useT();
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <SignalPlate label={label} status={entity.status} />
        <span className="min-w-0">
          <span className="block truncate font-display text-[15px] font-semibold leading-tight">{name}</span>
          <span className="tnum block font-mono text-[11px] text-muted-foreground sm:hidden">
            {entity.total > 0 ? t.reportsIn15(entity.total) : t.noReports15}
          </span>
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
        style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
        className={cn(
          "row-in group relative flex items-stretch border-b border-base-300/70 transition-colors",
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
            aria-label={fav ? t.favRemove : t.favAdd}
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

function SkeletonRows() {
  return (
    <div aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-base-300/70 px-3 py-2.5">
          <Skeleton className="size-11" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ms-auto h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function Board() {
  const { t, dir } = useT();
  const { snapshot } = useLive();
  const { favorites, toggle, isFav } = useFavorites();
  const { setOpenBank } = useBoard();
  const query = useDeferredValue(useQuery());

  const bankMap = useMemo(() => new Map(snapshot?.banks.map((b) => [b.id, b])), [snapshot]);
  const banks = useMemo(() => {
    if (!query.trim()) {
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
  const apps = (snapshot?.apps ?? BOARD_APPS.map((a) => emptyEntity(a.id))).filter((e) => UPI_APP_BY_ID[e.id]);

  const bankRows = (list: EntityStatus[]) =>
    list.map((e, i) => {
      const b = BANK_BY_ID[e.id];
      return (
        <Row
          key={e.id}
          entity={e}
          label={b.short}
          name={b.name}
          index={i}
          onOpen={setOpenBank}
          fav={isFav(e.id)}
          onFav={toggle}
        />
      );
    });

  const trigger =
    "h-9 min-w-0 flex-1 rounded-[3px] px-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:flex-none sm:px-3";

  return (
    <Tabs defaultValue={favorites.length > 0 ? "fav" : "all"} dir={dir} className="gap-4">
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

      <section className="rounded-[4px] border border-base-300 bg-base-100 pt-3" aria-live="polite">
        <TabsContent value="all" className="m-0">
          <HeaderRow />
          {!snapshot && !query ? (
            <SkeletonRows />
          ) : banks.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">{t.noMatch}</p>
          ) : (
            bankRows(banks)
          )}
          <p className="px-3 py-3 text-center text-xs text-muted-foreground">
            {query.trim() && banks.length >= SEARCH_LIMIT ? t.keepTyping : t.allMembers(BANKS.length)}
          </p>
        </TabsContent>

        <TabsContent value="fav" className="m-0">
          <HeaderRow />
          {favs.length === 0 ? (
            <p className="flex items-center justify-center gap-2 px-3 py-10 text-center text-sm text-muted-foreground">
              <Star className="size-4" aria-hidden /> {t.favEmpty}
            </p>
          ) : (
            bankRows(favs)
          )}
        </TabsContent>

        <TabsContent value="apps" className="m-0">
          <p className="border-b border-base-300 px-3 pb-3 text-sm text-muted-foreground">{t.appsNote}</p>
          {apps.map((e, i) => (
            <Row
              key={e.id}
              entity={e}
              label={UPI_APP_BY_ID[e.id].short}
              name={UPI_APP_BY_ID[e.id].name}
              index={i}
            />
          ))}
        </TabsContent>
      </section>
    </Tabs>
  );
}

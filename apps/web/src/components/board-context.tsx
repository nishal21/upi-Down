"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface BoardActions {
  setOpenBank: (id: string | null) => void;
  setQuery: (q: string) => void;
}

// Split so opening a bank re-renders only the drawer, and typing re-renders only the board.
const Actions = createContext<BoardActions | null>(null);
const OpenBank = createContext<string | null>(null);
const Query = createContext("");

export function BoardProvider({ children }: { children: ReactNode }) {
  const [openBank, setOpenBank] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const actions = useMemo(() => ({ setOpenBank, setQuery }), []);
  return (
    <Actions.Provider value={actions}>
      <OpenBank.Provider value={openBank}>
        <Query.Provider value={query}>{children}</Query.Provider>
      </OpenBank.Provider>
    </Actions.Provider>
  );
}

export function useBoard() {
  const v = useContext(Actions);
  if (!v) {
    // Never crash the shell (header stays mounted when a page errors).
    return {
      setOpenBank: () => {},
      setQuery: () => {},
    };
  }
  return v;
}

export const useOpenBank = () => useContext(OpenBank);
export const useQuery = () => useContext(Query);

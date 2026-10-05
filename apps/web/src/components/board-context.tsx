"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface BoardCtx {
  openBank: string | null;
  setOpenBank: (id: string | null) => void;
  query: string;
  setQuery: (q: string) => void;
}

const Ctx = createContext<BoardCtx | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [openBank, setOpenBank] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  return <Ctx.Provider value={{ openBank, setOpenBank, query, setQuery }}>{children}</Ctx.Provider>;
}

export function useBoard() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBoard outside BoardProvider");
  return v;
}

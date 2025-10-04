"use client";
import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ReaderTheme = "light" | "sepia" | "dark";
export type ReaderFont = "serif" | "sans" | "mono";
export type ReaderAlign = "justify" | "left";

export type ReaderPrefs = {
  font: ReaderFont;
  fontSize: number;     // px
  lineHeight: number;   // unitless
  theme: ReaderTheme;
  align: ReaderAlign;
  maxChars: number;     // ch
};

type Ctx = {
  prefs: ReaderPrefs;
  setPrefs: (p: ReaderPrefs) => void;
};

const ReaderPrefsContext = createContext<Ctx | null>(null);

export function ReaderPrefsProvider({
  bookId,
  children,
}: {
  bookId: string;
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useLocalStorage<ReaderPrefs>(
    `reader:${bookId}:prefs`,
    {
      font: "serif",
      fontSize: 18,
      lineHeight: 1.8,
      theme: "light",
      align: "justify",
      maxChars: 70,
    }
  );

  const value = useMemo(() => ({ prefs, setPrefs }), [prefs]);
  return (
    <ReaderPrefsContext.Provider value={value}>
      {children}
    </ReaderPrefsContext.Provider>
  );
}

export function useReaderPrefs() {
  const ctx = useContext(ReaderPrefsContext);
  if (!ctx) throw new Error("useReaderPrefs must be used inside ReaderPrefsProvider");
  return ctx;
}

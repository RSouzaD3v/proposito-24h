"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GROUPS, biblePath, isOldTestament, type BibleBookInfo, type BibleVersionCode } from "./bible-books";

const TESTAMENTS = [
  { id: "old", label: "Antigo Testamento" },
  { id: "new", label: "Novo Testamento" },
] as const;

export function BookBrowser({ version, books }: { version: BibleVersionCode; books: BibleBookInfo[] }) {
  const [testament, setTestament] = useState<"old" | "new">("old");
  const groups = GROUPS.filter((group) => isOldTestament(group.from) === (testament === "old"))
    .map((group) => ({ ...group, books: books.filter((book) => book.order >= group.from && book.order <= group.to) }))
    .filter((group) => group.books.length > 0);

  return (
    <section aria-label="Livros da Bíblia">
      <div role="tablist" className="mb-6 grid grid-cols-2 rounded-2xl bg-[var(--muted)] p-1">
        {TESTAMENTS.map((item) => {
          const active = testament === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTestament(item.id)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--reader-surface)] text-[var(--liquid-ink)] shadow-sm"
                  : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-7">
        {groups.map((group) => (
          <div key={group.name}>
            <h3 className="reader-eyebrow mb-2.5 px-1">{group.name}</h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.books.map((book) => (
                <li key={book.abbrev}>
                  <Link
                    href={biblePath(version, book.abbrev)}
                    className="flex h-full items-center rounded-xl border border-[var(--border)] bg-[var(--reader-surface)] px-3.5 py-3 text-[15px] font-medium text-[var(--liquid-ink)] transition hover:border-[var(--reader-gold)] hover:bg-[var(--muted)]/40"
                  >
                    {book.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenText, ChevronRight } from "lucide-react";
import { biblePath, readLastRead, type BibleVersionCode, type LastRead } from "./bible-books";

export function ContinueReading({ version }: { version: BibleVersionCode }) {
  const [last, setLast] = useState<LastRead | null>(null);

  useEffect(() => setLast(readLastRead()), []);

  if (!last) return null;
  return (
    <Link
      href={biblePath(version, last.abbrev, last.chapter)}
      className="flex items-center gap-3 rounded-2xl bg-[var(--liquid-accent)] p-4 text-[var(--liquid-on-accent)] transition hover:brightness-95"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
        <BookOpenText className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold opacity-80">Continuar lendo</span>
        <span className="block truncate text-lg font-semibold">
          {last.name} {last.chapter}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0" aria-hidden />
    </Link>
  );
}

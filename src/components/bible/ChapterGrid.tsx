"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { biblePath, readLastRead, type BibleVersionCode } from "./bible-books";

export function ChapterGrid({
  version,
  abbrev,
  chapters,
}: {
  version: BibleVersionCode;
  abbrev: string;
  chapters: number[];
}) {
  const [lastChapter, setLastChapter] = useState<number | null>(null);

  useEffect(() => {
    const last = readLastRead();
    if (last?.abbrev === abbrev) setLastChapter(last.chapter);
  }, [abbrev]);

  return (
    <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
      {chapters.map((chapter) => {
        const current = chapter === lastChapter;
        return (
          <li key={chapter}>
            <Link
              href={biblePath(version, abbrev, chapter)}
              aria-label={current ? `Capítulo ${chapter}, onde você parou` : `Capítulo ${chapter}`}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border text-[15px] font-semibold transition",
                current
                  ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]"
                  : "border-[var(--border)] bg-[var(--reader-surface)] text-[var(--liquid-ink)] hover:border-[var(--reader-gold)] hover:bg-[var(--muted)]/40",
              )}
            >
              {chapter}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

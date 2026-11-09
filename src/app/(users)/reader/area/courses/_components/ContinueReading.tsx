"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LastRead, LibraryBook } from "@/lib/api/types";
import { BookCover } from "./BookCover";

/** Vale a leitura mais recente, deste aparelho ou de outro. */
export function ContinueReading({ books, lastRead }: { books: LibraryBook[]; lastRead: LastRead | null }) {
  const [last, setLast] = useState<{ book: LibraryBook; chapter: number } | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem("reader:lastBook");
      const localBook = books.find((item) => item.id === id);
      const localAt = localBook ? Number(localStorage.getItem(`reader:${localBook.id}:lastReadAt`)) || 0 : 0;
      const remoteBook = lastRead && books.find((item) => item.id === lastRead.publicationId);
      if (remoteBook && lastRead && new Date(lastRead.lastReadAt).getTime() > localAt) {
        setLast({ book: remoteBook, chapter: lastRead.currentChapter + 1 });
      } else if (localBook) {
        const index = Number(localStorage.getItem(`reader:${localBook.id}:chapterIndex`)) || 0;
        setLast({ book: localBook, chapter: index + 1 });
      }
    } catch {
      // Sem acesso ao armazenamento, a seção simplesmente não aparece.
    }
  }, [books, lastRead]);

  if (!last) return null;

  return (
    <Link
      href={`/reader/area/courses/${last.book.id}`}
      className="glass-surface-strong mb-9 flex items-center gap-4 p-3 pr-5 animate-glass-in transition-transform motion-safe:hover:-translate-y-0.5"
    >
      <BookCover title={last.book.title} coverUrl={last.book.coverUrl} compact className="w-16 shrink-0 rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="reader-eyebrow block">Continue lendo</span>
        <span className="reader-serif mt-1 line-clamp-2 text-lg leading-snug">{last.book.title}</span>
        <span className="mt-1 block text-xs text-[var(--liquid-muted)]">Capítulo {last.chapter}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-[var(--liquid-muted)]" />
    </Link>
  );
}

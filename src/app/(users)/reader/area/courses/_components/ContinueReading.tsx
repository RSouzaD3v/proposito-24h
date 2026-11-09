"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LibraryBook } from "@/lib/api/types";
import { BookCover } from "./BookCover";

export function ContinueReading({ books }: { books: LibraryBook[] }) {
  const [last, setLast] = useState<{ book: LibraryBook; chapter: number } | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem("reader:lastBook");
      const book = books.find((item) => item.id === id);
      if (!book) return;
      const index = Number(localStorage.getItem(`reader:${book.id}:chapterIndex`)) || 0;
      setLast({ book, chapter: index + 1 });
    } catch {
      // Sem acesso ao armazenamento, a seção simplesmente não aparece.
    }
  }, [books]);

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

"use client";

import { useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookHero } from "./BookHero";
import ChapterSlider from "./ChapterSlider";
import { useLocalStorage } from "./useLocalStorage";

type Chapter = {
  title: string;
  subtitle: string;
  content: string;
  coverUrl?: string;
};

type Props = {
  bookId: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  chapters: Chapter[];
};

export default function BookFormatContent({ bookId, title, subtitle, description, coverUrl, pdfUrl, chapters }: Props) {
  const [reading, setReading] = useState(false);
  const [storedIndex, setIndex] = useLocalStorage<number>(`reader:${bookId}:chapterIndex`, 0);
  const index = Math.min(Math.max(storedIndex, 0), Math.max(chapters.length - 1, 0));

  function open(chapter: number) {
    setIndex(chapter);
    setReading(true);
    try {
      localStorage.setItem("reader:lastBook", bookId);
    } catch {
      // A leitura segue funcionando sem o atalho "Continue lendo".
    }
  }

  if (reading) {
    return (
      <ChapterSlider
        bookId={bookId}
        bookTitle={title}
        chapters={chapters}
        index={index}
        onChange={setIndex}
        onExit={() => setReading(false)}
      />
    );
  }

  const count = chapters.length;
  const meta = count > 0 ? `${count} ${count === 1 ? "capítulo" : "capítulos"}` : "Livro em PDF";

  return (
    <>
      <BookHero title={title} subtitle={subtitle} coverUrl={coverUrl} meta={meta} />

      <div className="mx-auto w-full max-w-2xl space-y-8 px-5 pt-6 animate-glass-in">
        <div className="space-y-3">
          {count > 0 && (
            <Button variant="glass-primary" onClick={() => open(index)} className="h-12 w-full rounded-full text-sm font-bold">
              <BookOpen className="size-4" />
              {index > 0 ? `Continuar no capítulo ${index + 1}` : "Começar a ler"}
            </Button>
          )}
          {pdfUrl && (
            <Button asChild variant={count > 0 ? "glass" : "glass-primary"} className="h-12 w-full rounded-full text-sm font-bold">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="size-4" /> Abrir PDF
              </a>
            </Button>
          )}
          {count === 0 && !pdfUrl && (
            <p className="text-center text-sm text-[var(--liquid-muted)]">Este livro ainda não tem conteúdo disponível.</p>
          )}
        </div>

        {description && (
          <section>
            <h2 className="mb-2 text-xl">Sobre este livro</h2>
            <p className="whitespace-pre-line leading-relaxed text-[var(--liquid-muted)]">{description}</p>
          </section>
        )}

        {count > 0 && (
          <section>
            <h2 className="mb-3 text-xl">Capítulos</h2>
            <ol className="glass-surface-strong divide-y divide-[var(--border)] overflow-hidden">
              {chapters.map((chapter, chapterIndex) => (
                <li key={chapterIndex}>
                  <button
                    type="button"
                    onClick={() => open(chapterIndex)}
                    className="flex min-h-14 w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]"
                  >
                    <span className="reader-serif w-6 shrink-0 text-center text-[var(--reader-gold)] tabular-nums">{chapterIndex + 1}</span>
                    <span className={cn("min-w-0 flex-1 text-sm font-semibold", chapterIndex === index && index > 0 && "text-[var(--reader-gold)]")}>
                      {chapter.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  );
}

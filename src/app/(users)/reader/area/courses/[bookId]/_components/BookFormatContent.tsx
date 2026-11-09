"use client";

import { useEffect, useState } from "react";
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
  libraryHref?: string;
  /** Só a leitura real registra progresso; a prévia do escritor não. */
  trackProgress?: boolean;
  /** Última posição registrada no servidor, possivelmente em outro aparelho. */
  serverProgress?: { currentChapter: number; lastReadAt: string } | null;
};

// Tempo no capítulo para contar como lido: folhear não entra nas métricas do escritor.
const PROGRESS_DWELL_MS = 3000;

export default function BookFormatContent({ bookId, title, subtitle, description, coverUrl, pdfUrl, chapters, libraryHref, trackProgress = false, serverProgress = null }: Props) {
  const [reading, setReading] = useState(false);
  const [storedIndex, setIndex] = useLocalStorage<number>(`reader:${bookId}:chapterIndex`, 0);
  const index = Math.min(Math.max(storedIndex, 0), Math.max(chapters.length - 1, 0));

  const readAtKey = `reader:${bookId}:lastReadAt`;

  // Roda depois da leitura do localStorage; só a posição mais recente substitui a deste aparelho.
  useEffect(() => {
    if (!serverProgress) return;
    try {
      const localAt = Number(localStorage.getItem(readAtKey)) || 0;
      if (new Date(serverProgress.lastReadAt).getTime() > localAt) setIndex(serverProgress.currentChapter);
    } catch {
      setIndex(serverProgress.currentChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a posição só é aplicada ao abrir o livro.
  }, []);

  useEffect(() => {
    if (!trackProgress || !reading) return;
    try {
      localStorage.setItem(readAtKey, String(Date.now()));
    } catch {
      // Sem armazenamento, a posição do servidor continua valendo.
    }
    const timer = setTimeout(() => {
      // Falha aqui nunca atrapalha a leitura.
      fetch(`/api/v1/reader/publications/${encodeURIComponent(bookId)}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex: index }),
        keepalive: true,
      }).catch(() => undefined);
    }, PROGRESS_DWELL_MS);
    return () => clearTimeout(timer);
  }, [trackProgress, reading, index, bookId]);

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
        libraryHref={libraryHref}
      />
    );
  }

  const count = chapters.length;
  const meta = count > 0 ? `${count} ${count === 1 ? "capítulo" : "capítulos"}` : "Livro em PDF";

  return (
    <>
      <BookHero title={title} subtitle={subtitle} coverUrl={coverUrl} meta={meta} backHref={libraryHref} />

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

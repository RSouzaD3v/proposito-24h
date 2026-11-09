"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, List, Type } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import ReaderControls, { type ReaderPanel } from "./ReaderControls";
import { ReaderPrefsProvider, useReaderPrefs, type ReaderFont, type ReaderTheme } from "./ReaderPrefsContext";

type Chapter = {
  title: string;
  subtitle?: string;
  content: string; // HTML rich
  coverUrl?: string;
};

type Props = {
  bookId: string;
  bookTitle: string;
  chapters: Chapter[];
  index: number;
  onChange: (index: number) => void;
  onExit: () => void;
  libraryHref?: string;
};

const PALETTES: Record<ReaderTheme, Record<string, string>> = {
  light: { "--book-bg": "#fbf7ef", "--book-surface": "#fffdf9", "--book-ink": "#262019", "--book-muted": "#7a6e60", "--book-line": "rgb(70 48 24 / 0.13)" },
  sepia: { "--book-bg": "#f1e6cf", "--book-surface": "#f7eedb", "--book-ink": "#3a2e1f", "--book-muted": "#7d6c52", "--book-line": "rgb(80 58 28 / 0.18)" },
  dark: { "--book-bg": "#100f18", "--book-surface": "#1c1a26", "--book-ink": "#ece5d9", "--book-muted": "#a39a8d", "--book-line": "rgb(255 255 255 / 0.12)" },
};

const FONTS: Record<ReaderFont, string> = {
  serif: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
  sans: "var(--font-reader-sans), system-ui, sans-serif",
  mono: "ui-monospace, Menlo, Consolas, monospace",
};

export const paletteOf = (theme: ReaderTheme) =>
  ({ ...PALETTES[theme], "--primary": "var(--book-ink)", "--foreground": "var(--book-ink)", background: "var(--book-bg)", color: "var(--book-ink)" }) as React.CSSProperties;

const looksLikeHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s.trim());

const escapeHTML = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function toSafeHtml(raw: string) {
  const html = looksLikeHTML(raw)
    ? raw
    : raw
        .split(/\n{2,}/g)
        .map((para) => `<p>${escapeHTML(para).replace(/\n/g, "<br/>")}</p>`)
        .join("");

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "mark", "sup", "sub",
      "blockquote", "ul", "ol", "li", "h2", "h3", "hr", "a", "img",
      "pre", "code", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class", "style"],
  });
}

const barButton = "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--book-line)]";

function Reader({ bookTitle, chapters, index, onChange, onExit, libraryHref = "/reader/area/courses" }: Omit<Props, "bookId">) {
  const { prefs } = useReaderPrefs();
  const [panel, setPanel] = useState<ReaderPanel>(null);

  const chapter = chapters[index];
  const isFirst = index === 0;
  const isLast = index === chapters.length - 1;
  const progress = ((index + 1) / chapters.length) * 100;
  const prev = () => !isFirst && onChange(index - 1);
  const next = () => !isLast && onChange(index + 1);

  // Barra inferior, música e chat saem de cena durante a leitura, sem desmontar.
  useEffect(() => {
    document.body.classList.add("reader-immersive");
    return () => document.body.classList.remove("reader-immersive");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (panel) return;
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="-mb-28 min-h-screen" style={paletteOf(prefs.theme)}>
      <header className="sticky top-0 z-40 border-b border-[var(--book-line)] bg-[var(--book-bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-1 px-2">
          <button type="button" onClick={onExit} aria-label="Voltar para o livro" className={barButton}>
            <ArrowLeft className="size-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-[var(--book-muted)]">{bookTitle}</p>
          <button type="button" onClick={() => setPanel("chapters")} aria-label="Ver capítulos" className={barButton}>
            <List className="size-5" />
          </button>
          <button type="button" onClick={() => setPanel("settings")} aria-label="Ajustar leitura" className={barButton}>
            <Type className="size-5" />
          </button>
        </div>
        <div className="h-0.5 bg-[var(--book-line)]" aria-hidden>
          <div className="h-full bg-[var(--reader-gold)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main key={index} className="mx-auto w-full px-6 pb-36 pt-10 animate-glass-in" style={{ maxWidth: `calc(${prefs.maxChars}ch + 3rem)`, fontFamily: FONTS[prefs.font] }}>
        {chapter.coverUrl && (
          <img src={chapter.coverUrl} alt="" className="mb-8 max-h-96 w-full rounded-3xl object-cover" />
        )}

        <header className="mb-9 text-center">
          <p className="reader-eyebrow">Capítulo {index + 1}</p>
          <h1 className="mt-3 leading-tight" style={{ fontSize: Math.round(prefs.fontSize * 1.75) }}>{chapter.title}</h1>
          {chapter.subtitle && (
            <p className="mt-3 italic text-[var(--book-muted)]" style={{ fontSize: Math.round(prefs.fontSize * 1.1) }}>{chapter.subtitle}</p>
          )}
        </header>

        <article
          className={cn("reader-book", prefs.align === "justify" ? "text-justify" : "text-left")}
          style={{ fontSize: prefs.fontSize, lineHeight: prefs.lineHeight }}
          dangerouslySetInnerHTML={{ __html: toSafeHtml(chapter.content ?? "") }}
        />

        <div className="mt-14 border-t border-[var(--book-line)] pt-8 text-center" style={{ fontFamily: "var(--font-reader-sans), system-ui, sans-serif" }}>
          {isLast ? (
            <>
              <p className="reader-eyebrow">Fim do livro</p>
              <p className="reader-serif mt-2 text-2xl">Que esta leitura frutifique em você.</p>
              <Link href={libraryHref} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--book-line)] px-6 text-sm font-bold">
                Voltar à biblioteca
              </Link>
            </>
          ) : (
            <button type="button" onClick={next} className="group w-full rounded-3xl border border-[var(--book-line)] bg-[var(--book-surface)] p-5 text-left">
              <span className="reader-eyebrow block">Próximo capítulo</span>
              <span className="mt-1 flex items-center justify-between gap-3">
                <span className="reader-serif min-w-0 text-xl leading-snug">{chapters[index + 1].title}</span>
                <ArrowRight className="size-5 shrink-0 transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </button>
          )}
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center" style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--book-line)] bg-[var(--book-surface)]/95 p-1 shadow-[0_14px_40px_-12px_rgb(30_20_10_/_0.45)] backdrop-blur-xl">
          <button type="button" onClick={prev} disabled={isFirst} aria-label="Capítulo anterior" className={cn(barButton, "disabled:opacity-30")}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => setPanel("chapters")} aria-label="Ver capítulos" className="h-11 min-w-20 rounded-full px-3 text-sm font-semibold tabular-nums">
            {index + 1} / {chapters.length}
          </button>
          <button type="button" onClick={next} disabled={isLast} aria-label="Próximo capítulo" className={cn(barButton, "disabled:opacity-30")}>
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <ReaderControls panel={panel} onClose={() => setPanel(null)} chapters={chapters} currentIndex={index} onJump={onChange} />
    </div>
  );
}

export default function ChapterSlider({ bookId, ...props }: Props) {
  return (
    <ReaderPrefsProvider bookId={bookId}>
      <Reader {...props} />
    </ReaderPrefsProvider>
  );
}

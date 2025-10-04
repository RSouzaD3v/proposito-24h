"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import ReaderControls from "./ReaderControls";
import { ReaderPrefsProvider, useReaderPrefs } from "./ReaderPrefsContext";
import { useLocalStorage } from "./useLocalStorage";
import { Settings2 } from "lucide-react";

type Chapter = {
  title: string;
  subtitle?: string;
  content: string;
  coverUrl?: string;
};

type InnerProps = { chapters: Chapter[]; bookId: string };

function pagePalette(theme: "light" | "sepia" | "dark") {
  if (theme === "dark")
    return {
      pageBg: "bg-[#0b0f14] text-white",
      btn: "bg-[#121821]/85 text-white border border-white/15 hover:opacity-90",
      badge: "bg-black/30 text-white",
    };
  if (theme === "sepia")
    return {
      pageBg: "bg-[#f4ecd8] text-[#2b2b2b]",
      btn: "bg-[#efe6cf]/90 text-[#2b2b2b] border border-[#e1d7b9] hover:bg-[#eadfbe]",
      badge: "bg-[#e9dfc3] text-[#2b2b2b]",
    };
  return {
    pageBg: "bg-[#faf9f7] text-[#1f2937]",
    btn: "bg-white/90 text-slate-800 border border-slate-200 hover:bg-slate-100",
    badge: "bg-white/80 text-slate-800",
  };
}

function ThemedContainer({ children }: { children: React.ReactNode }) {
  const { prefs } = useReaderPrefs();
  const pal = pagePalette(prefs.theme);

  // família de fonte respeitando preferência
  const fontClass =
    prefs.font === "sans" ? "font-sans" : prefs.font === "mono" ? "font-mono" : "font-serif";

  return <div className={cn("min-h-screen", pal.pageBg, fontClass)}>{children}</div>;
}

function SliderInner({ chapters, bookId }: InnerProps) {
  const [index, setIndex] = useLocalStorage<number>(`reader:${bookId}:chapterIndex`, 0);
  const [open, setOpen] = useLocalStorage<boolean>(`reader:${bookId}:controlsOpen`, false);
  const { prefs } = useReaderPrefs();
  const pal = pagePalette(prefs.theme);

  const containerRef = useRef<HTMLDivElement>(null);

  const chapter = chapters[index];
  const prev = () => setIndex(index === 0 ? chapters.length - 1 : index - 1);
  const next = () => setIndex(index === chapters.length - 1 ? 0 : index + 1);
  const jump = (i: number) => setIndex(i);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, chapters.length]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  if (!chapters || chapters.length === 0) {
    return (
      <ThemedContainer>
        <div className="flex items-center justify-center min-h-screen opacity-70 text-xl font-medium">
          Nenhum capítulo encontrado.
        </div>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <div ref={containerRef} className="py-32 mx-auto w-full min-h-screen px-4 sm:px-6 md:px-8 pb-40">
        {chapter.coverUrl && (
          <div className="w-full max-h-[380px] overflow-hidden mb-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={chapter.coverUrl} alt={chapter.title} className="w-full object-cover block" />
          </div>
        )}

        <header
          className="text-center space-y-2"
          style={{ maxWidth: `${prefs.maxChars}ch`, marginInline: "auto" }}
        >
          <h2 className="font-bold tracking-tight" style={{ fontSize: Math.round(prefs.fontSize + 8) }}>
            {chapter.title}
          </h2>
          {chapter.subtitle && (
            <h3 className="italic opacity-80" style={{ fontSize: Math.round(prefs.fontSize + 2) }}>
              {chapter.subtitle}
            </h3>
          )}
        </header>

        <article
          className={cn("mt-6 selection:bg-yellow-300/40",
            prefs.align === "justify" ? "text-justify" : "text-left")}
          style={{
            fontSize: prefs.fontSize,
            lineHeight: prefs.lineHeight,
            maxWidth: `${prefs.maxChars}ch`,
            marginInline: "auto",
          }}
        >
          {chapter.content.split(/\n{2,}/g).map((para, i) => (
            <p key={i} className="mb-4 leading-[inherit]">
              {para}
            </p>
          ))}
        </article>
      </div>

      

      {/* Desktop: setas + contador quando painel fechado */}
      {!open && (
        <>
          <div className="hidden md:flex fixed inset-y-0 left-4 items-center z-40">
            <button onClick={prev} aria-label="Anterior" className={cn("rounded-full px-3 py-3 shadow", pal.btn)}>
              <FaChevronLeft />
            </button>
          </div>
          <div className="hidden md:flex fixed inset-y-0 right-4 items-center z-40">
            <button onClick={next} aria-label="Próximo" className={cn("rounded-full px-3 py-3 shadow", pal.btn)}>
              <FaChevronRight />
            </button>
          </div>
          <div className="hidden md:flex fixed bottom-6 inset-x-0 justify-center z-40">
            <span className={cn("px-4 py-1.5 rounded-lg shadow text-sm tabular-nums", pal.badge)}>
              {index + 1} / {chapters.length}
            </span>
          </div>
        </>
      )}

{!open && (
  <div className="md:hidden fixed inset-x-0 z-40"
       style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
    <div className="relative px-4">
      {/* grupo central: esquerda / contador / direita */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Anterior"
            className={cn("rounded-full size-11 shadow flex items-center justify-center", pal.btn)}
          >
            <FaChevronLeft />
          </button>

          <span
            className={cn(
              "px-3 py-1.5 rounded-full shadow text-sm tabular-nums",
              pal.badge
            )}
          >
            {index + 1} / {chapters.length}
          </span>

          <button
            onClick={next}
            aria-label="Próximo"
            className={cn("rounded-full size-11 shadow flex items-center justify-center", pal.btn)}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* engrenagem alinhada à direita, na mesma linha */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir ajustes"
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 rounded-full size-11 shadow flex items-center justify-center",
          pal.btn
        )}
      >
        <Settings2 />
      </button>
    </div>
  </div>
)}

      <ReaderControls
        chaptersCount={chapters.length}
        currentIndex={index}
        onPrev={prev}
        onNext={next}
        onJump={jump}
        open={open}
        setOpen={setOpen}
      />
    </ThemedContainer>
  );
}

export default function ChapterSlider({ chapters, bookId }: { chapters: Chapter[]; bookId: string }) {
  return (
    <ReaderPrefsProvider bookId={bookId}>
      <SliderInner chapters={chapters} bookId={bookId} />
    </ReaderPrefsProvider>
  );
}

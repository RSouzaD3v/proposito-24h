"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import ReaderControls from "./ReaderControls";
import { ReaderPrefsProvider, useReaderPrefs } from "./ReaderPrefsContext";
import { useLocalStorage } from "./useLocalStorage";

type Chapter = {
  title: string;
  subtitle?: string;
  content: string;
  coverUrl?: string;
};

type InnerProps = {
  chapters: Chapter[];
  bookId: string;
};

function ThemedContainer({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  const { prefs } = useReaderPrefs();

  const themeClass = useMemo(() => {
    switch (prefs.theme) {
      case "sepia":
        return "bg-[#f4ecd8] text-[#2b2b2b]";
      case "dark":
        return "bg-[#0b0f14] text-white";
      default:
        return "bg-[#faf9f7] text-[#1f2937]";
    }
  }, [prefs.theme]);

  const fontClass = useMemo(() => {
    switch (prefs.font) {
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
    }
  }, [prefs.font]);

  return (
    <div className={cn("min-h-screen", themeClass, fontClass, className)}>
      {children}
    </div>
  );
}

function SliderInner({ chapters, bookId }: InnerProps) {
  const [index, setIndex] = useLocalStorage<number>(`reader:${bookId}:chapterIndex`, 0);
  const { prefs } = useReaderPrefs();
  const containerRef = useRef<HTMLDivElement>(null);

  const chapter = chapters[index];

  const prev = () => setIndex(index === 0 ? chapters.length - 1 : index - 1);
  const next = () => setIndex(index === chapters.length - 1 ? 0 : index + 1);
  const jump = (i: number) => setIndex(i);

  // teclado ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, chapters.length]);

  // ao trocar capítulo, rolar para topo
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  if (!chapters || chapters.length === 0) {
    return (
      <ThemedContainer className="flex items-center justify-center">
        <div className="text-center mt-10 opacity-70 text-xl font-medium">
          Nenhum capítulo encontrado.
        </div>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer className="relative">
      {/* áreas de toque/click para virar página */}
      <button
        aria-label="Anterior"
        onClick={prev}
        className="hidden md:block select-none absolute left-0 top-0 bottom-0 w-[12%] opacity-0 hover:opacity-20 hover:bg-black/10"
      />
      <button
        aria-label="Próximo"
        onClick={next}
        className="hidden md:block select-none absolute right-0 top-0 bottom-0 w-[12%] opacity-0 hover:opacity-20 hover:bg-black/10"
      />

      <div
        ref={containerRef}
        className="mx-auto w-full min-h-screen px-4 sm:px-6 md:px-8 pb-40"
      >
        {/* capa (opcional) */}
        {chapter.coverUrl && (
          <div className="w-full max-h-[380px] overflow-hidden mb-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chapter.coverUrl}
              alt={chapter.title}
              className="w-full object-cover block transition-transform duration-300"
            />
          </div>
        )}

        {/* título/subtítulo */}
        <header
          className="text-center space-y-2"
          style={{ maxWidth: `${prefs.maxChars}ch`, marginInline: "auto" }}
        >
          <h2
            className="font-bold tracking-tight"
            style={{ fontSize: Math.round(prefs.fontSize + 8) }}
          >
            {chapter.title}
          </h2>
          {chapter.subtitle && (
            <h3
              className="italic opacity-80"
              style={{ fontSize: Math.round(prefs.fontSize + 2) }}
            >
              {chapter.subtitle}
            </h3>
          )}
        </header>

        {/* conteúdo */}
        <article
          className={cn(
            "mt-6 selection:bg-yellow-300/40",
            prefs.align === "justify" ? "text-justify" : "text-left"
          )}
          style={{
            fontSize: prefs.fontSize,
            lineHeight: prefs.lineHeight,
            maxWidth: `${prefs.maxChars}ch`,
            marginInline: "auto",
          }}
        >
          {/* quebra simples por "\n\n" vira parágrafos */}
          {chapter.content.split(/\n{2,}/g).map((para, i) => (
            <p key={i} className="mb-4 leading-[inherit]">
              {para}
            </p>
          ))}
        </article>

        {/* botões flutuantes mobile */}
        <div className="md:hidden fixed bottom-20 right-4 flex gap-2">
          <button
            onClick={prev}
            className="bg-white/80 dark:bg-neutral-800/80 rounded-full shadow px-3 py-3"
            aria-label="Anterior"
          >
            <FaChevronLeft className="text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={next}
            className="bg-white/80 dark:bg-neutral-800/80 rounded-full shadow px-3 py-3"
            aria-label="Próximo"
          >
            <FaChevronRight className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>
      </div>

      {/* controles inferiores */}
      <ReaderControls
        chaptersCount={chapters.length}
        currentIndex={index}
        onPrev={prev}
        onNext={next}
        onJump={jump}
      />
    </ThemedContainer>
  );
}

export default function ChapterSlider({
  chapters,
  bookId,
}: {
  chapters: Chapter[];
  bookId: string;
}) {
  return (
    <ReaderPrefsProvider bookId={bookId}>
      <SliderInner chapters={chapters} bookId={bookId} />
    </ReaderPrefsProvider>
  );
}

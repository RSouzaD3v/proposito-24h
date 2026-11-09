"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Eraser,
  Minus,
  Plus,
  Share2,
  Sparkles,
  Square,
  Type,
  Volume2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VersionSwitch } from "./BibleChrome";
import {
  FONT_SIZE_KEY,
  HIGHLIGHTS,
  LAST_READ_KEY,
  biblePath,
  formatReference,
  markClass,
  type BibleVersionCode,
  type HighlightColor,
} from "./bible-books";

export type ChapterLink = { href: string; label: string };

type Props = {
  version: BibleVersionCode;
  book: { abbrev: string; name: string };
  chapter: number;
  chapters: number[];
  verses: { verse: number; text: string }[];
  prev: ChapterLink | null;
  next: ChapterLink | null;
};

const FONT_SIZES = [16, 18, 20, 22, 24, 27];
const iconButton =
  "grid size-9 shrink-0 place-items-center rounded-full text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]";

export function ChapterReader({ version, book, chapter, chapters, verses, prev, next }: Props) {
  const router = useRouter();
  const [fontIndex, setFontIndex] = useState(1);
  const [showFont, setShowFont] = useState(false);
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [flash, setFlash] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const reference = useMemo(() => formatReference(book.name, chapter, selected), [book.name, chapter, selected]);
  const selectedText = useMemo(
    () =>
      verses
        .filter((item) => selected.includes(item.verse))
        .map((item) => (selected.length > 1 ? `${item.verse} ${item.text}` : item.text))
        .join(" "),
    [verses, selected],
  );

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  // Preferências, posição de leitura e versículo vindo do link (#v16).
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(FONT_SIZE_KEY));
      if (FONT_SIZES.includes(saved)) setFontIndex(FONT_SIZES.indexOf(saved));
      localStorage.setItem(
        LAST_READ_KEY,
        JSON.stringify({ version, abbrev: book.abbrev, name: book.name, chapter, at: Date.now() }),
      );
    } catch {}

    const target = Number(/^#v(\d+)$/.exec(window.location.hash)?.[1]);
    if (target) {
      requestAnimationFrame(() => document.getElementById(`v${target}`)?.scrollIntoView({ block: "center" }));
      setFlash(target);
      setTimeout(() => setFlash(null), 2400);
    }
  }, [version, book.abbrev, book.name, chapter]);

  useEffect(() => {
    fetch(`/api/v1/reader/bible/highlights/chapter?book=${encodeURIComponent(book.abbrev)}&chapter=${chapter}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: { verse: number; color: string }[]) =>
        setHighlights(Object.fromEntries(rows.map((row) => [row.verse, row.color]))),
      )
      .catch(() => {});
  }, [book.abbrev, chapter]);

  // Setas do teclado trocam de capítulo; Esc limpa a seleção.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable=true], [role=dialog]")) return;
      if (event.key === "ArrowLeft" && prev) router.push(prev.href);
      if (event.key === "ArrowRight" && next) router.push(next.href);
      if (event.key === "Escape") setSelected([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const changeFont = (delta: number) => {
    const nextIndex = Math.min(FONT_SIZES.length - 1, Math.max(0, fontIndex + delta));
    setFontIndex(nextIndex);
    try {
      localStorage.setItem(FONT_SIZE_KEY, String(FONT_SIZES[nextIndex]));
    } catch {}
  };

  const toggleVerse = (verse: number) =>
    setSelected((current) => (current.includes(verse) ? current.filter((item) => item !== verse) : [...current, verse]));

  const applyHighlight = useCallback(
    async (color: HighlightColor | null) => {
      const previous = highlights;
      const updated = { ...highlights };
      for (const verse of selected) {
        if (color) updated[verse] = color;
        else delete updated[verse];
      }
      setHighlights(updated);
      setSelected([]);
      try {
        const res = await fetch("/api/v1/reader/bible/highlights", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: book.abbrev, chapter, verses: selected, color }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setHighlights(previous);
        notify("Não foi possível salvar o destaque.");
      }
    },
    [highlights, selected, book.abbrev, chapter],
  );

  const shareText = `“${selectedText}” — ${reference} (${version})`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      notify("Versículo copiado");
    } catch {
      notify("Não foi possível copiar.");
    }
    setSelected([]);
  };

  const share = async () => {
    const hash = selected.length ? `#v${Math.min(...selected)}` : "";
    const url = `${window.location.origin}${biblePath(version, book.abbrev, chapter)}${hash}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: reference, text: shareText, url });
        setSelected([]);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    await copy();
  };

  const explain = () => {
    window.dispatchEvent(
      new CustomEvent("bible-ai:ask", {
        detail: { prompt: `Explique ${reference} (${version}) de forma simples e aplicável: ${shareText}` },
      }),
    );
    setSelected([]);
  };

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    if (!synth) return notify("Seu navegador não lê textos em voz alta.");
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${book.name}, capítulo ${chapter}. ${verses.map((item) => item.text).join(" ")}`,
    );
    utterance.lang = "pt-BR";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  const selectionHasHighlight = selected.some((verse) => highlights[verse]);

  return (
    <article>
      {/* Barra superior fixa: voltar, capítulo, versão, tamanho da letra e áudio. */}
      {/* À direita fica livre o espaço do controle fixo de música e tema da área do leitor. */}
      <header className="sticky top-0 z-30 -mx-4 mb-6 flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--reader-bg)]/90 py-2 pr-[5.75rem] pl-3 backdrop-blur-xl lg:pr-3">
        <Link href={biblePath(version, book.abbrev)} aria-label={`Capítulos de ${book.name}`} className={iconButton}>
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setPicker(true)}
          className="flex min-w-0 flex-1 items-center gap-1 rounded-xl px-2 py-1.5 text-left transition hover:bg-[var(--muted)]"
        >
          <span className="reader-serif truncate text-lg text-[var(--liquid-ink)]">
            {book.name} {chapter}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
        </button>
        <VersionSwitch
          current={version}
          hrefFor={(code) => biblePath(code, book.abbrev, chapter)}
          className="hidden sm:flex"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFont((value) => !value)}
            aria-expanded={showFont}
            aria-label="Opções de leitura"
            className={iconButton}
          >
            <Type className="size-4" aria-hidden />
          </button>
          {showFont && (
            <div className="absolute top-11 right-0 z-40 grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-2 shadow-lg">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => changeFont(-1)} disabled={fontIndex === 0} aria-label="Diminuir letra" className={cn(iconButton, "disabled:opacity-40")}>
                  <Minus className="size-4" aria-hidden />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums text-[var(--liquid-ink)]">
                  {FONT_SIZES[fontIndex]}
                </span>
                <button type="button" onClick={() => changeFont(1)} disabled={fontIndex === FONT_SIZES.length - 1} aria-label="Aumentar letra" className={cn(iconButton, "disabled:opacity-40")}>
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
              <VersionSwitch
                current={version}
                hrefFor={(code) => biblePath(code, book.abbrev, chapter)}
                className="justify-center sm:hidden"
              />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSpeech}
          aria-label={speaking ? "Parar leitura em voz alta" : "Ouvir capítulo"}
          className={cn(iconButton, speaking && "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)] hover:bg-[var(--liquid-accent)]")}
        >
          {speaking ? <Square className="size-3.5" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        </button>
      </header>

      <p className="mb-5 text-[13px] text-[var(--liquid-muted)]">Toque em um versículo para destacar, copiar ou compartilhar.</p>

      {/* Texto corrido, como em uma Bíblia impressa; cada versículo é tocável. */}
      <div
        className="text-[var(--liquid-ink)]"
        style={{ fontFamily: "var(--font-reader-serif), Georgia, serif", fontSize: FONT_SIZES[fontIndex], lineHeight: 1.85 }}
      >
        {verses.map((item) => {
          const isSelected = selected.includes(item.verse);
          return (
            <span
              key={item.verse}
              id={`v${item.verse}`}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => toggleVerse(item.verse)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleVerse(item.verse);
                }
              }}
              className={cn(
                "scroll-mt-28 cursor-pointer rounded-[4px] decoration-[var(--liquid-accent)] decoration-2 underline-offset-[5px] transition-colors outline-none box-decoration-clone focus-visible:ring-2 focus-visible:ring-[var(--liquid-accent)]/40",
                markClass(highlights[item.verse]),
                isSelected && "underline decoration-dotted",
                flash === item.verse && "bg-[var(--reader-gold)]/25",
              )}
            >
              <sup className="mr-1 ml-0.5 align-super text-[0.6em] font-bold text-[var(--reader-gold)] select-none" style={{ fontFamily: "var(--font-reader-sans), system-ui" }}>
                {item.verse}
              </sup>
              {item.text}{" "}
            </span>
          );
        })}
      </div>

      {/* Navegação entre capítulos (atravessa livros no começo e no fim). */}
      <nav aria-label="Capítulos" className="mt-12 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={prev.href} className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4 transition hover:bg-[var(--muted)]/50">
            <ArrowLeft className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs text-[var(--liquid-muted)]">Anterior</span>
              <span className="block truncate font-semibold text-[var(--liquid-ink)]">{prev.label}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="flex items-center justify-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4 text-right transition hover:bg-[var(--muted)]/50">
            <span className="min-w-0">
              <span className="block text-xs text-[var(--liquid-muted)]">Próximo</span>
              <span className="block truncate font-semibold text-[var(--liquid-ink)]">{next.label}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Ações sobre os versículos selecionados. */}
      {selected.length > 0 && (
        <div className="fixed inset-x-3 bottom-40 z-40 mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--reader-surface)] p-3 shadow-2xl md:bottom-24">
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <p className="truncate text-sm font-semibold text-[var(--liquid-ink)]">
              {reference} <span className="font-normal text-[var(--liquid-muted)]">· {version}</span>
            </p>
            <button type="button" onClick={() => setSelected([])} aria-label="Limpar seleção" className={iconButton}>
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2" role="group" aria-label="Cor do destaque">
              {HIGHLIGHTS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => applyHighlight(item.color)}
                  aria-label={`Destacar em ${item.label.toLowerCase()}`}
                  className={cn("size-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-[var(--reader-surface)] transition hover:ring-[var(--liquid-muted)]/50", item.swatch)}
                />
              ))}
              {selectionHasHighlight && (
                <button type="button" onClick={() => applyHighlight(null)} aria-label="Remover destaque" className={iconButton}>
                  <Eraser className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Copiar", icon: Copy, onClick: copy },
              { label: "Compartilhar", icon: Share2, onClick: share },
              { label: "Explicar", icon: Sparkles, onClick: explain },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--muted)]/70 py-2.5 text-xs font-semibold text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 top-20 z-50 flex justify-center px-4">
          <span className="flex items-center gap-2 rounded-full bg-[var(--liquid-ink)] px-4 py-2 text-sm font-semibold text-[var(--reader-surface)] shadow-lg">
            <Check className="size-4" aria-hidden /> {toast}
          </span>
        </div>
      )}

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="reader-premium max-h-[80svh] overflow-y-auto rounded-3xl bg-[var(--reader-bg)] text-[var(--liquid-ink)] sm:max-w-md">
          <DialogTitle className="text-xl">{book.name}</DialogTitle>
          <ul className="grid grid-cols-5 gap-2">
            {chapters.map((item) => (
              <li key={item}>
                <Link
                  href={biblePath(version, book.abbrev, item)}
                  onClick={() => setPicker(false)}
                  aria-current={item === chapter ? "page" : undefined}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl border text-sm font-semibold transition",
                    item === chapter
                      ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]"
                      : "border-[var(--border)] bg-[var(--reader-surface)] hover:bg-[var(--muted)]/50",
                  )}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={biblePath(version)} onClick={() => setPicker(false)} className="text-center text-sm font-semibold text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]">
            Ver todos os livros
          </Link>
        </DialogContent>
      </Dialog>
    </article>
  );
}

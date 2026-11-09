"use client";

import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { paletteOf } from "./ChapterSlider";
import { useReaderPrefs, type ReaderAlign, type ReaderFont, type ReaderTheme } from "./ReaderPrefsContext";

export type ReaderPanel = "chapters" | "settings" | null;

const MIN_SIZE = 14;
const MAX_SIZE = 26;

const THEMES: { value: ReaderTheme; label: string; bg: string; ink: string }[] = [
  { value: "light", label: "Claro", bg: "#fbf7ef", ink: "#262019" },
  { value: "sepia", label: "Sépia", bg: "#f1e6cf", ink: "#3a2e1f" },
  { value: "dark", label: "Noite", bg: "#100f18", ink: "#ece5d9" },
];

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold text-[var(--book-muted)]">{label}</p>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-[var(--book-line)] p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-10 rounded-full text-sm font-semibold transition-colors",
              value === option.value ? "bg-[var(--book-surface)] shadow-sm" : "text-[var(--book-muted)]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const { prefs, setPrefs } = useReaderPrefs();
  const resize = (delta: number) =>
    setPrefs({ ...prefs, fontSize: Math.min(MAX_SIZE, Math.max(MIN_SIZE, prefs.fontSize + delta)) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map(({ value, label, bg, ink }) => (
          <button
            key={value}
            type="button"
            aria-pressed={prefs.theme === value}
            onClick={() => setPrefs({ ...prefs, theme: value })}
            className={cn(
              "flex h-20 flex-col items-center justify-center rounded-2xl border-2 transition-colors",
              prefs.theme === value ? "border-[var(--reader-gold)]" : "border-[var(--book-line)]",
            )}
            style={{ background: bg, color: ink }}
          >
            <span className="reader-serif text-xl">Aa</span>
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-[var(--book-muted)]">Tamanho do texto</p>
        <div className="flex items-center justify-between rounded-full bg-[var(--book-line)] p-1">
          <button type="button" aria-label="Diminuir texto" disabled={prefs.fontSize <= MIN_SIZE} onClick={() => resize(-1)} className="flex size-10 items-center justify-center rounded-full bg-[var(--book-surface)] disabled:opacity-40">
            <Minus className="size-4" />
          </button>
          <span className="text-sm font-semibold tabular-nums" aria-live="polite">{prefs.fontSize} px</span>
          <button type="button" aria-label="Aumentar texto" disabled={prefs.fontSize >= MAX_SIZE} onClick={() => resize(1)} className="flex size-10 items-center justify-center rounded-full bg-[var(--book-surface)] disabled:opacity-40">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <Segmented<ReaderFont>
        label="Fonte"
        value={prefs.font}
        onChange={(font) => setPrefs({ ...prefs, font })}
        options={[{ value: "serif", label: "Serifada" }, { value: "sans", label: "Moderna" }]}
      />
      <Segmented<number>
        label="Espaço entre linhas"
        value={prefs.lineHeight}
        onChange={(lineHeight) => setPrefs({ ...prefs, lineHeight })}
        options={[{ value: 1.5, label: "Compacto" }, { value: 1.8, label: "Normal" }, { value: 2.1, label: "Amplo" }]}
      />
      <Segmented<ReaderAlign>
        label="Alinhamento"
        value={prefs.align}
        onChange={(align) => setPrefs({ ...prefs, align })}
        options={[{ value: "left", label: "À esquerda" }, { value: "justify", label: "Justificado" }]}
      />
      <Segmented<number>
        className="hidden md:block"
        label="Largura da coluna"
        value={prefs.maxChars}
        onChange={(maxChars) => setPrefs({ ...prefs, maxChars })}
        options={[{ value: 55, label: "Estreita" }, { value: 70, label: "Média" }, { value: 85, label: "Larga" }]}
      />
    </div>
  );
}

export default function ReaderControls({
  panel,
  onClose,
  chapters,
  currentIndex,
  onJump,
}: {
  panel: ReaderPanel;
  onClose: () => void;
  chapters: { title: string }[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  const { prefs } = useReaderPrefs();
  const isChapters = panel === "chapters";

  return (
    <Sheet open={panel !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85dvh] max-w-xl gap-0 overflow-y-auto rounded-t-[2rem] border-[var(--book-line)] p-5 pb-8"
        style={{ ...paletteOf(prefs.theme), background: "var(--book-surface)" }}
      >
        <SheetHeader className="mb-4 p-0">
          <SheetTitle className="text-xl text-[var(--book-ink)]">{isChapters ? "Capítulos" : "Ajustes de leitura"}</SheetTitle>
          <SheetDescription className="sr-only">
            {isChapters ? "Escolha o capítulo que deseja ler." : "Personalize a aparência do texto."}
          </SheetDescription>
        </SheetHeader>

        {isChapters ? (
          <ol className="-mx-2">
            {chapters.map((chapter, index) => (
              <li key={index}>
                <button
                  type="button"
                  aria-current={index === currentIndex ? "true" : undefined}
                  onClick={() => {
                    onJump(index);
                    onClose();
                  }}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold",
                    index === currentIndex ? "bg-[var(--book-line)]" : "hover:bg-[var(--book-line)]",
                  )}
                >
                  <span className="w-6 shrink-0 text-center tabular-nums text-[var(--reader-gold)]">{index + 1}</span>
                  <span className="min-w-0 flex-1">{chapter.title}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <Settings />
        )}
      </SheetContent>
    </Sheet>
  );
}

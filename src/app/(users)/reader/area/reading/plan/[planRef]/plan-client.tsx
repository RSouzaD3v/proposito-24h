"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenText, Check, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { biblePath, parsePassage, readLastRead, type BibleBookInfo, type BibleVersionCode } from "@/components/bible/bible-books";

type Day = { id: string; dayNumber: number; passages: string };
type Filter = "pending" | "done" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "pending", label: "Pendentes" },
  { id: "done", label: "Concluídos" },
  { id: "all", label: "Todos" },
];

function ChapterLinks({ passage, books, version, size = "sm" }: { passage: string; books: BibleBookInfo[]; version: BibleVersionCode; size?: "sm" | "lg" }) {
  const parsed = parsePassage(passage, books);
  if (!parsed) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {parsed.chapters.map((chapter) => (
        <Link
          key={chapter}
          href={biblePath(version, parsed.book.abbrev, chapter)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[var(--border)] font-semibold text-[var(--liquid-ink)] transition hover:border-[var(--reader-gold)] hover:bg-[var(--muted)]/50",
            size === "lg" ? "bg-[var(--reader-surface)] px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs",
          )}
        >
          {size === "lg" && <BookOpenText className="size-3.5 text-[var(--reader-gold)]" aria-hidden />}
          {parsed.book.name} {chapter}
        </Link>
      ))}
    </div>
  );
}

function CheckButton({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full border-2 transition active:scale-95",
        checked
          ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]"
          : "border-[var(--input)] text-transparent hover:border-[var(--liquid-accent)] hover:text-[var(--liquid-accent)]/40",
      )}
    >
      <Check className="size-5" strokeWidth={3} aria-hidden />
    </button>
  );
}

export default function PlanClient({
  planId,
  planName,
  days,
  completedInitial,
  books,
}: {
  planId: string;
  planName: string;
  days: Day[];
  completedInitial: string[];
  books: BibleBookInfo[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(completedInitial));
  const [filter, setFilter] = useState<Filter>("pending");
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const [version, setVersion] = useState<BibleVersionCode>("NVI");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Os links de capítulo seguem a versão que o leitor usou por último.
  useEffect(() => {
    const last = readLastRead();
    if (last?.version) setVersion(last.version);
  }, []);

  const total = days.length;
  const done = completed.size;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const nextDay = useMemo(() => days.find((day) => !completed.has(day.id)) ?? null, [days, completed]);
  const visible = days.filter((day) =>
    filter === "all" ? true : filter === "done" ? completed.has(day.id) : !completed.has(day.id),
  );

  const showToast = (text: string, undo?: () => void) => {
    clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const save = useCallback(
    async (day: Day, value: boolean) => {
      setCompleted((current) => {
        const copy = new Set(current);
        if (value) copy.add(day.id);
        else copy.delete(day.id);
        return copy;
      });
      try {
        const res = await fetch("/api/v1/reader/reading-progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, dayId: day.id, completed: value }),
        });
        if (!res.ok) throw new Error();
        return true;
      } catch {
        setCompleted((current) => {
          const copy = new Set(current);
          if (value) copy.delete(day.id);
          else copy.add(day.id);
          return copy;
        });
        showToast("Não foi possível salvar. Tente de novo.");
        return false;
      }
    },
    [planId],
  );

  const toggle = async (day: Day) => {
    const value = !completed.has(day.id);
    if ((await save(day, value)) && value) {
      showToast(`Dia ${day.dayNumber} concluído`, () => {
        setToast(null);
        void save(day, false);
      });
    }
  };

  const jumpTo = (day: Day) => {
    setFilter("all");
    requestAnimationFrame(() => document.getElementById(`dia-${day.dayNumber}`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 pb-10">
      <div className="mb-6 flex items-center pr-[5.25rem] lg:pr-0">
        <Link
          href="/reader/area"
          aria-label="Voltar para o início"
          className="grid size-9 place-items-center rounded-full bg-[var(--reader-surface)] text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      </div>

      <p className="reader-eyebrow">Plano de leitura</p>
      <h1 className="mt-1 text-[2rem] leading-tight text-[var(--liquid-ink)]">{planName}</h1>

      {/* Progresso geral */}
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-5">
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm text-[var(--liquid-muted)]">
            <span className="reader-serif text-3xl text-[var(--liquid-ink)]">{done}</span> de {total} dias
          </p>
          <p className="text-sm font-bold text-[var(--liquid-ink)]">{percent}%</p>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do plano"
        >
          <div className="h-full rounded-full bg-[var(--liquid-accent)] transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-[var(--liquid-muted)]">
          {total - done === 0 ? "Plano concluído!" : `Faltam ${total - done} ${total - done === 1 ? "dia" : "dias"}`}
        </p>
      </div>

      {/* Próxima leitura em destaque */}
      {nextDay ? (
        <section className="mt-4 rounded-3xl bg-[var(--liquid-accent)] p-5 text-[var(--liquid-on-accent)]" aria-label="Próxima leitura">
          <p className="text-xs font-bold tracking-wide uppercase opacity-80">Próxima leitura · Dia {nextDay.dayNumber}</p>
          <p className="reader-serif mt-1 text-2xl">{nextDay.passages}</p>
          <div className="mt-4 [&_a]:border-transparent [&_a]:text-[var(--liquid-ink)]">
            <ChapterLinks passage={nextDay.passages} books={books} version={version} size="lg" />
          </div>
          <button
            type="button"
            onClick={() => toggle(nextDay)}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--reader-surface)] text-[15px] font-bold text-[var(--liquid-ink)] transition hover:brightness-95 active:scale-[0.99]"
          >
            <Check className="size-5" aria-hidden /> Marcar como lido
          </button>
        </section>
      ) : (
        <section className="mt-4 flex flex-col items-center rounded-3xl bg-[var(--liquid-accent)] p-6 text-center text-[var(--liquid-on-accent)]">
          <PartyPopper className="size-8" aria-hidden />
          <p className="reader-serif mt-3 text-2xl">Você leu a Bíblia toda!</p>
          <p className="mt-1 text-sm opacity-85">Todos os {total} dias concluídos.</p>
        </section>
      )}

      {/* Mapa do ano: cada quadrado é um dia */}
      <section className="mt-8" aria-label="Mapa do plano">
        <h2 className="reader-eyebrow mb-3 px-1">Seu ano de leitura</h2>
        <div
          className="grid gap-[3px] rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(12px, 1fr))" }}
        >
          {days.map((day) => {
            const isDone = completed.has(day.id);
            const isNext = day.id === nextDay?.id;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => jumpTo(day)}
                title={`Dia ${day.dayNumber}: ${day.passages}${isDone ? " (lido)" : ""}`}
                aria-label={`Dia ${day.dayNumber}, ${isDone ? "lido" : "pendente"}`}
                className={cn(
                  "aspect-square rounded-[3px] transition hover:scale-125",
                  isDone ? "bg-[var(--liquid-accent)]" : "bg-[var(--muted)]",
                  isNext && "ring-2 ring-[var(--reader-gold)] ring-offset-1 ring-offset-[var(--reader-surface)]",
                )}
              />
            );
          })}
        </div>
      </section>

      {/* Lista de dias com filtro */}
      <section className="mt-8" aria-label="Dias do plano">
        <div role="tablist" className="mb-3 grid grid-cols-3 rounded-2xl bg-[var(--muted)] p-1">
          {FILTERS.map((item) => {
            const active = filter === item.id;
            const count = item.id === "all" ? total : item.id === "done" ? done : total - done;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-xl px-2 py-2 text-sm font-semibold transition",
                  active ? "bg-[var(--reader-surface)] text-[var(--liquid-ink)] shadow-sm" : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
                )}
              >
                {item.label} <span className="font-normal opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--input)] p-8 text-center text-sm text-[var(--liquid-muted)]">
            {filter === "done" ? "Nenhum dia concluído ainda. Comece pela próxima leitura!" : "Nenhum dia pendente."}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]">
            {visible.map((day) => {
              const isDone = completed.has(day.id);
              return (
                <li
                  key={day.id}
                  id={`dia-${day.dayNumber}`}
                  className={cn("flex scroll-mt-24 items-start gap-3 px-4 py-3.5", day.id === nextDay?.id && "bg-[var(--reader-gold)]/8")}
                >
                  <CheckButton
                    checked={isDone}
                    label={`${isDone ? "Desmarcar" : "Marcar"} dia ${day.dayNumber} como lido`}
                    onToggle={() => toggle(day)}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-bold text-[var(--reader-gold)]">
                      Dia {day.dayNumber}
                      {day.id === nextDay?.id && " · próxima leitura"}
                    </p>
                    <p className={cn("font-semibold text-[var(--liquid-ink)]", isDone && "text-[var(--liquid-muted)] line-through decoration-1")}>
                      {day.passages}
                    </p>
                    {!isDone && (
                      <div className="mt-2">
                        <ChapterLinks passage={day.passages} books={books} version={version} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-40 z-50 flex justify-center px-4 md:bottom-24">
          <div className="flex items-center gap-3 rounded-full bg-[var(--liquid-ink)] py-2 pr-2 pl-4 text-sm font-semibold text-[var(--reader-surface)] shadow-lg">
            {toast.text}
            {toast.undo ? (
              <button type="button" onClick={toast.undo} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                Desfazer
              </button>
            ) : (
              <span className="w-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

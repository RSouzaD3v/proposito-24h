"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, HandHeart, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { useThemeWriter } from "../../_contexts/ThemeWriterContext";
import { PrayerFormDialog } from "./PrayerFormDialog";

export interface PrayerEntry {
  id: string;
  title: string;
  notes: string | null;
  imageUrl: string | null;
  startDate: string;
  answeredOn: string | null;
  daysPraying: number;
}

export interface PrayerJournalData {
  today: string;
  items: PrayerEntry[];
}

type Tab = "praying" | "answered";
type Form = { entry: PrayerEntry | null } | null;

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatDay = (day: string) => {
  const [year, month, date] = day.split("-");
  return `${Number(date)} ${MONTHS[Number(month) - 1]} ${year}`;
};

const daysLabel = (days: number) => `${days} ${days === 1 ? "dia" : "dias"}`;

export async function journalRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/v1/reader/prayer-journal${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(message || "Não foi possível concluir. Tente novamente.");
  }
  return data as T;
}

export function PrayerJournal({ initial }: { initial: PrayerJournalData }) {
  const { theme } = useThemeWriter();
  const accent = theme.colorPrimary || "#2b6de5";

  const [items, setItems] = useState(initial.items);
  const [tab, setTab] = useState<Tab>("praying");
  const [form, setForm] = useState<Form>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justAnswered, setJustAnswered] = useState<PrayerEntry | null>(null);

  const praying = useMemo(
    () =>
      items
        .filter((item) => !item.answeredOn)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [items],
  );
  const answered = useMemo(
    () =>
      items
        .filter((item) => item.answeredOn)
        .sort((a, b) => b.answeredOn!.localeCompare(a.answeredOn!)),
    [items],
  );
  const visible = tab === "praying" ? praying : answered;

  useEffect(() => {
    if (!justAnswered) return;
    const timer = setTimeout(() => setJustAnswered(null), 8000);
    return () => clearTimeout(timer);
  }, [justAnswered]);

  const replace = (entry: PrayerEntry) =>
    setItems((current) => current.map((item) => (item.id === entry.id ? entry : item)));

  async function toggle(entry: PrayerEntry) {
    setBusyId(entry.id);
    setError(null);
    try {
      const updated = await journalRequest<PrayerEntry>(
        `/${entry.id}/answer`,
        entry.answeredOn ? "DELETE" : "POST",
      );
      replace(updated);
      setJustAnswered(updated.answeredOn ? updated : null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(entry: PrayerEntry) {
    setItems((current) =>
      current.some((item) => item.id === entry.id)
        ? current.map((item) => (item.id === entry.id ? entry : item))
        : [entry, ...current],
    );
    setForm(null);
    if (!entry.answeredOn) setTab("praying");
  }

  function handleDeleted(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setJustAnswered((current) => (current?.id === id ? null : current));
    setForm(null);
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "praying", label: "Em oração", count: praying.length },
    { id: "answered", label: "Respondidas", count: answered.length },
  ];

  return (
    <>
      <PageHeader
        title="Caderno de Oração"
        description="Seus pedidos diante de Deus, dia após dia."
        actions={
          <Button
            variant="glass-primary"
            className="h-11 rounded-full px-5"
            style={{ backgroundColor: accent }}
            onClick={() => setForm({ entry: null })}
          >
            <Plus className="size-4" /> Novo pedido
          </Button>
        }
      />

      <div className="glass-surface mb-5 grid grid-cols-2 gap-1 rounded-full p-1">
        {tabs.map(({ id, label, count }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                !active && "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
              )}
              style={active ? { backgroundColor: accent, color: "#fff" } : undefined}
            >
              {label}
              <span
                className={cn(
                  "min-w-6 rounded-full px-1.5 text-xs leading-5 tabular-nums",
                  active ? "bg-white/25" : "bg-black/5",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {error && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {justAnswered && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 animate-glass-in">
            <Sparkles className="size-5 shrink-0 text-emerald-600" />
            <p className="min-w-0 flex-1">
              <strong className="font-semibold">Glória a Deus!</strong> Oração respondida
              {justAnswered.daysPraying > 0 ? ` após ${daysLabel(justAnswered.daysPraying)}.` : " hoje."}
            </p>
            <button
              type="button"
              className="shrink-0 rounded-lg px-2 py-1 font-semibold underline underline-offset-2"
              onClick={() => toggle(justAnswered)}
            >
              Desfazer
            </button>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState tab={tab} accent={accent} onCreate={() => setForm({ entry: null })} />
      ) : (
        <ul className="space-y-3">
          {visible.map((entry) => (
            <li key={entry.id}>
              <EntryCard
                entry={entry}
                accent={accent}
                busy={busyId === entry.id}
                onToggle={() => toggle(entry)}
                onOpen={() => setForm({ entry })}
              />
            </li>
          ))}
        </ul>
      )}

      {form && (
        <PrayerFormDialog
          entry={form.entry}
          today={initial.today}
          accent={accent}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

function EntryCard({
  entry,
  accent,
  busy,
  onToggle,
  onOpen,
}: {
  entry: PrayerEntry;
  accent: string;
  busy: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const answered = !!entry.answeredOn;

  return (
    <GlassCard strong padding="none" className="flex items-center gap-1 p-2 pr-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={answered}
        aria-label={`Marcar "${entry.title}" como respondida`}
        disabled={busy}
        onClick={onToggle}
        className="group flex size-11 shrink-0 items-center justify-center rounded-full"
      >
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 transition-all duration-200 motion-safe:group-active:scale-90",
            answered
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-[var(--liquid-muted)]/50 text-transparent group-hover:border-emerald-500 group-hover:text-emerald-500",
          )}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin text-[var(--liquid-muted)]" />
          ) : (
            <Check className="size-4" strokeWidth={3} />
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Abrir pedido "${entry.title}"`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 text-left"
      >
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt=""
            className={cn("size-16 shrink-0 rounded-xl object-cover sm:size-20", answered && "opacity-80")}
          />
        )}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-semibold text-[var(--liquid-ink)]",
              answered && "text-[var(--liquid-muted)] line-through decoration-emerald-500/60",
            )}
          >
            {entry.title}
          </span>
          {entry.notes && (
            <span className="mt-0.5 line-clamp-2 block text-sm text-[var(--liquid-muted)]">
              {entry.notes}
            </span>
          )}
          <span className="mt-1 block text-xs text-[var(--liquid-muted)]">
            {answered ? `Respondida em ${formatDay(entry.answeredOn!)}` : `Desde ${formatDay(entry.startDate)}`}
          </span>
        </span>
        <span
          className="flex w-14 shrink-0 flex-col items-center"
          style={{ color: answered ? "#059669" : accent }}
        >
          {entry.daysPraying === 0 ? (
            <span className="text-sm font-bold">Hoje</span>
          ) : (
            <>
              <span className="text-2xl font-bold leading-none tabular-nums">{entry.daysPraying}</span>
              <span className="mt-1 text-[11px] font-medium">{entry.daysPraying === 1 ? "dia" : "dias"}</span>
            </>
          )}
        </span>
      </button>
    </GlassCard>
  );
}

function EmptyState({ tab, accent, onCreate }: { tab: Tab; accent: string; onCreate: () => void }) {
  const praying = tab === "praying";

  return (
    <GlassCard strong className="flex flex-col items-center gap-3 py-12 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: praying ? accent : "#10b981" }}
      >
        {praying ? <HandHeart className="size-7" /> : <Check className="size-7" strokeWidth={3} />}
      </span>
      <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
        {praying ? "Qual é o seu pedido hoje?" : "As respostas ficarão aqui"}
      </h2>
      <p className="max-w-sm text-sm text-[var(--liquid-muted)]">
        {praying
          ? "Anote seu pedido, adicione uma foto que represente essa oração e acompanhe cada dia até a resposta."
          : "Quando Deus responder, marque o pedido e guarde aqui o testemunho da fidelidade dele."}
      </p>
      {praying && (
        <Button variant="glass" className="mt-1 h-11 rounded-full px-5" onClick={onCreate}>
          <Plus className="size-4" /> Registrar pedido
        </Button>
      )}
    </GlassCard>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { BookOpen, Pencil, Plus, Trash2, Type } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import {
  bibleChapterAction,
  bibleChaptersAction,
  createWidgetVerseAction,
  deleteWidgetVerseAction,
  updateWidgetVerseAction,
  type WidgetSource,
  type WidgetVerseInput,
} from "../actions";

/** Mesmos limites da API (WIDGET_LIMITS). */
export const LIMITS = { shortText: 90, inlineText: 30, reference: 40 } as const;

export type BibleBook = { id: number; abbrev: string; name: string; order: number };
export type BibleVersion = { code: string; name: string };

export type WidgetVerse = {
  id: string;
  reference: string;
  shortText: string;
  inlineText: string | null;
  fullText: string | null;
  versionCode: string | null;
  chapter: number | null;
  verseStart: number | null;
  verseEnd: number | null;
  active: boolean;
  book: { abbrev: string; name: string } | null;
};

/** Texto curto do círculo: "Sl 23:1". Avulso usa as iniciais da referência. */
export function circleLabel(item: Pick<WidgetVerse, "book" | "chapter" | "verseStart" | "reference">) {
  if (item.book && item.chapter && item.verseStart) {
    const abbrev = item.book.abbrev.charAt(0).toUpperCase() + item.book.abbrev.slice(1);
    return `${abbrev} ${item.chapter}:${item.verseStart}`;
  }
  return item.reference.slice(0, 8);
}

const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" });

/** Prévia da tela de bloqueio do iPhone com os três formatos de widget. */
export function LockScreenPreview({
  shortText,
  inlineText,
  reference,
  circle,
  className,
}: {
  shortText: string;
  inlineText: string;
  reference: string;
  circle: string;
  className?: string;
}) {
  const date = WEEKDAY.format(new Date()).replace(".", "").replace(",", "");
  return (
    <div
      className={cn(
        "relative mx-auto flex aspect-[9/16] w-full max-w-[260px] flex-col items-center overflow-hidden rounded-[2rem] border-[6px] border-slate-900 bg-gradient-to-b from-[#6f93c4] via-[#89a9d4] to-[#c9d7e8] px-4 pt-10 text-white shadow-xl",
        className,
      )}
      aria-label="Prévia da tela de bloqueio"
    >
      <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" aria-hidden />
      <p className="max-w-full truncate text-[13px] font-semibold drop-shadow-sm">
        <span className="capitalize">{date}</span>
        <span className="ml-1.5">{inlineText || reference || "—"}</span>
      </p>
      <p className="text-[64px] font-semibold leading-none tracking-tight drop-shadow-sm">12:00</p>
      <div className="mt-4 flex w-full items-start gap-2">
        <div className="min-w-0 flex-1 rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
          <p className="line-clamp-3 font-serif text-[12px] font-semibold leading-snug">{shortText || "Texto do widget"}</p>
        </div>
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 p-1 text-center text-[10px] font-semibold leading-tight backdrop-blur-sm">
          {circle || "✝"}
        </div>
      </div>
    </div>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("text-xs tabular-nums", value.length > max ? "font-semibold text-red-600" : "text-slate-500")}>
      {value.length}/{max}
    </span>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>;
}

type Form = {
  mode: "bible" | "free";
  shortText: string;
  inlineText: string;
  reference: string;
  fullText: string;
  active: boolean;
  version: string;
  book: string;
  chapter: number | null;
  verseStart: number | null;
  verseEnd: number | null;
};

function initialForm(item: WidgetVerse | undefined, defaultVersion: string): Form {
  return {
    mode: item && !item.book ? "free" : "bible",
    shortText: item?.shortText ?? "",
    inlineText: item?.inlineText ?? "",
    reference: item?.reference ?? "",
    fullText: item?.fullText ?? "",
    active: item?.active ?? true,
    version: item?.versionCode ?? defaultVersion,
    book: item?.book?.abbrev ?? "",
    chapter: item?.chapter ?? null,
    verseStart: item?.verseStart ?? null,
    verseEnd: item?.verseEnd ?? null,
  };
}

/** Cria (sem `item`) ou edita um item do widget. */
export function WidgetVerseDialog({
  item,
  books,
  versions,
}: {
  item?: WidgetVerse;
  books: BibleBook[];
  versions: BibleVersion[];
}) {
  const router = useRouter();
  const defaultVersion = versions.find((version) => version.code === "NVI")?.code ?? versions[0]?.code ?? "";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => initialForm(item, defaultVersion));
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
  const [loadingBible, setLoadingBible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setForm(initialForm(item, defaultVersion));
    setError(null);
    // Só ao abrir: recarregar a cada render apagaria o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  // Capítulos do livro escolhido.
  useEffect(() => {
    if (!open || form.mode !== "bible" || !form.version || !form.book) return setChapters([]);
    let cancelled = false;
    bibleChaptersAction(form.version, form.book).then((list) => !cancelled && setChapters(list));
    return () => {
      cancelled = true;
    };
  }, [open, form.mode, form.version, form.book]);

  // Versículos do capítulo escolhido.
  useEffect(() => {
    if (!open || form.mode !== "bible" || !form.version || !form.book || !form.chapter) return setVerses([]);
    let cancelled = false;
    setLoadingBible(true);
    bibleChapterAction(form.version, form.book, form.chapter).then((list) => {
      if (cancelled) return;
      setVerses(list);
      setLoadingBible(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, form.mode, form.version, form.book, form.chapter]);

  const bookName = books.find((book) => book.abbrev === form.book)?.name ?? "";
  const start = form.verseStart;
  const end = form.verseEnd && start && form.verseEnd >= start ? form.verseEnd : start;
  const passage = useMemo(
    () => (start && end ? verses.filter((verse) => verse.verse >= start && verse.verse <= end).map((verse) => verse.text.trim()).join(" ") : ""),
    [verses, start, end],
  );
  const bibleReference = bookName && form.chapter && start ? `${bookName} ${form.chapter}:${start}${end && end > start ? `-${end}` : ""}` : "";
  const reference = form.mode === "bible" ? bibleReference : form.reference.trim();
  const circle = circleLabel({
    book: form.mode === "bible" && form.book ? { abbrev: form.book, name: bookName } : null,
    chapter: form.chapter,
    verseStart: start,
    reference,
  });

  const fillFromPassage = () => {
    const text = passage.replace(/\s+/g, " ").trim();
    set("shortText", text.length > LIMITS.shortText ? `${text.slice(0, LIMITS.shortText - 1).replace(/\s+\S*$/, "")}…` : text);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const shortText = form.shortText.trim();
    if (!shortText) return setError("Escreva o texto do widget.");
    if (shortText.length > LIMITS.shortText) return setError(`O texto do widget pode ter até ${LIMITS.shortText} caracteres.`);
    if (form.inlineText.trim().length > LIMITS.inlineText) return setError(`A linha ao lado da data pode ter até ${LIMITS.inlineText} caracteres.`);
    let source: WidgetSource | null = null;
    if (form.mode === "bible") {
      if (!form.version || !form.book || !form.chapter || !start) return setError("Escolha versão, livro, capítulo e versículo.");
      source = { versionCode: form.version, bookAbbrev: form.book, chapter: form.chapter, verseStart: start, verseEnd: end ?? start };
    }
    const input: WidgetVerseInput = {
      shortText,
      inlineText: form.inlineText.trim() || null,
      reference: form.mode === "free" ? form.reference.trim() : "",
      fullText: form.mode === "free" ? form.fullText.trim() || null : null,
      source,
      active: form.active,
    };
    startTransition(async () => {
      const result = item ? await updateWidgetVerseAction(item.id, input) : await createWidgetVerseAction(input);
      if (!result.ok) return setError(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  const verseNumbers = verses.map((verse) => verse.verse);

  return (
    <>
      {item ? (
        <Button variant="ghost" size="icon" className="size-8 rounded-full text-[var(--liquid-muted)]" onClick={() => setOpen(true)} aria-label="Editar item">
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button variant="glass-primary" className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo item
        </Button>
      )}

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <form onSubmit={submit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{item ? "Editar item do widget" : "Novo item do widget"}</DialogTitle>
              <DialogDescription>Escolha um trecho da Bíblia ou escreva uma frase. A prévia mostra como fica na tela de bloqueio.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-[1fr_240px]">
              <div className="grid content-start gap-4">
                <Tabs value={form.mode} onValueChange={(value) => set("mode", value as Form["mode"])}>
                  <TabsList className="w-full">
                    <TabsTrigger value="bible" className="flex-1"><BookOpen className="size-4" /> Da Bíblia</TabsTrigger>
                    <TabsTrigger value="free" className="flex-1"><Type className="size-4" /> Avulso</TabsTrigger>
                  </TabsList>
                </Tabs>

                {form.mode === "bible" ? (
                  <div className="grid gap-3 rounded-xl border p-3">
                    <div className="grid gap-3 sm:grid-cols-[110px_1fr]">
                      <div className="grid gap-1.5">
                        <Label>Versão</Label>
                        <Select value={form.version} onValueChange={(value) => set("version", value)}>
                          <SelectTrigger><SelectValue placeholder="Versão" /></SelectTrigger>
                          <SelectContent>
                            {versions.map((version) => (
                              <SelectItem key={version.code} value={version.code}>{version.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Livro</Label>
                        <Select
                          value={form.book}
                          onValueChange={(value) => setForm((current) => ({ ...current, book: value, chapter: null, verseStart: null, verseEnd: null }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Escolha o livro" /></SelectTrigger>
                          <SelectContent className="max-h-72">
                            {books.map((book) => (
                              <SelectItem key={book.abbrev} value={book.abbrev}>{book.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-1.5">
                        <Label>Capítulo</Label>
                        <Select
                          value={form.chapter ? String(form.chapter) : ""}
                          onValueChange={(value) => setForm((current) => ({ ...current, chapter: Number(value), verseStart: null, verseEnd: null }))}
                          disabled={!chapters.length}
                        >
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent className="max-h-72">
                            {chapters.map((chapter) => (
                              <SelectItem key={chapter} value={String(chapter)}>{chapter}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Do versículo</Label>
                        <Select
                          value={form.verseStart ? String(form.verseStart) : ""}
                          onValueChange={(value) =>
                            setForm((current) => ({
                              ...current,
                              verseStart: Number(value),
                              verseEnd: current.verseEnd && current.verseEnd >= Number(value) ? current.verseEnd : Number(value),
                            }))
                          }
                          disabled={!verseNumbers.length}
                        >
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent className="max-h-72">
                            {verseNumbers.map((verse) => (
                              <SelectItem key={verse} value={String(verse)}>{verse}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Até o</Label>
                        <Select value={end ? String(end) : ""} onValueChange={(value) => set("verseEnd", Number(value))} disabled={!start}>
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent className="max-h-72">
                            {verseNumbers.filter((verse) => start && verse >= start && verse <= start + 30).map((verse) => (
                              <SelectItem key={verse} value={String(verse)}>{verse}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {loadingBible ? (
                      <p className="text-sm text-slate-500">Carregando…</p>
                    ) : passage ? (
                      <div className="grid gap-2 rounded-lg bg-slate-50 p-3">
                        <p className="text-sm leading-relaxed text-slate-700">{passage}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-500">{bibleReference}</span>
                          <Button type="button" size="sm" variant="outline" onClick={fillFromPassage}>
                            Usar como texto do widget
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid gap-3 rounded-xl border p-3">
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="widget-reference">Referência ou autor</Label>
                        <Counter value={form.reference} max={LIMITS.reference} />
                      </div>
                      <Input id="widget-reference" value={form.reference} maxLength={LIMITS.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Opcional. Ex.: Spurgeon" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="widget-full">Texto completo</Label>
                      <Textarea id="widget-full" rows={3} value={form.fullText} maxLength={4000} onChange={(e) => set("fullText", e.target.value)} placeholder="Opcional. Aparece no app ao tocar no widget." />
                    </div>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="widget-short">Texto do widget</Label>
                    <Counter value={form.shortText} max={LIMITS.shortText} />
                  </div>
                  <Textarea
                    id="widget-short"
                    rows={3}
                    value={form.shortText}
                    onChange={(e) => set("shortText", e.target.value)}
                    placeholder="Até 3 linhas curtas. Ex.: O Senhor é o meu pastor; nada me faltará."
                  />
                  <p className="text-xs text-slate-500">Aparece abaixo do relógio. Trechos longos: resuma aqui; o texto completo abre no app.</p>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="widget-inline">Linha ao lado da data</Label>
                    <Counter value={form.inlineText} max={LIMITS.inlineText} />
                  </div>
                  <Input id="widget-inline" value={form.inlineText} onChange={(e) => set("inlineText", e.target.value)} placeholder={reference ? `Vazio usa "${reference}"` : "Opcional. Ex.: Deus é fiel."} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                  <div>
                    <Label htmlFor="widget-active">Ativo no widget</Label>
                    <p className="text-xs text-slate-500">Desativado, sai do sorteio nos aparelhos na próxima sincronização.</p>
                  </div>
                  <Switch id="widget-active" checked={form.active} onCheckedChange={(value) => set("active", value)} />
                </div>
              </div>

              <div className="hidden md:block">
                <LockScreenPreview shortText={form.shortText.trim()} inlineText={form.inlineText.trim()} reference={reference} circle={circle} />
                <p className="mt-2 text-center text-xs text-slate-500">No aparelho, o iOS aplica o branco translúcido do sistema.</p>
              </div>
            </div>

            {error && <ErrorText>{error}</ErrorText>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <ButtonSpinner />} Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WidgetActiveSwitch({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(active);
  const [pending, startTransition] = useTransition();

  useEffect(() => setChecked(active), [active]);

  return (
    <Switch
      checked={checked}
      disabled={pending}
      aria-label={checked ? "Desativar no widget" : "Ativar no widget"}
      onCheckedChange={(next) =>
        startTransition(async () => {
          setChecked(next);
          const result = await updateWidgetVerseAction(id, { active: next });
          if (!result.ok) return setChecked(!next);
          router.refresh();
        })
      }
    />
  );
}

export function DeleteWidgetVerseButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
        aria-label={`Excluir ${label}`}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Excluir item do widget?"
        description={<>Sai do sorteio nos aparelhos na próxima sincronização. Para tirar só por um tempo, use o interruptor.</>}
        confirmLabel="Excluir"
        destructive
        pending={pending}
        error={error}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteWidgetVerseAction(id);
            if (!result.ok) return setError(result.message);
            setOpen(false);
            router.refresh();
          })
        }
      />
    </>
  );
}

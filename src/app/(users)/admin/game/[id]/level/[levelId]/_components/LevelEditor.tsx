"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Check, CircleAlert, RotateCcw, Shuffle, Sparkles, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/glass-card";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../../../../_components/ConfirmDialog";
import { SectionTitle } from "../../../../../_components/StatTile";
import { addWordAction, applyDefaultLayoutAction, deleteWordAction, updateLevelAction } from "../../../../actions";

type Word = { id: string; word: string; bonus: boolean };
type Point = { x: number; y: number };

export type LevelData = {
  id: string;
  order: number;
  letters: string[];
  layout: unknown;
  words: Word[];
  gameTemplate: { id: string; title: string };
};

/** Mesmo cálculo da API (circularLayout). */
function circularLayout(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    return { x: Number((0.5 + 0.28 * Math.cos(angle)).toFixed(2)), y: Number((0.5 + 0.28 * Math.sin(angle)).toFixed(2)) };
  });
}

/** "A, B, C" ou "ABC" → ["A","B","C"]; tokens com mais de uma letra só com separador. */
function parseLetters(raw: string) {
  const text = raw.toUpperCase().trim();
  if (!text) return [];
  const tokens = /[\s,;]/.test(text) ? text.split(/[\s,;]+/) : [...text];
  return tokens.map((token) => token.trim()).filter(Boolean).map((token) => token.slice(0, 5));
}

/** A palavra pode ser montada usando cada peça da roda no máximo uma vez? */
function canForm(word: string, tokens: string[]): boolean {
  const used = new Array(tokens.length).fill(false);
  const walk = (position: number): boolean => {
    if (position === word.length) return true;
    for (let index = 0; index < tokens.length; index++) {
      if (used[index] || !word.startsWith(tokens[index], position)) continue;
      used[index] = true;
      if (walk(position + tokens[index].length)) return true;
      used[index] = false;
    }
    return false;
  };
  return walk(0);
}

const normalizeWord = (value: string) => value.toUpperCase().replace(/\s+/g, "");

export function LevelEditor({ level }: { level: LevelData }) {
  const router = useRouter();
  const gameId = level.gameTemplate.id;
  const [letters, setLetters] = useState(level.letters);
  const [order, setOrder] = useState(String(level.order));
  const [letterInput, setLetterInput] = useState("");
  const [word, setWord] = useState("");
  const [bonus, setBonus] = useState(false);
  const [toDelete, setToDelete] = useState<Word | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dirty = order !== String(level.order) || letters.join("|") !== level.letters.join("|");
  const savedLayout = Array.isArray(level.layout) && level.layout.length === level.letters.length ? (level.layout as Point[]) : null;
  const layout = !dirty && savedLayout ? savedLayout : circularLayout(letters.length);
  const customLayout = Boolean(savedLayout) && JSON.stringify(savedLayout) !== JSON.stringify(circularLayout(level.letters.length));

  const candidate = normalizeWord(word);
  const existing = new Set(level.words.map((item) => item.word));
  const wordIssue = !candidate
    ? null
    : candidate.length < 2
      ? "Use pelo menos 2 letras."
      : existing.has(candidate)
        ? "Esta palavra já está no nível."
        : !canForm(candidate, letters)
          ? "Não dá para formar com as letras da roda."
          : null;

  const analysis = useMemo(
    () =>
      level.words
        .map((item) => ({ ...item, formable: canForm(item.word, level.letters) }))
        .sort((a, b) => Number(a.bonus) - Number(b.bonus) || a.word.length - b.word.length || a.word.localeCompare(b.word)),
    [level.words, level.letters],
  );
  const mainWords = analysis.filter((item) => !item.bonus);
  const bonusWords = analysis.filter((item) => item.bonus);
  const invalidWords = analysis.filter((item) => !item.formable);
  const longest = analysis.reduce((max, item) => Math.max(max, item.word.length), 0);

  const run = (key: string, task: () => Promise<{ ok: true } | { ok: false; message: string }>, success: string, after?: () => void) => {
    setBusy(key);
    setNotice(null);
    startTransition(async () => {
      const result = await task();
      setBusy(null);
      if (!result.ok) return setNotice({ ok: false, text: result.message });
      after?.();
      setNotice({ ok: true, text: success });
      router.refresh();
    });
  };

  const addLetters = () => {
    const parsed = parseLetters(letterInput);
    if (!parsed.length) return;
    setLetters((current) => [...current, ...parsed].slice(0, 30));
    setLetterInput("");
  };

  const saveLevel = () => {
    const orderNumber = Number(order);
    if (!Number.isInteger(orderNumber) || orderNumber < 1) return setNotice({ ok: false, text: "A ordem precisa ser um número inteiro a partir de 1." });
    run("level", () => updateLevelAction(gameId, level.id, { order: orderNumber, letters }), "Nível salvo.");
  };

  const addWord = (event: React.FormEvent) => {
    event.preventDefault();
    if (!candidate || wordIssue) return;
    run("word", () => addWordAction(gameId, level.id, { word: candidate, bonus }), `“${candidate}” adicionada.`, () => {
      setWord("");
      setBonus(false);
    });
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-xl animate-glass-in",
            notice.ok ? "border-emerald-200/70 bg-emerald-50/85 text-emerald-800" : "border-red-200/70 bg-red-50/85 text-red-800",
          )}
        >
          {notice.ok ? <Check className="size-4 shrink-0" aria-hidden /> : <CircleAlert className="size-4 shrink-0" aria-hidden />}
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso" className="rounded-full p-1 hover:bg-black/5">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Letras */}
        <GlassCard strong className="lg:col-span-3">
          <SectionTitle title="Letras da roda" description="Cada peça pode ser usada uma vez por palavra. Até 30 peças." />

          <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/55 p-3">
            {letters.map((letter, index) => (
              <span key={`${letter}-${index}`} className="group inline-flex h-10 items-center gap-1 rounded-xl bg-white pl-3 pr-1 font-mono text-lg font-bold text-[var(--liquid-ink)] shadow-sm">
                {letter}
                <button
                  type="button"
                  onClick={() => setLetters((current) => current.filter((_, position) => position !== index))}
                  className="rounded-md p-1 text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remover ${letter}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            {letters.length === 0 && <span className="text-sm text-[var(--liquid-muted)]">Nenhuma letra ainda.</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="grid min-w-48 flex-1 gap-1.5">
              <Label htmlFor="letters" className="text-xs text-[var(--liquid-muted)]">Adicionar letras</Label>
              <Input
                id="letters"
                value={letterInput}
                onChange={(event) => setLetterInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLetters();
                  }
                }}
                placeholder="Ex.: AMOR ou A, M, O, R"
                className="border-white/70 bg-white/75 font-mono uppercase"
              />
            </div>
            <Button type="button" variant="glass" className="rounded-full" onClick={addLetters} disabled={!letterInput.trim()}>
              Adicionar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              disabled={letters.length < 2}
              onClick={() => setLetters((current) => [...current].sort(() => Math.random() - 0.5))}
              title="Embaralhar a ordem na roda"
            >
              <Shuffle className="size-4" /> Embaralhar
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-black/5 pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="order" className="text-xs text-[var(--liquid-muted)]">Ordem do nível</Label>
              <Input id="order" type="number" min={1} value={order} onChange={(event) => setOrder(event.target.value)} className="w-28 border-white/70 bg-white/75" />
            </div>
            <div className="flex items-center gap-2">
              {dirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLetters(level.letters);
                    setOrder(String(level.order));
                  }}
                >
                  <RotateCcw className="size-4" /> Desfazer
                </Button>
              )}
              <Button type="button" variant="glass-primary" className="rounded-full" onClick={saveLevel} disabled={!dirty || busy === "level"}>
                {busy === "level" && <ButtonSpinner />} Salvar nível
              </Button>
            </div>
          </div>
          {dirty && letters.length !== level.letters.length && (
            <p className="mt-2 text-xs text-[var(--liquid-muted)]">Como a quantidade de letras mudou, a roda volta ao layout circular ao salvar.</p>
          )}
        </GlassCard>

        {/* Roda */}
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle
            title="Prévia da roda"
            description={dirty ? "Prévia com as alterações não salvas" : customLayout ? "Layout personalizado salvo" : "Layout circular"}
            action={
              customLayout && !dirty ? (
                <Button
                  size="sm"
                  variant="glass"
                  className="rounded-full"
                  disabled={busy === "layout"}
                  onClick={() => run("layout", () => applyDefaultLayoutAction(gameId, level.id), "Layout circular aplicado.")}
                >
                  {busy === "layout" && <ButtonSpinner />} Restaurar circular
                </Button>
              ) : undefined
            }
          />
          <div className="relative mx-auto aspect-square w-full max-w-72 rounded-full bg-gradient-to-br from-[#7c5cd6]/10 to-[#2a78d6]/10">
            <div className="absolute inset-[14%] rounded-full border-2 border-dashed border-[#7c5cd6]/20" aria-hidden />
            {layout.map((point, index) => (
              <span
                key={index}
                className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-mono text-lg font-bold text-[var(--liquid-ink)] shadow-[0_4px_14px_rgb(15_40_80_/_0.15)]"
                style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
              >
                {letters[index]}
              </span>
            ))}
            {letters.length === 0 && (
              <span className="absolute inset-0 flex items-center justify-center text-sm text-[var(--liquid-muted)]">Adicione letras</span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Palavras */}
      <GlassCard strong>
        <SectionTitle
          title="Palavras"
          description={`${mainWords.length} principais · ${bonusWords.length} bônus${longest ? ` · maior com ${longest} letras` : ""}`}
        />

        <form onSubmit={addWord} className="flex flex-wrap items-start gap-3 rounded-2xl border border-white/70 bg-white/55 p-3">
          <div className="grid min-w-48 flex-1 gap-1">
            <Input
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder="NOVA PALAVRA"
              aria-label="Nova palavra"
              aria-invalid={Boolean(wordIssue)}
              maxLength={60}
              className="border-white/70 bg-white font-mono uppercase"
            />
            {wordIssue ? (
              <p className="text-xs text-red-700">{wordIssue}</p>
            ) : candidate ? (
              <p className="flex items-center gap-1 text-xs text-emerald-700"><Check className="size-3" aria-hidden /> Pode ser formada com a roda</p>
            ) : (
              <p className="text-xs text-[var(--liquid-muted)]">Validada contra as letras {dirty ? "(incluindo as não salvas)" : "da roda"}.</p>
            )}
          </div>
          <label className="flex h-9 items-center gap-2 text-sm text-[var(--liquid-ink)]">
            <Switch checked={bonus} onCheckedChange={setBonus} aria-label="Palavra bônus" /> Bônus
          </label>
          <Button type="submit" variant="glass-primary" className="rounded-full" disabled={!candidate || Boolean(wordIssue) || busy === "word"}>
            {busy === "word" && <ButtonSpinner />} Adicionar
          </Button>
        </form>

        {invalidWords.length > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {invalidWords.length === 1 ? "1 palavra não" : `${invalidWords.length} palavras não`} pode(m) ser formada(s) com as letras salvas: {invalidWords.map((item) => item.word).join(", ")}.
          </p>
        )}

        {analysis.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--liquid-muted)]">Nenhuma palavra ainda. O nível precisa de pelo menos uma para ser jogável.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              { title: "Principais", items: mainWords, icon: Sparkles },
              { title: "Bônus", items: bonusWords, icon: Star },
            ].map(({ title, items, icon: Icon }) => (
              <div key={title}>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--liquid-muted)]">
                  <Icon className="size-3.5" aria-hidden /> {title} · {items.length}
                </p>
                {items.length === 0 ? (
                  <p className="text-sm text-[var(--liquid-muted)]">—</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl py-1 pl-3 pr-1 font-mono text-sm font-semibold shadow-sm",
                          item.formable ? "bg-white text-[var(--liquid-ink)]" : "bg-amber-50 text-amber-900 ring-1 ring-amber-300",
                          item.bonus && item.formable && "bg-amber-50/70",
                        )}
                        title={item.formable ? `${item.word.length} letras` : "Não pode ser formada com as letras atuais"}
                      >
                        {item.word}
                        <span className="text-[10px] font-normal text-[var(--liquid-muted)]">{item.word.length}</span>
                        <button
                          type="button"
                          onClick={() => setToDelete(item)}
                          className="rounded-md p-1 text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
                          aria-label={`Remover ${item.word}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Remover palavra?"
        description={<>A palavra <b className="font-mono">{toDelete?.word}</b> sai deste nível.</>}
        confirmLabel="Remover"
        destructive
        pending={busy === "delete"}
        onConfirm={() =>
          toDelete &&
          run("delete", () => deleteWordAction(gameId, level.id, toDelete.id), `“${toDelete.word}” removida.`, () => setToDelete(null))
        }
      />
    </div>
  );
}

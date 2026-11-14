"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Check, CloudOff, HandHeart, Loader2, Map as MapIcon, Quote, ScrollText, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tier = "FREE" | "SUBSCRIPTION" | "PAID_PATRON";
type ContentKey = "devotional" | "verse" | "prayer" | "quote" | "biblePlan";
type Access = Record<ContentKey, Tier>;
type SaveState = "idle" | "saving" | "saved" | "error";

const DEFAULT_ACCESS: Access = {
  quote: "FREE",
  devotional: "FREE",
  verse: "FREE",
  prayer: "FREE",
  biblePlan: "FREE",
};

const TIERS: { value: Tier; label: string; description: string }[] = [
  { value: "FREE", label: "Grátis", description: "Qualquer leitor com conta" },
  { value: "SUBSCRIPTION", label: "Assinantes", description: "Só quem tem um plano ativo" },
  { value: "PAID_PATRON", label: "Assinantes ou compra", description: "Plano ativo ou compra avulsa" },
];

const CONTENT: { key: ContentKey; label: string; icon: LucideIcon }[] = [
  { key: "devotional", label: "Devocional", icon: BookOpen },
  { key: "verse", label: "Versículo", icon: ScrollText },
  { key: "prayer", label: "Oração", icon: HandHeart },
  { key: "quote", label: "Citação", icon: Quote },
  { key: "biblePlan", label: "Plano bíblico", icon: MapIcon },
];

function coerceAccess(raw: unknown): Partial<Access> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const tier = (v: unknown): Tier | undefined =>
    v === "FREE" || v === "SUBSCRIPTION" || v === "PAID_PATRON" ? v : typeof v === "boolean" ? (v ? "FREE" : "SUBSCRIPTION") : undefined;
  const result: Partial<Access> = {};
  for (const { key } of CONTENT) {
    const value = tier(o[key]);
    if (value) result[key] = value;
  }
  return result;
}

export const PainelControllerAccess = ({ writerId }: { writerId: string }) => {
  const [data, setData] = useState<Access>(DEFAULT_ACCESS);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const lastSaved = useRef<Access>(DEFAULT_ACCESS);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const resp = await fetch("/api/v1/writer/access", { cache: "no-store" });
      if (!resp.ok) throw new Error();
      const next = { ...DEFAULT_ACCESS, ...coerceAccess(await resp.json()) };
      lastSaved.current = next;
      setData(next);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, writerId]);

  const save = useCallback(async (next: Access) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSaveState("saving");
    try {
      const resp = await fetch("/api/v1/writer/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
        signal: ctrl.signal,
      });
      if (!resp.ok) throw new Error();
      lastSaved.current = next;
      setSaveState("saved");
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      setData(lastSaved.current);
      setSaveState("error");
    }
  }, []);

  const choose = (key: ContentKey, tier: Tier) => {
    if (data[key] === tier) return;
    const next = { ...data, [key]: tier };
    setData(next);
    void save(next);
  };

  return (
    <section aria-labelledby="access-title" className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h2 id="access-title" className="text-lg font-semibold tracking-tight text-[var(--liquid-ink)]">
            Acesso ao conteúdo diário
          </h2>
          <p className="text-sm text-[var(--liquid-muted)]">Escolha quem pode ler cada tipo de conteúdo.</p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]">
        {loading ? (
          <div className="divide-y divide-[var(--border)]">
            {CONTENT.map(({ key }) => (
              <div key={key} className="flex items-center gap-3 p-4">
                <div className="size-9 animate-pulse rounded-xl bg-[var(--muted)]" />
                <div className="h-4 w-28 animate-pulse rounded bg-[var(--muted)]" />
              </div>
            ))}
          </div>
        ) : loadFailed ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-red-800">
            Não foi possível carregar as regras de acesso.
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => void load()}>
              Tentar de novo
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {CONTENT.map(({ key, label, icon: Icon }) => (
              <li key={key} className="grid gap-3 p-4 md:grid-cols-[minmax(140px,1fr)_auto] md:items-center">
                <span className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-[var(--reader-gold)]">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span id={`access-${key}`} className="text-[15px] font-medium text-[var(--liquid-ink)]">
                    {label}
                  </span>
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby={`access-${key}`}
                  className="grid grid-cols-3 gap-1 rounded-full bg-[var(--muted)]/70 p-1"
                >
                  {TIERS.map((tier) => {
                    const selected = data[key] === tier.value;
                    return (
                      <button
                        key={tier.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        title={tier.description}
                        onClick={() => choose(key, tier.value)}
                        className={cn(
                          "h-9 rounded-full px-3 text-xs font-semibold leading-tight transition-all sm:text-[13px]",
                          selected
                            ? "bg-white text-[var(--liquid-ink)] shadow-sm dark:bg-white/15"
                            : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
                        )}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className="grid gap-2 px-1 text-[13px] leading-relaxed text-[var(--liquid-muted)] sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier.value}>
            <dt className="font-semibold text-[var(--liquid-ink)]">{tier.label}</dt>
            <dd>{tier.description}</dd>
          </div>
        ))}
      </dl>
      <p className="px-1 text-[13px] leading-relaxed text-[var(--liquid-muted)]">
        Para ebooks, o acesso é definido em cada publicação: grátis, venda avulsa ou somente assinantes.
      </p>
    </section>
  );
};

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const config = {
    saving: { icon: Loader2, text: "Salvando...", className: "text-[var(--liquid-muted)]", spin: true },
    saved: { icon: Check, text: "Salvo", className: "text-emerald-700 dark:text-emerald-400", spin: false },
    error: { icon: CloudOff, text: "Não foi possível salvar", className: "text-red-700", spin: false },
  }[state];
  const Icon = config.icon;
  return (
    <span role="status" className={cn("flex items-center gap-1.5 text-xs font-medium", config.className)}>
      <Icon className={cn("size-3.5", config.spin && "animate-spin")} aria-hidden />
      {config.text}
    </span>
  );
}

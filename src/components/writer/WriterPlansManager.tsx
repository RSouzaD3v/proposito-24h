"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Gift, Layers, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Interval = "DAY" | "WEEK" | "MONTH" | "YEAR" | "LIFETIME";

type Plan = {
  id: string;
  interval: Interval;
  amountCents: number;
  currency: string;
  trialDays: number;
  isReaderVisible: boolean;
  isActive: boolean;
  createdAt: string;
};

type FormState = { interval: Interval; price: string; trialDays: number; isReaderVisible: boolean };

const INTERVAL_LABEL: Record<Interval, string> = {
  DAY: "Diário",
  WEEK: "Semanal",
  MONTH: "Mensal",
  YEAR: "Anual",
  LIFETIME: "Vitalício",
};

const INTERVAL_SUFFIX: Record<Interval, string> = {
  DAY: "/dia",
  WEEK: "/semana",
  MONTH: "/mês",
  YEAR: "/ano",
  LIFETIME: "pagamento único",
};

// "Diário" é cobrado semanalmente pelos gateways, então não é oferecido para planos novos.
const INTERVAL_OPTIONS: { value: Interval; hint: string }[] = [
  { value: "MONTH", hint: "Cobrança todo mês" },
  { value: "YEAR", hint: "Cobrança uma vez por ano" },
  { value: "WEEK", hint: "Cobrança toda semana" },
  { value: "LIFETIME", hint: "Paga uma vez, acesso para sempre" },
];

const TRIAL_PRESETS = [0, 7, 14, 30];

const EMPTY_FORM: FormState = { interval: "MONTH", price: "19,90", trialDays: 7, isReaderVisible: true };

function money(cents: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  }
}

function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parsePrice(value: string): number | null {
  const normalized = value.replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

async function readError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    return typeof message === "string" && message ? message : fallback;
  } catch {
    return fallback;
  }
}

export default function WriterPlansManager() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/writer/plans", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setItems((await res.json()) as Plan[]);
      setLoadError(null);
    } catch {
      setLoadError("Não foi possível carregar seus planos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      interval: plan.interval,
      price: centsToInput(plan.amountCents),
      trialDays: plan.trialDays,
      isReaderVisible: plan.isReaderVisible,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    const amountCents = parsePrice(form.price);
    if (amountCents === null) return setFormError("Informe um preço válido, por exemplo 19,90.");
    if (amountCents < 100) return setFormError("O preço mínimo é R$ 1,00.");
    const trialDays = form.interval === "LIFETIME" ? 0 : form.trialDays;
    if (!Number.isInteger(trialDays) || trialDays < 0 || trialDays > 365) {
      return setFormError("O teste grátis deve ter entre 0 e 365 dias.");
    }

    setSaving(true);
    setFormError(null);
    try {
      const res = editing
        ? await fetch(`/api/v1/writer/plans/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountCents, interval: form.interval, trialDays }),
          })
        : await fetch("/api/v1/writer/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amountCents,
              currency: "BRL",
              interval: form.interval,
              trialDays,
              isReaderVisible: form.isReaderVisible,
            }),
          });
      if (!res.ok) throw new Error(await readError(res, "Não foi possível salvar o plano."));
      await load();
      setDialogOpen(false);
      toast.success(editing ? "Plano atualizado" : "Plano criado", {
        description: `${money(amountCents)} ${INTERVAL_SUFFIX[form.interval]}`,
      });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Não foi possível salvar o plano.");
    } finally {
      setSaving(false);
    }
  };

  const setFlag = async (plan: Plan, flag: "isActive" | "isReaderVisible", value: boolean) => {
    setRowError(null);
    setPendingIds((prev) => new Set(prev).add(plan.id));
    setItems((prev) => prev.map((p) => (p.id === plan.id ? { ...p, [flag]: value } : p)));
    try {
      const res = await fetch(`/api/v1/writer/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) => prev.map((p) => (p.id === plan.id ? { ...p, [flag]: !value } : p)));
      setRowError({ id: plan.id, message: "Não foi possível salvar. Tente novamente." });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(plan.id);
        return next;
      });
    }
  };

  const intervalOptions =
    editing?.interval === "DAY"
      ? [...INTERVAL_OPTIONS, { value: "DAY" as Interval, hint: "Cobrado semanalmente pelo gateway" }]
      : INTERVAL_OPTIONS;
  const previewCents = parsePrice(form.price);

  return (
    <section aria-labelledby="plans-title" className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h2 id="plans-title" className="text-lg font-semibold tracking-tight text-[var(--liquid-ink)]">
            Planos de assinatura
          </h2>
          <p className="text-sm text-[var(--liquid-muted)]">O que seus leitores veem na hora de assinar.</p>
        </div>
        {items.length > 0 && (
          <Button variant="glass-primary" className="h-10 rounded-full px-4" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Novo plano
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            Tentar de novo
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--reader-surface)] px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--reader-gold)]">
            <Layers className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-[var(--liquid-ink)]">Você ainda não tem planos</p>
            <p className="mt-1 max-w-sm text-sm text-[var(--liquid-muted)]">
              Crie um plano para que seus leitores possam assinar e acessar o conteúdo exclusivo.
            </p>
          </div>
          <Button variant="glass-primary" className="mt-1 h-10 rounded-full px-5" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Criar primeiro plano
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((plan) => {
            const pending = pendingIds.has(plan.id);
            return (
              <li
                key={plan.id}
                className={cn(
                  "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4 transition-opacity sm:p-5",
                  !plan.isActive && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="reader-eyebrow">{INTERVAL_LABEL[plan.interval]}</p>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-2xl font-semibold tracking-tight text-[var(--liquid-ink)]">
                        {money(plan.amountCents, plan.currency)}
                      </span>
                      <span className="text-sm text-[var(--liquid-muted)]">{INTERVAL_SUFFIX[plan.interval]}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusPill tone={plan.isActive ? "green" : "neutral"}>
                        {plan.isActive ? "Ativo" : "Desativado"}
                      </StatusPill>
                      {plan.isReaderVisible ? (
                        <StatusPill tone="blue">
                          <Eye className="size-3" aria-hidden /> Visível
                        </StatusPill>
                      ) : (
                        <StatusPill tone="neutral">
                          <EyeOff className="size-3" aria-hidden /> Oculto
                        </StatusPill>
                      )}
                      {plan.trialDays > 0 && (
                        <StatusPill tone="amber">
                          <Gift className="size-3" aria-hidden /> {plan.trialDays} dias grátis
                        </StatusPill>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 rounded-full px-3.5" onClick={() => openEdit(plan)}>
                    <Pencil className="size-3.5" aria-hidden />
                    Editar
                  </Button>
                </div>

                <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
                  <ToggleRow
                    id={`active-${plan.id}`}
                    label="Plano ativo"
                    hint="Desative para parar novas assinaturas"
                    checked={plan.isActive}
                    disabled={pending}
                    onChange={(value) => void setFlag(plan, "isActive", value)}
                  />
                  <ToggleRow
                    id={`visible-${plan.id}`}
                    label="Visível para leitores"
                    hint="Aparece na tela de assinatura"
                    checked={plan.isReaderVisible}
                    disabled={pending}
                    onChange={(value) => void setFlag(plan, "isReaderVisible", value)}
                  />
                </div>
                {rowError?.id === plan.id && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    {rowError.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto rounded-3xl p-6 sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl tracking-tight">{editing ? "Editar plano" : "Novo plano"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "As mudanças valem para novas assinaturas. Quem já assina mantém as condições atuais."
                : "Defina como e quanto seus leitores vão pagar."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium text-[var(--liquid-ink)]">Tipo de cobrança</legend>
              <div className="grid grid-cols-2 gap-2">
                {intervalOptions.map((option) => {
                  const selected = form.interval === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          interval: option.value,
                          trialDays: option.value === "LIFETIME" ? 0 : f.trialDays,
                        }))
                      }
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)]/8 ring-2 ring-[var(--liquid-accent)]/20"
                          : "border-[var(--border)] hover:bg-[var(--muted)]/60",
                      )}
                    >
                      <span className="block text-sm font-semibold text-[var(--liquid-ink)]">
                        {INTERVAL_LABEL[option.value]}
                      </span>
                      <span className="block text-xs text-[var(--liquid-muted)]">{option.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-2">
              <label htmlFor="plan-price" className="text-sm font-medium text-[var(--liquid-ink)]">
                Preço
              </label>
              <div className="flex h-12 items-center rounded-xl border border-[var(--border)] bg-white px-4 focus-within:border-[var(--liquid-accent)] focus-within:ring-4 focus-within:ring-[var(--liquid-accent)]/15 dark:bg-transparent">
                <span className="mr-2 text-sm font-medium text-[var(--liquid-muted)]">R$</span>
                <input
                  id="plan-price"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^\d.,]/g, "") }))}
                  className="h-full w-full bg-transparent text-lg font-semibold text-[var(--liquid-ink)] outline-none"
                />
                <span className="shrink-0 text-sm text-[var(--liquid-muted)]">{INTERVAL_SUFFIX[form.interval]}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <span id="plan-trial-label" className="text-sm font-medium text-[var(--liquid-ink)]">
                Teste grátis
              </span>
              {form.interval === "LIFETIME" ? (
                <p className="rounded-xl bg-[var(--muted)]/60 px-3 py-2.5 text-sm text-[var(--liquid-muted)]">
                  Planos vitalícios não têm período de teste.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="plan-trial-label">
                  {TRIAL_PRESETS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={form.trialDays === days}
                      onClick={() => setForm((f) => ({ ...f, trialDays: days }))}
                      className={cn(
                        "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                        form.trialDays === days
                          ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)] text-white"
                          : "border-[var(--border)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]/60",
                      )}
                    >
                      {days === 0 ? "Sem teste" : `${days} dias`}
                    </button>
                  ))}
                  <label className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--liquid-muted)] focus-within:border-[var(--liquid-accent)]">
                    <span className="sr-only">Outro número de dias</span>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      value={form.trialDays}
                      onChange={(e) => setForm((f) => ({ ...f, trialDays: e.target.valueAsNumber || 0 }))}
                      className="w-12 bg-transparent text-right font-medium text-[var(--liquid-ink)] outline-none"
                    />
                    dias
                  </label>
                </div>
              )}
            </div>

            {!editing && (
              <ToggleRow
                id="plan-visible"
                label="Visível para leitores"
                hint="Desligue para criar o plano sem mostrá-lo ainda"
                checked={form.isReaderVisible}
                onChange={(value) => setForm((f) => ({ ...f, isReaderVisible: value }))}
              />
            )}

            {previewCents !== null && previewCents >= 100 && (
              <p className="rounded-xl bg-[var(--muted)]/60 px-3 py-2.5 text-sm text-[var(--liquid-muted)]">
                O leitor verá:{" "}
                <strong className="font-semibold text-[var(--liquid-ink)]">
                  {money(previewCents)} {INTERVAL_SUFFIX[form.interval]}
                </strong>
                {form.interval !== "LIFETIME" && form.trialDays > 0 && ` após ${form.trialDays} dias grátis`}
              </p>
            )}

            {formError && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
                {formError}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full px-5"
                disabled={saving}
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="glass-primary" className="h-10 rounded-full px-5" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {editing ? "Salvar alterações" : "Criar plano"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StatusPill({ tone, children }: { tone: "green" | "blue" | "amber" | "neutral"; children: React.ReactNode }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    blue: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
    neutral: "bg-[var(--muted)] text-[var(--liquid-muted)]",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--muted)]/50"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--liquid-ink)]">{label}</span>
        <span className="block text-xs text-[var(--liquid-muted)]">{hint}</span>
      </span>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </label>
  );
}

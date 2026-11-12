"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  CircleAlert,
  CreditCard,
  Percent,
  Repeat,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMoney } from "@/components/subscriptions/billing";
import {
  bpsToPercentInput,
  commitmentTerms,
  cycleName,
  cyclePeriod,
  formatBps,
  percentToBps,
  providerName,
  WRITER_PLAN_INTERVALS,
  type WriterPlanInterval,
} from "@/components/subscriptions/writer-offer";
import { cn } from "@/lib/utils";
import { StatTile, SectionTitle } from "../_components/StatTile";
import { cents, INT, PCT } from "../_lib/format";

type Settings = {
  writerPlanProvider: string;
  writerPlanAmountCents: number;
  writerPlanInterval: WriterPlanInterval;
  writerPlanTrialDays: number;
  writerCommitmentMonths: number;
  writerEarlyCancelFeePct: number;
  defaultCommissionBps: number;
  allowPlatformCollection: boolean;
  updatedAt: string;
};

type Provider = { provider: string; requiresTaxId: boolean; hostedOnboarding: boolean };

type Snapshot = {
  writerPlans: { active: number; mrrCents: number };
  current: { platformFeeCents: number; grossCents: number };
};

/** Mesmo teto da API (MAX_COMMISSION_BPS). */
const MAX_COMMISSION_PCT = 50;

type Form = {
  writerPlanProvider: string;
  amount: string;
  writerPlanInterval: WriterPlanInterval;
  trialDays: string;
  commitmentMonths: string;
  feePct: string;
  commissionPct: string;
  allowPlatformCollection: boolean;
};

type Payload = {
  writerPlanProvider: string;
  writerPlanAmountCents: number;
  writerPlanInterval: WriterPlanInterval;
  writerPlanTrialDays: number;
  writerCommitmentMonths: number;
  writerEarlyCancelFeePct: number;
  defaultCommissionBps: number;
  allowPlatformCollection: boolean;
};

const toForm = (s: Settings): Form => ({
  writerPlanProvider: s.writerPlanProvider,
  amount: (s.writerPlanAmountCents / 100).toFixed(2).replace(".", ","),
  writerPlanInterval: s.writerPlanInterval,
  trialDays: String(s.writerPlanTrialDays),
  commitmentMonths: String(s.writerCommitmentMonths),
  feePct: String(s.writerEarlyCancelFeePct),
  commissionPct: bpsToPercentInput(s.defaultCommissionBps),
  allowPlatformCollection: s.allowPlatformCollection,
});

/** "1.234,56" ou "99.90" → centavos. */
function moneyToCents(value: string) {
  const clean = value.trim().replace(/\s|R\$/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
}

const intIn = (value: string, min: number, max: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/** Valida o formulário; devolve o payload ou a mensagem e o campo com problema. */
function validate(form: Form): { payload: Payload } | { error: string; field: keyof Form } {
  const amountCents = moneyToCents(form.amount);
  const trialDays = intIn(form.trialDays, 0, 365);
  const commitmentMonths = intIn(form.commitmentMonths, 0, 60);
  const feePct = intIn(form.feePct, 0, 100);
  const commissionBps = percentToBps(form.commissionPct);

  if (!(amountCents >= 100)) return { error: "O valor da mensalidade deve ser de pelo menos R$ 1,00.", field: "amount" };
  if (trialDays === null) return { error: "Dias de teste: use um número inteiro entre 0 e 365.", field: "trialDays" };
  if (commitmentMonths === null) return { error: "Meses de fidelidade: use um número inteiro entre 0 e 60.", field: "commitmentMonths" };
  if (feePct === null) return { error: "Multa: use um número inteiro entre 0 e 100.", field: "feePct" };
  if (commissionBps === null || commissionBps < 0 || commissionBps > MAX_COMMISSION_PCT * 100) {
    return { error: `Comissão padrão: use um valor entre 0% e ${MAX_COMMISSION_PCT}%.`, field: "commissionPct" };
  }
  return {
    payload: {
      writerPlanProvider: form.writerPlanProvider,
      writerPlanAmountCents: amountCents,
      writerPlanInterval: form.writerPlanInterval,
      writerPlanTrialDays: trialDays,
      writerCommitmentMonths: commitmentMonths,
      writerEarlyCancelFeePct: feePct,
      defaultCommissionBps: commissionBps,
      allowPlatformCollection: form.allowPlatformCollection,
    },
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Linhas "antes → depois" exibidas na revisão. */
function describeChanges(before: Settings, after: Payload) {
  const rows: { label: string; from: string; to: string }[] = [];
  const add = (label: string, from: string, to: string) => from !== to && rows.push({ label, from, to });
  add("Gateway", providerName(before.writerPlanProvider), providerName(after.writerPlanProvider));
  add("Valor", formatMoney(before.writerPlanAmountCents), formatMoney(after.writerPlanAmountCents));
  add("Ciclo", cycleName(before.writerPlanInterval), cycleName(after.writerPlanInterval));
  add("Teste grátis", plural(before.writerPlanTrialDays, "dia", "dias"), plural(after.writerPlanTrialDays, "dia", "dias"));
  add("Fidelidade", plural(before.writerCommitmentMonths, "mês", "meses"), plural(after.writerCommitmentMonths, "mês", "meses"));
  add("Multa", `${before.writerEarlyCancelFeePct}%`, `${after.writerEarlyCancelFeePct}%`);
  add("Comissão padrão", formatBps(before.defaultCommissionBps), formatBps(after.defaultCommissionBps));
  add(
    "Cobrança na conta da plataforma",
    before.allowPlatformCollection ? "Permitida" : "Bloqueada",
    after.allowPlatformCollection ? "Permitida" : "Bloqueada",
  );
  return rows;
}

function Field({
  id,
  label,
  hint,
  invalid,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[var(--liquid-ink)]">{label}</Label>
      {children}
      {hint && <p className={cn("text-xs", invalid ? "text-red-700" : "text-[var(--liquid-muted)]")}>{hint}</p>}
    </div>
  );
}

const inputClass = "border-white/70 bg-white/75 focus-visible:bg-white";

export default function AdminBillingPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<Payload | null>(null);
  const [invalidField, setInvalidField] = useState<keyof Form | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [simulation, setSimulation] = useState("49,90");

  useEffect(() => {
    fetch("/api/v1/admin/billing/settings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { settings: Settings; availableProviders: Provider[] };
        setSettings(data.settings);
        setProviders(data.availableProviders);
        setForm(toForm(data.settings));
      })
      .catch(() => setLoadError(true));
    // Contexto opcional: se falhar, a página continua funcionando sem os números.
    fetch("/api/v1/admin/overview?range=30d", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSnapshot(data as Snapshot))
      .catch(() => undefined);
  }, []);

  const dirty = useMemo(
    () => Boolean(form && settings && JSON.stringify(form) !== JSON.stringify(toForm(settings))),
    [form, settings],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (invalidField === key) setInvalidField(null);
    setMessage(null);
  };

  const openReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const result = validate(form);
    if ("error" in result) {
      setInvalidField(result.field);
      setMessage({ ok: false, text: result.error });
      document.getElementById(result.field)?.focus();
      return;
    }
    setReview(result.payload);
  };

  const save = async () => {
    if (!review) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/admin/billing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(text || "Não foi possível salvar.");
      }
      setSettings(data as Settings);
      setForm(toForm(data as Settings));
      setReview(null);
      setMessage({ ok: true, text: "Configurações salvas. Valem para os próximos contratos." });
    } catch (e) {
      setReview(null);
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Não foi possível salvar." });
    } finally {
      setSaving(false);
    }
  };

  const providerOptions =
    form && !providers.some((p) => p.provider === form.writerPlanProvider)
      ? [...providers.map((p) => p.provider), form.writerPlanProvider]
      : providers.map((p) => p.provider);
  const previewAmount = form ? moneyToCents(form.amount) : NaN;
  const commissionBps = form ? percentToBps(form.commissionPct) : null;
  const simulationCents = moneyToCents(simulation);
  const simulatedFee =
    Number.isFinite(simulationCents) && commissionBps !== null ? Math.round((simulationCents * commissionBps) / 10_000) : null;
  const changes = review && settings ? describeChanges(settings, review) : [];

  return (
    <section className="space-y-6 pb-24">
      <header className="animate-glass-in">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Pagamentos</h1>
        <p className="max-w-3xl text-sm text-[var(--liquid-muted)]">
          Regras comerciais da plataforma. As mudanças valem só para <b className="text-[var(--liquid-ink)]">novos contratos</b>:
          quem já assinou mantém o preço, a fidelidade e a multa contratados.
        </p>
      </header>

      {loadError ? (
        <GlassCard strong className="flex items-center gap-3 text-sm text-[var(--liquid-muted)]">
          <CircleAlert className="size-5 text-red-600" aria-hidden />
          Não foi possível carregar as configurações agora. Tente novamente em instantes.
        </GlassCard>
      ) : !form || !settings ? (
        <div className="grid gap-4" role="status" aria-label="Carregando">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-32 rounded-[var(--glass-radius)] bg-white/50" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-[var(--glass-radius)] bg-white/50" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatTile
              label="Mensalidade vigente"
              value={formatMoney(settings.writerPlanAmountCents)}
              icon={CreditCard}
              tone="blue"
              hint={`${cycleName(settings.writerPlanInterval)} · ${providerName(settings.writerPlanProvider)}`}
            />
            <StatTile
              label="Comissão padrão"
              value={formatBps(settings.defaultCommissionBps)}
              icon={Percent}
              tone="orange"
              hint={settings.allowPlatformCollection ? "repasse manual permitido" : "exige conta conectada"}
            />
            <StatTile
              label="MRR dos escritores"
              value={snapshot ? cents(snapshot.writerPlans.mrrCents) : "—"}
              icon={Repeat}
              tone="green"
              hint={snapshot ? `${INT.format(snapshot.writerPlans.active)} planos ativos` : "carregando…"}
              href="/admin/writer-subscriptions"
            />
            <StatTile
              label="Comissão retida (30d)"
              value={snapshot ? cents(snapshot.current.platformFeeCents) : "—"}
              icon={Wallet}
              tone="violet"
              hint={
                snapshot
                  ? `take rate ${PCT.format(snapshot.current.grossCents ? snapshot.current.platformFeeCents / snapshot.current.grossCents : 0)}`
                  : "carregando…"
              }
              href="/admin/analytics"
            />
          </div>

          <form id="billing-form" onSubmit={openReview} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="grid content-start gap-4 lg:col-span-2">
              <GlassCard strong>
                <SectionTitle
                  title="Mensalidade do escritor"
                  description="O que o escritor paga à plataforma. Alterações afetam apenas novas assinaturas."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="provider" label="Gateway de cobrança">
                    <Select value={form.writerPlanProvider} onValueChange={(value) => set("writerPlanProvider", value)}>
                      <SelectTrigger id="provider" className={cn("w-full", inputClass)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerOptions.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {providerName(provider)}
                            {!providers.some((p) => p.provider === provider) ? " (sem credenciais)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="amount" label="Valor (R$)" hint="Cobrado a cada ciclo. Mínimo R$ 1,00." invalid={invalidField === "amount"}>
                    <Input
                      id="amount"
                      inputMode="decimal"
                      aria-invalid={invalidField === "amount"}
                      className={inputClass}
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                    />
                  </Field>
                  <Field id="interval" label="Ciclo de cobrança">
                    <Select value={form.writerPlanInterval} onValueChange={(value) => set("writerPlanInterval", value as WriterPlanInterval)}>
                      <SelectTrigger id="interval" className={cn("w-full", inputClass)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WRITER_PLAN_INTERVALS.map((interval) => (
                          <SelectItem key={interval} value={interval}>
                            {cycleName(interval)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="trialDays" label="Dias de teste" hint="Só na primeira assinatura do escritor. 0 desativa." invalid={invalidField === "trialDays"}>
                    <Input
                      id="trialDays"
                      type="number"
                      min={0}
                      max={365}
                      aria-invalid={invalidField === "trialDays"}
                      className={inputClass}
                      value={form.trialDays}
                      onChange={(e) => set("trialDays", e.target.value)}
                    />
                  </Field>
                  <Field id="commitmentMonths" label="Meses de fidelidade" hint="0 = sem fidelidade." invalid={invalidField === "commitmentMonths"}>
                    <Input
                      id="commitmentMonths"
                      type="number"
                      min={0}
                      max={60}
                      aria-invalid={invalidField === "commitmentMonths"}
                      className={inputClass}
                      value={form.commitmentMonths}
                      onChange={(e) => set("commitmentMonths", e.target.value)}
                    />
                  </Field>
                  <Field
                    id="feePct"
                    label="Multa (% das parcelas restantes)"
                    hint="Cobrada ao cancelar antes do fim da fidelidade. 0 = sem multa."
                    invalid={invalidField === "feePct"}
                  >
                    <Input
                      id="feePct"
                      type="number"
                      min={0}
                      max={100}
                      aria-invalid={invalidField === "feePct"}
                      className={inputClass}
                      value={form.feePct}
                      onChange={(e) => set("feePct", e.target.value)}
                    />
                  </Field>
                </div>
              </GlassCard>

              <GlassCard strong>
                <SectionTitle
                  title="Vendas dos escritores"
                  description="Como a plataforma participa das vendas e assinaturas que os leitores pagam aos escritores."
                />
                <div className="grid gap-5">
                  <Field
                    id="commissionPct"
                    label="Comissão padrão (%)"
                    hint={`Retida de cada venda. Entre 0% e ${MAX_COMMISSION_PCT}%. Escritores com comissão própria (definida na página do escritor) não são afetados.`}
                    invalid={invalidField === "commissionPct"}
                  >
                    <Input
                      id="commissionPct"
                      inputMode="decimal"
                      aria-invalid={invalidField === "commissionPct"}
                      className={cn("sm:max-w-40", inputClass)}
                      value={form.commissionPct}
                      onChange={(e) => set("commissionPct", e.target.value)}
                    />
                  </Field>
                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/70 bg-white/55 p-4">
                    <div className="grid gap-1">
                      <Label htmlFor="platform-collection" className="leading-snug text-[var(--liquid-ink)]">
                        Permitir cobrança na conta da plataforma para escritores sem conta conectada (repasse manual)
                      </Label>
                      <p className="text-xs text-[var(--liquid-muted)]">
                        Ligado: escritores que ainda não conectaram Stripe ou Asaas continuam vendendo, e o valor entra na conta
                        Asaas da plataforma para repasse manual. Desligado: esses escritores não conseguem vender.
                      </p>
                    </div>
                    <Switch
                      id="platform-collection"
                      checked={form.allowPlatformCollection}
                      onCheckedChange={(checked) => set("allowPlatformCollection", checked)}
                    />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Coluna lateral: prévia e simulador */}
            <div className="grid content-start gap-4 lg:sticky lg:top-6 lg:self-start">
              <GlassCard strong className="overflow-hidden p-0">
                <div className="bg-gradient-to-br from-[#5b9cff] to-[#2b6de5] p-5 text-white">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
                    <Sparkles className="size-3.5" aria-hidden /> O que novos escritores verão
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {Number.isFinite(previewAmount) && previewAmount >= 100 ? formatMoney(previewAmount) : "—"}
                    <span className="text-base font-medium text-white/80"> /{cyclePeriod(form.writerPlanInterval)}</span>
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    Plano {cycleName(form.writerPlanInterval).toLowerCase()} via {providerName(form.writerPlanProvider)}
                  </p>
                </div>
                <ul className="grid gap-2.5 p-5 text-sm text-[var(--liquid-ink)]">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                    {Number(form.trialDays) > 0 ? `${form.trialDays} dias grátis na primeira assinatura` : "Sem período de teste"}
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2a78d6]" aria-hidden />
                    {commitmentTerms({
                      commitmentMonths: Number(form.commitmentMonths) || 0,
                      earlyCancelFeePct: Number(form.feePct) || 0,
                    })}
                  </li>
                  {Number.isFinite(previewAmount) && Number(form.commitmentMonths) > 0 && (
                    <li className="flex gap-2 text-[var(--liquid-muted)]">
                      <Repeat className="mt-0.5 size-4 shrink-0" aria-hidden />
                      Contrato mínimo de{" "}
                      {formatMoney(
                        previewAmount *
                          Math.ceil(Number(form.commitmentMonths) / ({ MONTH: 1, QUARTER: 3, SEMESTER: 6, YEAR: 12 }[form.writerPlanInterval] ?? 1)),
                      )}
                    </li>
                  )}
                </ul>
              </GlassCard>

              <GlassCard strong>
                <SectionTitle title="Simulador de comissão" description="Quanto fica com cada parte numa venda" />
                <Label htmlFor="simulation" className="text-xs text-[var(--liquid-muted)]">Valor da venda (R$)</Label>
                <div className="relative mt-1.5">
                  <Calculator className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
                  <Input
                    id="simulation"
                    inputMode="decimal"
                    className={cn("pl-9", inputClass)}
                    value={simulation}
                    onChange={(e) => setSimulation(e.target.value)}
                  />
                </div>
                {simulatedFee !== null && simulationCents > 0 ? (
                  <>
                    <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>
                      <div className="bg-[#1baf7a]" style={{ width: `${100 - (simulatedFee / simulationCents) * 100}%` }} />
                      <div className="bg-[#eb6834]" style={{ width: `${(simulatedFee / simulationCents) * 100}%` }} />
                    </div>
                    <dl className="mt-3 grid gap-1.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="flex items-center gap-2 text-[var(--liquid-muted)]">
                          <span className="size-2.5 rounded-full bg-[#1baf7a]" aria-hidden /> Escritor
                        </dt>
                        <dd className="font-semibold tabular-nums text-[var(--liquid-ink)]">{formatMoney(simulationCents - simulatedFee)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="flex items-center gap-2 text-[var(--liquid-muted)]">
                          <span className="size-2.5 rounded-full bg-[#eb6834]" aria-hidden /> Plataforma ({formatBps(commissionBps ?? 0)})
                        </dt>
                        <dd className="font-semibold tabular-nums text-[var(--liquid-ink)]">{formatMoney(simulatedFee)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-[11px] text-[var(--liquid-muted)]">Antes das taxas do gateway.</p>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-[var(--liquid-muted)]">Informe um valor e uma comissão válidos.</p>
                )}
              </GlassCard>

              <p className="px-1 text-xs text-[var(--liquid-muted)]">
                Última alteração: {new Date(settings.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </form>

          {message && !dirty && message.ok && (
            <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Check className="size-4" aria-hidden /> {message.text}
            </p>
          )}
          {message && !message.ok && !dirty && (
            <p role="alert" className="flex items-center gap-2 text-sm font-medium text-red-700">
              <CircleAlert className="size-4" aria-hidden /> {message.text}
            </p>
          )}

          {/* Barra de alterações pendentes */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-300 md:left-[264px]",
              dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
            )}
            aria-hidden={!dirty}
          >
            <div className="glass-surface-strong flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_12px_40px_rgb(15_40_80_/_0.18)]">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[var(--liquid-ink)]">
                {message && !message.ok ? (
                  <>
                    <CircleAlert className="size-4 shrink-0 text-red-600" aria-hidden />
                    <span role="alert" className="text-red-700">{message.text}</span>
                  </>
                ) : (
                  <>
                    <span className="size-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
                    Alterações não salvas
                  </>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                tabIndex={dirty ? 0 : -1}
                onClick={() => {
                  setForm(toForm(settings));
                  setInvalidField(null);
                  setMessage(null);
                }}
              >
                <RotateCcw className="size-4" /> Descartar
              </Button>
              <Button type="submit" form="billing-form" size="sm" variant="glass-primary" className="rounded-full" tabIndex={dirty ? 0 : -1}>
                Revisar e salvar <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={review !== null} onOpenChange={(open) => !open && !saving && setReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar alterações</DialogTitle>
            <DialogDescription>
              Valem para novos contratos. Escritores e leitores que já assinaram mantêm as condições atuais.
            </DialogDescription>
          </DialogHeader>
          {changes.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nenhuma alteração efetiva nos valores.</p>
          ) : (
            <ul className="grid gap-2">
              {changes.map((change) => (
                <li key={change.label} className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                  <p className="text-xs text-slate-500">{change.label}</p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500 line-through">{change.from}</span>
                    <ArrowRight className="size-3.5 text-slate-400" aria-hidden />
                    <span className="font-semibold text-slate-900">{change.to}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Voltar</Button>
            </DialogClose>
            <Button onClick={save} disabled={saving}>
              {saving && <ButtonSpinner />}
              {saving ? "Salvando…" : "Confirmar e salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

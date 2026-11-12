"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminBillingPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

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
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const amountCents = moneyToCents(form.amount);
    const trialDays = intIn(form.trialDays, 0, 365);
    const commitmentMonths = intIn(form.commitmentMonths, 0, 60);
    const feePct = intIn(form.feePct, 0, 100);
    const commissionBps = percentToBps(form.commissionPct);

    const invalid =
      !(amountCents >= 100)
        ? "O valor da mensalidade deve ser de pelo menos R$ 1,00."
        : trialDays === null
          ? "Dias de teste: use um número inteiro entre 0 e 365."
          : commitmentMonths === null
            ? "Meses de fidelidade: use um número inteiro entre 0 e 60."
            : feePct === null
              ? "Multa: use um número inteiro entre 0 e 100."
              : commissionBps === null || commissionBps < 0 || commissionBps > MAX_COMMISSION_PCT * 100
                ? `Comissão padrão: use um valor entre 0% e ${MAX_COMMISSION_PCT}%.`
                : null;
    if (invalid) {
      setMessage({ ok: false, text: invalid });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/admin/billing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writerPlanProvider: form.writerPlanProvider,
          writerPlanAmountCents: amountCents,
          writerPlanInterval: form.writerPlanInterval,
          writerPlanTrialDays: trialDays,
          writerCommitmentMonths: commitmentMonths,
          writerEarlyCancelFeePct: feePct,
          defaultCommissionBps: commissionBps,
          allowPlatformCollection: form.allowPlatformCollection,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(text || "Não foi possível salvar.");
      }
      setSettings(data as Settings);
      setForm(toForm(data as Settings));
      setMessage({ ok: true, text: "Configurações salvas. Valem para os próximos contratos." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Não foi possível salvar." });
    } finally {
      setSaving(false);
    }
  };

  const providerOptions = form && !providers.some((p) => p.provider === form.writerPlanProvider)
    ? [...providers.map((p) => p.provider), form.writerPlanProvider]
    : providers.map((p) => p.provider);
  const previewAmount = form ? moneyToCents(form.amount) : NaN;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">
          Regras comerciais da plataforma. As mudanças valem só para <b>novos contratos</b>: quem já assinou mantém o
          preço, a fidelidade e a multa contratados.
        </p>
      </div>

      {loadError ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Não foi possível carregar as configurações agora. Tente novamente em instantes.
          </CardContent>
        </Card>
      ) : !form || !settings ? (
        <div className="grid gap-4" role="status" aria-label="Carregando">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={save} className="grid max-w-3xl gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensalidade do escritor</CardTitle>
              <CardDescription>
                O que o escritor paga à plataforma. Alterações afetam apenas novas assinaturas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field id="provider" label="Gateway de cobrança">
                <Select value={form.writerPlanProvider} onValueChange={(value) => set("writerPlanProvider", value)}>
                  <SelectTrigger id="provider" className="w-full">
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
              <Field id="amount" label="Valor (R$)" hint="Cobrado a cada ciclo. Mínimo R$ 1,00.">
                <Input id="amount" inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </Field>
              <Field id="interval" label="Ciclo de cobrança">
                <Select value={form.writerPlanInterval} onValueChange={(value) => set("writerPlanInterval", value as WriterPlanInterval)}>
                  <SelectTrigger id="interval" className="w-full">
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
              <Field id="trial" label="Dias de teste" hint="Só na primeira assinatura do escritor. 0 desativa.">
                <Input id="trial" type="number" min={0} max={365} value={form.trialDays} onChange={(e) => set("trialDays", e.target.value)} />
              </Field>
              <Field id="commitment" label="Meses de fidelidade" hint="0 = sem fidelidade.">
                <Input
                  id="commitment"
                  type="number"
                  min={0}
                  max={60}
                  value={form.commitmentMonths}
                  onChange={(e) => set("commitmentMonths", e.target.value)}
                />
              </Field>
              <Field
                id="fee"
                label="Multa (% das parcelas restantes)"
                hint="Cobrada ao cancelar antes do fim da fidelidade. 0 = sem multa."
              >
                <Input id="fee" type="number" min={0} max={100} value={form.feePct} onChange={(e) => set("feePct", e.target.value)} />
              </Field>
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground sm:col-span-2">
                Novos escritores verão:{" "}
                <span className="font-medium text-foreground">
                  {Number.isFinite(previewAmount) ? formatMoney(previewAmount) : "—"} por {cyclePeriod(form.writerPlanInterval)}
                  {Number(form.trialDays) > 0 ? `, ${form.trialDays} dias grátis` : ""}.{" "}
                  {commitmentTerms({
                    commitmentMonths: Number(form.commitmentMonths) || 0,
                    earlyCancelFeePct: Number(form.feePct) || 0,
                  })}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas dos escritores</CardTitle>
              <CardDescription>
                Como a plataforma participa das vendas e assinaturas que os leitores pagam aos escritores.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <Field
                id="commission"
                label="Comissão padrão (%)"
                hint={`Retida de cada venda. Entre 0% e ${MAX_COMMISSION_PCT}%. Escritores com comissão própria (definida na página do escritor) não são afetados.`}
              >
                <Input
                  id="commission"
                  inputMode="decimal"
                  className="sm:max-w-40"
                  value={form.commissionPct}
                  onChange={(e) => set("commissionPct", e.target.value)}
                />
              </Field>
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="grid gap-1">
                  <Label htmlFor="platform-collection">
                    Permitir cobrança na conta da plataforma para escritores sem conta conectada (repasse manual)
                  </Label>
                  <p className="text-xs text-muted-foreground">
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
            </CardContent>
          </Card>

          {message && (
            <p
              role={message.ok ? "status" : "alert"}
              className={
                message.ok
                  ? "flex items-center gap-2 text-sm font-medium text-emerald-700"
                  : "flex items-center gap-2 text-sm font-medium text-red-700"
              }
            >
              {message.ok ? <Check className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
              {message.text}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving && <ButtonSpinner />}
              {saving ? "Salvando…" : "Salvar configurações"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Última alteração: {new Date(settings.updatedAt).toLocaleString("pt-BR")} · comissão padrão atual{" "}
              {formatBps(settings.defaultCommissionBps)}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, LockKeyhole } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";
import {
  formatCpfCnpj,
  formatMoney,
  isValidCpfCnpj,
  paymentErrorMessage,
  planName,
  planPeriod,
  type Plan,
} from "./billing";

type Status = { isActive: boolean };

const cardClass = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";

function PlanOption({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  const period = planPeriod(plan);
  return (
    <label
      className={cn(
        cardClass,
        "relative flex cursor-pointer items-center gap-4 p-4 transition",
        selected
          ? "border-[var(--liquid-accent)] ring-2 ring-[var(--liquid-accent)]/25"
          : "hover:border-[var(--liquid-muted)]/50",
      )}
    >
      <input type="radio" name="plan" checked={selected} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
          selected ? "border-[var(--liquid-accent)] bg-[var(--liquid-accent)]" : "border-[var(--input)]",
        )}
      >
        {selected && <Check className="size-3 text-[var(--liquid-on-accent)]" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[var(--liquid-ink)]">{planName(plan)}</span>
        {plan.interval === "YEAR" && (
          <span className="block text-[13px] text-[var(--liquid-muted)]">
            Equivale a {formatMoney(Math.round(plan.amountCents / 12), plan.currency)} por mês
          </span>
        )}
        {plan.trialDays > 0 && plan.interval !== "LIFETIME" && (
          <span className="mt-1 inline-block rounded-full bg-[var(--reader-gold)]/15 px-2 py-0.5 text-[11px] font-bold text-[var(--reader-gold)]">
            {plan.trialDays} dias grátis
          </span>
        )}
      </span>
      <span className="text-right">
        <span className="reader-serif block text-xl leading-none text-[var(--liquid-ink)]">
          {formatMoney(plan.amountCents, plan.currency)}
        </span>
        <span className="text-xs text-[var(--liquid-muted)]">{period ? `por ${period}` : "pagamento único"}</span>
      </span>
    </label>
  );
}

function Summary({ plan }: { plan: Plan }) {
  const price = formatMoney(plan.amountCents, plan.currency);
  const lifetime = plan.interval === "LIFETIME";
  const rows = lifetime
    ? [["Pagamento único", price]]
    : [
        ...(plan.trialDays > 0 ? [["Teste grátis", `${plan.trialDays} dias`]] : []),
        [plan.trialDays > 0 ? "Depois do teste" : "Valor", `${price} por ${planPeriod(plan)}`],
      ];

  return (
    <div className="grid gap-2 rounded-2xl bg-[var(--muted)]/60 p-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <span className="text-[var(--liquid-muted)]">{label}</span>
          <span className="font-semibold text-[var(--liquid-ink)]">{value}</span>
        </div>
      ))}
      {!lifetime && (
        <p className="border-t border-[var(--border)] pt-2 text-[13px] text-[var(--liquid-muted)]">
          {plan.trialDays > 0 && "O teste grátis vale para a primeira assinatura. "}
          Renovação automática; cancele quando quiser.
        </p>
      )}
    </div>
  );
}

export default function SubscribeWidget({
  writerId,
  successUrl,
  cancelUrl,
}: {
  writerId: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [document, setDocument] = useState("");
  const [requiresTaxId, setRequiresTaxId] = useState(true);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [plansRes, statusRes, profileRes] = await Promise.all([
          fetch("/api/v1/reader/subscription-plans", { cache: "no-store" }),
          fetch("/api/v1/billing/subscription", { cache: "no-store" }),
          fetch("/api/v1/billing/profile", { cache: "no-store" }),
        ]);
        if (!plansRes.ok) throw new Error(String(plansRes.status));
        const list: Plan[] = await plansRes.json();
        const status: Status | null = statusRes.ok ? await statusRes.json() : null;
        const profile = profileRes.ok ? await profileRes.json().catch(() => null) : null;
        if (!mounted) return;
        const available = Array.isArray(list) ? list : [];
        setPlans(available);
        setSelected(available[0]?.id ?? null);
        setActive(!!status?.isActive);
        if (typeof profile?.cpfCnpj === "string") setDocument(formatCpfCnpj(profile.cpfCnpj));
        // Só alguns provedores exigem CPF/CNPJ; sem a informação, o campo continua sendo pedido.
        setRequiresTaxId(profile?.requiresTaxId !== false);
      } catch {
        if (mounted) setLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [writerId]);

  const plan = useMemo(() => plans.find((item) => item.id === selected) ?? null, [plans, selected]);
  const documentValid = !requiresTaxId || isValidCpfCnpj(document);

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!plan || !documentValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, successUrl, cancelUrl, ...(requiresTaxId ? { cpfCnpj: document } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(paymentErrorMessage(data));
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o pagamento.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-3" role="status" aria-label="Carregando planos">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <p className={cn(cardClass, "p-5 text-center text-sm text-[var(--liquid-muted)]")}>
        Não foi possível carregar os planos agora. Tente novamente em instantes.
      </p>
    );
  }

  if (active) {
    return (
      <div className={cn(cardClass, "flex flex-col items-center gap-3 p-6 text-center")}>
        <span className="grid size-11 place-items-center rounded-full bg-emerald-600/12 text-emerald-700 dark:text-emerald-300">
          <Check className="size-5" />
        </span>
        <p className="font-semibold text-[var(--liquid-ink)]">Sua assinatura está ativa</p>
        <Link
          href="/reader/area/subscription"
          className="text-sm font-semibold text-[var(--liquid-ink)] underline decoration-[var(--reader-gold)] underline-offset-4"
        >
          Gerenciar assinatura
        </Link>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <p className={cn(cardClass, "p-5 text-center text-sm text-[var(--liquid-muted)]")}>
        Este escritor ainda não tem planos de assinatura disponíveis.
      </p>
    );
  }

  const lifetime = plan?.interval === "LIFETIME";
  const cta = !plan
    ? "Escolha um plano"
    : lifetime
      ? `Pagar ${formatMoney(plan.amountCents, plan.currency)}`
      : plan.trialDays > 0
        ? `Começar teste de ${plan.trialDays} dias`
        : `Assinar por ${formatMoney(plan.amountCents, plan.currency)}/${planPeriod(plan)}`;

  return (
    <form onSubmit={subscribe} className="grid gap-6 text-left">
      <fieldset className="grid gap-3">
        <legend className="mb-3 text-[13px] font-semibold text-[var(--liquid-ink)]">
          {requiresTaxId ? "1. Escolha o plano" : "Escolha o plano"}
        </legend>
        <div role="radiogroup" className="grid gap-3">
          {plans.map((item) => (
            <PlanOption key={item.id} plan={item} selected={item.id === selected} onSelect={() => setSelected(item.id)} />
          ))}
        </div>
      </fieldset>

      {requiresTaxId && (
        <div className="grid gap-2">
          <label htmlFor="cpf-cnpj" className="text-[13px] font-semibold text-[var(--liquid-ink)]">
            2. CPF ou CNPJ do pagador
          </label>
          <input
            id="cpf-cnpj"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={document}
            onChange={(e) => setDocument(formatCpfCnpj(e.target.value))}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && !documentValid}
            aria-describedby="cpf-hint"
            className={cn(
              "h-12 w-full rounded-xl border bg-[var(--reader-surface)] px-4 text-base text-[var(--liquid-ink)] outline-none transition placeholder:text-[var(--liquid-muted)]/70 focus-visible:ring-[3px] md:text-[15px]",
              touched && !documentValid
                ? "border-red-500 focus-visible:ring-red-500/20"
                : "border-[var(--input)] focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[var(--liquid-accent)]/20",
            )}
          />
          <p id="cpf-hint" className={cn("text-[13px]", touched && !documentValid ? "text-red-700 dark:text-red-300" : "text-[var(--liquid-muted)]")}>
            {touched && !documentValid
              ? "Confira o número: o CPF tem 11 dígitos e o CNPJ, 14."
              : "Exigido para emitir a cobrança. Fica salvo para as próximas vezes."}
          </p>
        </div>
      )}

      {plan && <Summary plan={plan} />}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-600/20 bg-red-600/8 px-3.5 py-3 text-sm font-medium text-red-800 dark:text-red-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="grid gap-3">
        <button
          type="submit"
          disabled={!plan || submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--liquid-accent)] px-6 text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <ButtonSpinner /> Abrindo pagamento…
            </>
          ) : (
            cta
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--liquid-muted)]">
          <LockKeyhole className="size-3.5" aria-hidden />
          Você conclui o pagamento em um ambiente seguro de pagamento.
        </p>
      </div>
    </form>
  );
}

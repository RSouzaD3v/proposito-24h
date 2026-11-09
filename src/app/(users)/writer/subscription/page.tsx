"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Check, CircleAlert, LockKeyhole } from "lucide-react";
import { WriterShell } from "@/components/ui/writer-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { formatCpfCnpj, formatDate, formatMoney, isValidCpfCnpj } from "@/components/subscriptions/billing";
import { cyclePeriod, type WriterOverview } from "@/components/subscriptions/writer-offer";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "Plataforma com endereço, logo e cores próprios",
  "Devocionais, orações, versículos, frases e livros",
  "Assinaturas e vendas para leitores pelo Asaas",
  "Insights de leitura, leitores e receita",
];

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";
const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--liquid-accent)] px-6 text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95 disabled:opacity-60";

export default function WriterSubscriptionPage() {
  const [overview, setOverview] = useState<WriterOverview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [document, setDocument] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/billing/writer-subscription", { cache: "no-store" }),
      fetch("/api/v1/billing/profile", { cache: "no-store" }),
    ])
      .then(async ([overviewRes, profileRes]) => {
        if (!overviewRes.ok) throw new Error(String(overviewRes.status));
        setOverview(await overviewRes.json());
        const profile = profileRes.ok ? await profileRes.json().catch(() => null) : null;
        if (typeof profile?.cpfCnpj === "string") setDocument(formatCpfCnpj(profile.cpfCnpj));
      })
      .catch(() => setLoadError(true));
  }, []);

  const documentValid = isValidCpfCnpj(document);

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!documentValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/writer-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj: document }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.message || "Não foi possível abrir o pagamento.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o pagamento.");
      setSubmitting(false);
    }
  };

  return (
    <WriterShell maxWidth="lg">
      <p className="reader-eyebrow">Assinatura DevotionalApp</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">
        {overview?.active ? "Sua plataforma está ativa" : "Ative sua plataforma"}
      </h1>
      <p className="mt-2 mb-8 text-[15px] text-[var(--liquid-muted)]">
        {overview?.active
          ? "Você pode publicar e receber leitores normalmente."
          : "Publique seu conteúdo e receba seus leitores em um espaço com o seu nome."}
      </p>

      {loadError ? (
        <p className={cn(surface, "p-5 text-center text-sm text-[var(--liquid-muted)]")}>
          Não foi possível carregar sua assinatura agora. Tente novamente em instantes.
        </p>
      ) : !overview ? (
        <div className="grid gap-3" role="status" aria-label="Carregando">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : overview.active ? (
        <div className={cn(surface, "grid gap-4 p-6")}>
          <p className="flex items-center gap-2 font-semibold text-[var(--liquid-ink)]">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-600/12 text-emerald-700">
              <Check className="size-4" aria-hidden />
            </span>
            Assinatura ativa
          </p>
          {overview.activeUntil && (
            <p className="text-sm text-[var(--liquid-muted)]">
              Acesso garantido até <b className="text-[var(--liquid-ink)]">{formatDate(overview.activeUntil)}</b>. A renovação é
              automática.
            </p>
          )}
          <Link href="/writer/dashboard" className={cn(primaryButton, "w-full sm:w-fit")}>
            Ir para o painel
          </Link>
        </div>
      ) : (
        <form onSubmit={subscribe} className="grid gap-6">
          <section className={cn(surface, "p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--liquid-ink)]">Plano DevotionalApp</p>
                {overview.offer.trialDays > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-[var(--liquid-accent)]/12 px-2 py-0.5 text-[11px] font-bold text-[var(--liquid-accent)]">
                    {overview.offer.trialDays} dias grátis
                  </span>
                )}
              </div>
              <p className="text-right">
                <span className="block text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">
                  {formatMoney(overview.offer.amountCents)}
                </span>
                <span className="text-xs text-[var(--liquid-muted)]">por {cyclePeriod(overview.offer.cycle)}</span>
              </p>
            </div>
            <ul className="mt-5 grid gap-2.5 border-t border-[var(--border)] pt-5 text-sm text-[var(--liquid-ink)]">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--liquid-accent)]" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-2">
            <label htmlFor="writer-cpf" className="text-[13px] font-semibold text-[var(--liquid-ink)]">
              CPF ou CNPJ do responsável
            </label>
            <input
              id="writer-cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={document}
              onChange={(e) => setDocument(formatCpfCnpj(e.target.value))}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && !documentValid}
              aria-describedby="writer-cpf-hint"
              className={cn(
                "h-12 w-full rounded-xl border bg-[var(--reader-surface)] px-4 text-base text-[var(--liquid-ink)] outline-none transition placeholder:text-[var(--liquid-muted)]/70 focus-visible:ring-[3px] md:text-[15px]",
                touched && !documentValid
                  ? "border-red-500 focus-visible:ring-red-500/20"
                  : "border-[var(--input)] focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[var(--liquid-accent)]/20",
              )}
            />
            <p id="writer-cpf-hint" className={cn("text-[13px]", touched && !documentValid ? "text-red-700" : "text-[var(--liquid-muted)]")}>
              {touched && !documentValid
                ? "Confira o número: o CPF tem 11 dígitos e o CNPJ, 14."
                : "Exigido para emitir a cobrança. Fica salvo para as próximas vezes."}
            </p>
          </div>

          <div className="grid gap-2 rounded-2xl bg-[var(--muted)]/70 p-4 text-sm">
            {overview.offer.trialDays > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--liquid-muted)]">Teste grátis</span>
                <span className="font-semibold text-[var(--liquid-ink)]">{overview.offer.trialDays} dias</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-[var(--liquid-muted)]">{overview.offer.trialDays > 0 ? "Depois do teste" : "Valor"}</span>
              <span className="font-semibold text-[var(--liquid-ink)]">
                {formatMoney(overview.offer.amountCents)} por {cyclePeriod(overview.offer.cycle)}
              </span>
            </div>
            <p className="border-t border-[var(--border)] pt-2 text-[13px] text-[var(--liquid-muted)]">
              Renovação automática pelo Asaas.
            </p>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-600/20 bg-red-600/8 px-3.5 py-3 text-sm font-medium text-red-800">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <div className="grid gap-3">
            <button type="submit" disabled={submitting} className={primaryButton}>
              {submitting ? (
                <>
                  <ButtonSpinner /> Abrindo pagamento…
                </>
              ) : overview.offer.trialDays > 0 ? (
                `Começar teste de ${overview.offer.trialDays} dias`
              ) : (
                `Assinar por ${formatMoney(overview.offer.amountCents)}/${cyclePeriod(overview.offer.cycle)}`
              )}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--liquid-muted)]">
              <LockKeyhole className="size-3.5" aria-hidden />
              Você conclui o pagamento no ambiente seguro do Asaas.
            </p>
          </div>
        </form>
      )}

      <p className="mt-10 text-center text-sm text-[var(--liquid-muted)]">
        Entrou com a conta errada?{" "}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="font-semibold text-[var(--liquid-ink)] underline underline-offset-4"
        >
          Sair
        </button>
      </p>
    </WriterShell>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Check, CircleAlert, LockKeyhole, Wallet } from "lucide-react";
import { WriterShell } from "@/components/ui/writer-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { formatCpfCnpj, formatDate, formatMoney, isValidCpfCnpj, paymentErrorMessage } from "@/components/subscriptions/billing";
import {
  commitmentTerms,
  cycleName,
  cyclePeriod,
  providerName,
  type WriterCancelQuote,
  type WriterContract,
  type WriterOverview,
} from "@/components/subscriptions/writer-offer";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "Plataforma com endereço, logo e cores próprios",
  "Devocionais, orações, versículos, frases e livros",
  "Assinaturas e vendas para leitores, recebidas na sua conta",
  "Insights de leitura, leitores e receita",
];

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";
const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--liquid-accent)] px-6 text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95 disabled:opacity-60";
const dialogButton = "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60";

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-600/20 bg-red-600/8 px-3.5 py-3 text-sm font-medium text-red-800">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--liquid-muted)]">{label}</span>
      <span className="text-right font-semibold text-[var(--liquid-ink)]">{value}</span>
    </div>
  );
}

/** Termos travados no contrato do escritor. */
function ContractDetails({ contract, activeUntil }: { contract: WriterContract; activeUntil: string | null }) {
  const inCommitment = contract.commitmentEndsAt && new Date(contract.commitmentEndsAt) > new Date();
  return (
    <div className="grid gap-2 rounded-2xl bg-[var(--muted)]/70 p-4 text-sm">
      <Row label="Plano" value={`${cycleName(contract.interval)} · ${formatMoney(contract.amountCents)} por ${cyclePeriod(contract.interval)}`} />
      {contract.commitmentMonths > 0 && (
        <Row
          label="Fidelidade"
          value={
            contract.commitmentEndsAt
              ? `${contract.commitmentMonths} ${contract.commitmentMonths === 1 ? "mês" : "meses"} · até ${formatDate(contract.commitmentEndsAt)}`
              : `${contract.commitmentMonths} ${contract.commitmentMonths === 1 ? "mês" : "meses"}`
          }
        />
      )}
      {inCommitment && (
        <Row
          label="Multa por cancelamento antecipado"
          value={contract.earlyCancelFeePct > 0 ? `${contract.earlyCancelFeePct}% das parcelas restantes` : "Sem multa"}
        />
      )}
      {contract.canceledAt ? (
        <Row label="Renovação" value={`Cancelada em ${formatDate(contract.canceledAt)}`} />
      ) : (
        <Row label="Renovação" value={`Automática${contract.provider ? ` via ${providerName(contract.provider)}` : ""}`} />
      )}
      {contract.canceledAt && activeUntil && <Row label="Acesso até" value={formatDate(activeUntil)} />}
      <p className="border-t border-[var(--border)] pt-2 text-[13px] text-[var(--liquid-muted)]">
        O preço e as condições do seu contrato ficam garantidos mesmo se a oferta da plataforma mudar.
      </p>
    </div>
  );
}

function CancelDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [quote, setQuote] = useState<WriterCancelQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setQuote(null);
    setQuoteError(null);
    setError(null);
    fetch("/api/v1/billing/writer-subscription/cancel-quote", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(paymentErrorMessage(data, "Não foi possível calcular o cancelamento."));
        if (!cancelled) setQuote(data as WriterCancelQuote);
      })
      .catch((e) => {
        if (!cancelled) setQuoteError(e instanceof Error ? e.message : "Não foi possível calcular o cancelamento.");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/writer-subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptFee: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { feeUrl?: string | null };
      if (!res.ok) throw new Error(paymentErrorMessage(data, "Não foi possível cancelar a assinatura."));
      // A multa é paga no ambiente do provedor; ao voltar, a tela mostra o contrato cancelado.
      if (data.feeUrl) {
        window.location.href = data.feeUrl;
        return;
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível cancelar a assinatura.");
      setBusy(false);
    }
  };

  const hasFee = !!quote && quote.feeCents > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="rounded-3xl text-[var(--liquid-ink)] sm:max-w-md">
        <DialogTitle className="text-xl">Cancelar a assinatura?</DialogTitle>
        {quoteError ? (
          <DialogDescription asChild>
            <div>
              <ErrorNote>{quoteError}</ErrorNote>
            </div>
          </DialogDescription>
        ) : !quote ? (
          <div className="grid gap-2" role="status" aria-label="Calculando">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : (
          <>
            <DialogDescription className="text-[15px] text-[var(--liquid-muted)]">
              A renovação automática é cancelada
              {quote.accessUntil ? ` e você continua com acesso até ${formatDate(quote.accessUntil)}` : ""}.
            </DialogDescription>
            {quote.inCommitment && (
              <div className="grid gap-2 rounded-2xl bg-[var(--muted)]/70 p-4 text-sm">
                {quote.commitmentEndsAt && <Row label="Fidelidade até" value={formatDate(quote.commitmentEndsAt)} />}
                <Row label="Parcelas restantes" value={quote.remainingInstallments} />
                <Row label="Multa" value={hasFee ? formatMoney(quote.feeCents) : "Sem multa"} />
                {hasFee && (
                  <p className="border-t border-[var(--border)] pt-2 text-[13px] text-[var(--liquid-muted)]">
                    Ao confirmar, você será levado ao pagamento da multa.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className={cn(dialogButton, "border border-[var(--input)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]")}
          >
            Manter assinatura
          </button>
          <button
            type="button"
            disabled={busy || !quote}
            onClick={confirm}
            className={cn(dialogButton, "bg-red-600 text-white hover:bg-red-700")}
          >
            {busy && <ButtonSpinner />}
            {busy ? "Cancelando…" : hasFee ? `Cancelar e pagar ${formatMoney(quote.feeCents)}` : "Cancelar assinatura"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WriterSubscriptionPage() {
  const [overview, setOverview] = useState<WriterOverview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [document, setDocument] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const load = useCallback(() => {
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

  useEffect(load, [load]);

  const requiresTaxId = overview?.offer.requiresTaxId ?? false;
  const documentValid = !requiresTaxId || isValidCpfCnpj(document);

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
        body: JSON.stringify(requiresTaxId ? { cpfCnpj: document } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(paymentErrorMessage(data));
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o pagamento.");
      setSubmitting(false);
    }
  };

  const offer = overview?.offer;
  const contract = overview?.contract ?? null;
  // A API só devolve o contrato vigente (não cancelado); acesso ativo sem contrato = renovação já cancelada.
  const canceled = !!contract?.canceledAt || (!!overview?.active && !contract);

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
      ) : !overview || !offer ? (
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
            {canceled ? "Renovação cancelada" : "Assinatura ativa"}
          </p>
          {overview.activeUntil && (
            <p className="text-sm text-[var(--liquid-muted)]">
              Acesso garantido até <b className="text-[var(--liquid-ink)]">{formatDate(overview.activeUntil)}</b>.
              {canceled ? " Depois disso, a plataforma sai do ar para os leitores." : " A renovação é automática."}
            </p>
          )}
          {contract && <ContractDetails contract={contract} activeUntil={overview.activeUntil} />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/writer/dashboard" className={cn(primaryButton, "w-full sm:w-fit")}>
              Ir para o painel
            </Link>
            <Link
              href="/writer/payments"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--input)] px-5 text-sm font-semibold text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]"
            >
              <Wallet className="size-4" aria-hidden /> Recebimentos
            </Link>
          </div>
          {contract && !contract.canceledAt && (
            <button
              type="button"
              onClick={() => setCanceling(true)}
              className="w-fit text-sm font-semibold text-red-700 underline-offset-4 hover:underline"
            >
              Cancelar assinatura
            </button>
          )}
          <CancelDialog
            open={canceling}
            onOpenChange={setCanceling}
            onDone={() => {
              setCanceling(false);
              load();
            }}
          />
        </div>
      ) : (
        <form onSubmit={subscribe} className="grid gap-6">
          <section className={cn(surface, "p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--liquid-ink)]">Plano DevotionalApp · {cycleName(offer.interval)}</p>
                {offer.trialDays > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-[var(--liquid-accent)]/12 px-2 py-0.5 text-[11px] font-bold text-[var(--liquid-accent)]">
                    {offer.trialDays} dias grátis
                  </span>
                )}
              </div>
              <p className="text-right">
                <span className="block text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">
                  {formatMoney(offer.amountCents)}
                </span>
                <span className="text-xs text-[var(--liquid-muted)]">por {cyclePeriod(offer.interval)}</span>
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

          {requiresTaxId && (
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
          )}

          <div className="grid gap-2 rounded-2xl bg-[var(--muted)]/70 p-4 text-sm">
            {offer.trialDays > 0 && <Row label="Teste grátis" value={`${offer.trialDays} dias`} />}
            <Row
              label={offer.trialDays > 0 ? "Depois do teste" : "Valor"}
              value={`${formatMoney(offer.amountCents)} por ${cyclePeriod(offer.interval)}`}
            />
            <Row label="Fidelidade" value={offer.commitmentMonths > 0 ? `${offer.commitmentMonths} ${offer.commitmentMonths === 1 ? "mês" : "meses"}` : "Sem fidelidade"} />
            <p className="border-t border-[var(--border)] pt-2 text-[13px] text-[var(--liquid-muted)]">
              {commitmentTerms(offer)} Renovação automática{offer.provider ? ` via ${providerName(offer.provider)}` : ""}.
            </p>
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-3">
            <button type="submit" disabled={submitting} className={primaryButton}>
              {submitting ? (
                <>
                  <ButtonSpinner /> Abrindo pagamento…
                </>
              ) : offer.trialDays > 0 ? (
                `Começar teste de ${offer.trialDays} dias`
              ) : (
                `Assinar por ${formatMoney(offer.amountCents)}/${cyclePeriod(offer.interval)}`
              )}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--liquid-muted)]">
              <LockKeyhole className="size-3.5" aria-hidden />
              Você conclui o pagamento no ambiente seguro {offer.provider ? `do ${providerName(offer.provider)}` : "do provedor"}.
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

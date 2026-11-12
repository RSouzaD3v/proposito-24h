"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, ExternalLink, Info, RefreshCw, Wallet } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { WriterShell } from "@/components/ui/writer-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/components/subscriptions/billing";
import { formatBps, providerName } from "@/components/subscriptions/writer-offer";
import { cn } from "@/lib/utils";
import { AsaasConnectDialog } from "./AsaasConnectDialog";
import { MonetizationSummary } from "./MonetizationSummary";
import { apiError, type AccountStatus, type Monetization, type PaymentAccount, type PaymentsOverview } from "./types";

type Notice = { tone: "success" | "error" | "info"; text: string };

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";
const button = "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60";
const primary = cn(button, "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)] hover:brightness-95");
const secondary = cn(button, "border border-[var(--input)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]");

const PROVIDER_INFO: Record<string, string> = {
  STRIPE: "Cartão de crédito. O cadastro é feito no site do Stripe e leva poucos minutos.",
  ASAAS: "Pix, boleto e cartão. Use sua conta Asaas ou crie uma agora.",
};

const STATUS: Record<AccountStatus, { label: string; tone: string }> = {
  ACTIVE: { label: "Ativa", tone: "bg-emerald-600/12 text-emerald-800" },
  PENDING: { label: "Cadastro pendente", tone: "bg-amber-500/15 text-amber-900" },
  RESTRICTED: { label: "Com pendências", tone: "bg-amber-500/15 text-amber-900" },
  DISABLED: { label: "Desativada", tone: "bg-red-600/10 text-red-800" },
};

function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const tone =
    notice.tone === "success"
      ? "border-emerald-600/20 bg-emerald-600/8 text-emerald-900"
      : notice.tone === "error"
        ? "border-red-600/20 bg-red-600/8 text-red-800"
        : "border-sky-600/20 bg-sky-600/8 text-sky-900";
  const Icon = notice.tone === "success" ? Check : notice.tone === "error" ? CircleAlert : Info;
  return (
    <div role={notice.tone === "error" ? "alert" : "status"} className={cn("mb-6 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium", tone)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="flex-1">{notice.text}</p>
      <button type="button" onClick={onClose} className="text-xs font-semibold underline underline-offset-4">
        Fechar
      </button>
    </div>
  );
}

export function WriterPayments({
  returnProvider,
  returnDone,
  returnRetry,
  plansHref,
}: {
  returnProvider: string | null;
  returnDone: boolean;
  returnRetry: boolean;
  plansHref: string | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<Monetization | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [asaasOpen, setAsaasOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const handledReturn = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/writer/payments/monetization", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    setData((await res.json()) as Monetization);
    setLoadError(false);
  }, []);

  useEffect(() => {
    if (handledReturn.current) return;
    handledReturn.current = true;
    (async () => {
      const provider = returnProvider?.toUpperCase() ?? null;
      if (provider && returnDone) {
        // Volta do cadastro no provedor: consulta o status real da conta antes de mostrar a tela.
        try {
          const res = await fetch(`/api/v1/writer/payments/${provider.toLowerCase()}/refresh`, { method: "POST" });
          if (!res.ok) throw new Error(await apiError(res, "Não foi possível atualizar o status da conta."));
          const overview = (await res.json()) as PaymentsOverview;
          const account = overview.accounts.find((item) => item.provider === provider);
          setNotice(
            account?.status === "ACTIVE"
              ? { tone: "success", text: `Conta ${providerName(provider)} conectada. Você já pode receber dos seus leitores.` }
              : { tone: "info", text: `Recebemos seu cadastro no ${providerName(provider)}. Assim que ele for aprovado, a conta fica ativa.` },
          );
        } catch (e) {
          setNotice({ tone: "error", text: e instanceof Error ? e.message : "Não foi possível atualizar o status da conta." });
        }
      } else if (provider && returnRetry) {
        setNotice({
          tone: "info",
          text: `O link de cadastro do ${providerName(provider)} expirou. Clique em "Continuar cadastro" para tentar de novo.`,
        });
      }
      if (provider) router.replace("/writer/payments", { scroll: false });
      await load().catch(() => setLoadError(true));
    })();
  }, [load, returnDone, returnProvider, returnRetry, router]);

  /** Executa uma ação e recarrega o resumo (o que está pronto para vender pode mudar). */
  const run = async (key: string, action: () => Promise<Notice | null | void>) => {
    setBusy(key);
    setNotice(null);
    try {
      const result = await action();
      await load().catch(() => setLoadError(true));
      if (result) setNotice(result);
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : "Não foi possível concluir." });
    } finally {
      setBusy(null);
    }
  };

  const connectHosted = (provider: string) =>
    run(`${provider}:connect`, async () => {
      const res = await fetch(`/api/v1/writer/payments/${provider.toLowerCase()}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await apiError(res, "Não foi possível iniciar a conexão."));
      const result = (await res.json()) as { status: AccountStatus; onboardingUrl: string | null };
      if (result.onboardingUrl) {
        window.location.href = result.onboardingUrl;
        // Mantém o botão ocupado enquanto o navegador sai da página.
        await new Promise(() => undefined);
      }
      return { tone: "success", text: `Conta ${providerName(provider)} conectada.` };
    });

  const refresh = (provider: string) =>
    run(`${provider}:refresh`, async () => {
      const res = await fetch(`/api/v1/writer/payments/${provider.toLowerCase()}/refresh`, { method: "POST" });
      if (!res.ok) throw new Error(await apiError(res, "Não foi possível atualizar o status."));
      return { tone: "info", text: "Status atualizado." };
    });

  const receiveWith = (provider: string) =>
    run(`${provider}:reader`, async () => {
      const res = await fetch("/api/v1/writer/payments/reader-provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Não foi possível alterar a conta de recebimento."));
      return { tone: "success", text: `As próximas vendas serão recebidas pelo ${providerName(provider)}.` };
    });

  const disconnect = async (provider: string) => {
    await run(`${provider}:disconnect`, async () => {
      const res = await fetch(`/api/v1/writer/payments/${provider.toLowerCase()}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiError(res, "Não foi possível desconectar a conta."));
      return { tone: "info", text: `Conta ${providerName(provider)} desconectada.` };
    });
    // Fecha também em caso de erro, para o aviso no topo da página ficar visível.
    setDisconnecting(null);
  };

  const payments = data?.payments;
  const accountOf = (provider: string): PaymentAccount | undefined =>
    payments?.accounts.find((account) => account.provider === provider);
  const providers = payments
    ? Array.from(new Set([...payments.availableProviders.map((p) => p.provider), ...payments.accounts.map((a) => a.provider)]))
    : [];
  const available = new Set(payments?.availableProviders.map((p) => p.provider) ?? []);
  const receivingViaPlatform = !!payments && !payments.readerPaymentProvider && !!data?.readyToSell;

  return (
    <WriterShell maxWidth="2xl">
      <BackButton href="/writer/settings" label="Configurações" className="mb-6" />
      <p className="reader-eyebrow">Recebimentos</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">Receba dos seus leitores</h1>
      <p className="mt-2 mb-8 text-[15px] text-[var(--liquid-muted)]">
        Conecte a conta em que o dinheiro das assinaturas e das vendas de livros vai cair.
      </p>

      {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

      {loadError ? (
        <p className={cn(surface, "p-5 text-center text-sm text-[var(--liquid-muted)]")}>
          Não foi possível carregar seus recebimentos agora. Tente novamente em instantes.
        </p>
      ) : !data || !payments ? (
        <div className="grid gap-3" role="status" aria-label="Carregando">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-8">
          {!data.readyToSell ? (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950">
              <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Seus leitores ainda não conseguem pagar</p>
                <p className="mt-1">
                  Conecte uma conta abaixo e conclua o cadastro. Até lá, assinaturas e compras de livros ficam indisponíveis
                  para os seus leitores.
                </p>
              </div>
            </div>
          ) : receivingViaPlatform ? (
            <div className="flex items-start gap-3 rounded-2xl border border-sky-600/20 bg-sky-600/8 p-4 text-sm text-sky-950">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p>
                Enquanto você não conecta uma conta, as vendas são recebidas pela plataforma e repassadas a você manualmente.
                Conecte sua conta para receber direto.
              </p>
            </div>
          ) : null}

          <section className={cn(surface, "flex flex-wrap items-center justify-between gap-3 p-5")}>
            <div>
              <p className="font-semibold text-[var(--liquid-ink)]">Comissão da plataforma</p>
              <p className="text-sm text-[var(--liquid-muted)]">Descontada de cada venda e assinatura dos seus leitores.</p>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">{formatBps(payments.commissionBps)}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--liquid-ink)]">Contas de recebimento</h2>
            {providers.length === 0 ? (
              <p className={cn(surface, "p-5 text-sm text-[var(--liquid-muted)]")}>
                Nenhum meio de recebimento está disponível no momento. Fale com o suporte.
              </p>
            ) : (
              <div className="grid gap-3">
                {providers.map((provider) => {
                  const account = accountOf(provider);
                  const status = account ? STATUS[account.status] : null;
                  const receiving = payments.readerPaymentProvider === provider;
                  const canConnect = available.has(provider);
                  const isBusy = (action: string) => busy === `${provider}:${action}`;
                  return (
                    <article key={provider} className={cn(surface, "grid gap-4 p-5", receiving && "border-[var(--liquid-accent)]")}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--liquid-ink)]">
                            <Wallet className="size-4 text-[var(--reader-gold)]" aria-hidden />
                            {providerName(provider)}
                            {status && <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", status.tone)}>{status.label}</span>}
                            {receiving && (
                              <span className="rounded-full bg-[var(--liquid-accent)]/12 px-2 py-0.5 text-[11px] font-bold text-[var(--liquid-accent)]">
                                Recebendo vendas
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm text-[var(--liquid-muted)]">
                            {account
                              ? `Conta ${account.destinationHint} · atualizada em ${formatDate(account.updatedAt)}`
                              : PROVIDER_INFO[provider] ?? "Receba os pagamentos dos seus leitores."}
                          </p>
                          {account && account.status !== "DISABLED" && (
                            <p className="mt-1 text-[13px] text-[var(--liquid-muted)]">
                              Cobranças {account.chargesEnabled ? "liberadas" : "pendentes"} · Saques{" "}
                              {account.payoutsEnabled ? "liberados" : "pendentes"}
                            </p>
                          )}
                          {!canConnect && account && (
                            <p className="mt-1 text-[13px] text-amber-800">Este meio de recebimento está indisponível no momento.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!account && canConnect && (
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => (provider === "ASAAS" ? setAsaasOpen(true) : connectHosted(provider))}
                            className={primary}
                          >
                            {isBusy("connect") && <ButtonSpinner />}
                            Conectar {providerName(provider)}
                            {provider !== "ASAAS" && <ExternalLink className="size-3.5" aria-hidden />}
                          </button>
                        )}
                        {account && account.status !== "ACTIVE" && canConnect && provider !== "ASAAS" && (
                          <button type="button" disabled={busy !== null} onClick={() => connectHosted(provider)} className={primary}>
                            {isBusy("connect") && <ButtonSpinner />}
                            Continuar cadastro
                            <ExternalLink className="size-3.5" aria-hidden />
                          </button>
                        )}
                        {account && account.status === "ACTIVE" && !receiving && (
                          <button type="button" disabled={busy !== null} onClick={() => receiveWith(provider)} className={primary}>
                            {isBusy("reader") && <ButtonSpinner />}
                            Receber vendas por esta conta
                          </button>
                        )}
                        {account && canConnect && (
                          <button type="button" disabled={busy !== null} onClick={() => refresh(provider)} className={secondary}>
                            {isBusy("refresh") ? <ButtonSpinner /> : <RefreshCw className="size-3.5" aria-hidden />}
                            Atualizar status
                          </button>
                        )}
                        {account && (
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => setDisconnecting(provider)}
                            className={cn(button, "text-red-700 hover:bg-red-600/8")}
                          >
                            Desconectar
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">Como seus leitores pagam</h2>
            <p className="mb-3 text-sm text-[var(--liquid-muted)]">
              Resumo do que é grátis e do que é pago. Use os links para editar cada item.
            </p>
            <MonetizationSummary data={data} plansHref={plansHref} />
          </section>
        </div>
      )}

      <AsaasConnectDialog
        open={asaasOpen}
        onOpenChange={setAsaasOpen}
        onConnected={(message) => {
          setAsaasOpen(false);
          setNotice({ tone: "success", text: message });
          load().catch(() => setLoadError(true));
        }}
      />

      <Dialog open={disconnecting !== null} onOpenChange={(open) => !open && busy === null && setDisconnecting(null)}>
        <DialogContent className="rounded-3xl text-[var(--liquid-ink)] sm:max-w-md">
          <DialogTitle className="text-xl">Desconectar {providerName(disconnecting)}?</DialogTitle>
          <DialogDescription className="text-[15px] text-[var(--liquid-muted)]">
            {disconnecting && payments?.readerPaymentProvider === disconnecting
              ? payments.platformCollectionFallback
                ? "Esta conta recebe suas vendas hoje. Depois de desconectar, as vendas passam a ser recebidas pela plataforma, com repasse manual."
                : "Esta conta recebe suas vendas hoje. Depois de desconectar, seus leitores não conseguirão pagar até você conectar outra conta."
              : "A conta deixa de ser usada pela plataforma. Os valores já recebidos continuam na sua conta."}
          </DialogDescription>
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" disabled={busy !== null} onClick={() => setDisconnecting(null)} className={secondary}>
              Voltar
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => disconnecting && disconnect(disconnecting)}
              className={cn(button, "bg-red-600 text-white hover:bg-red-700")}
            >
              {busy?.endsWith(":disconnect") && <ButtonSpinner />}
              Desconectar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WriterShell>
  );
}

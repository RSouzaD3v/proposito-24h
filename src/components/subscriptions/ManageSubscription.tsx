"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  writerId: string;
  status: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  isTrial?: boolean;
};

export default function ManageSubscription({
  writerId,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  isTrial,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const call = async (url: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro");
      if (data.accessUntil) {
        setMessage(
          `Cancelamento agendado. Você mantém acesso até ${new Date(data.accessUntil).toLocaleDateString("pt-BR")}.`
        );
        setTimeout(() => window.location.reload(), 1800);
        return;
      }
      window.location.reload();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Falha na operação.");
    } finally {
      setBusy(false);
    }
  };

  const periodEndFmt = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR")
    : null;

  const confirmCancel = () => {
    const text = isTrial
      ? "Encerrar o teste gratuito agora? Você perde o acesso aos conteúdos exclusivos."
      : periodEndFmt
        ? `Cancelar renovação? Você mantém acesso até ${periodEndFmt}.`
        : "Confirmar cancelamento da assinatura?";
    if (window.confirm(text)) {
      void call(`/api/reader-subscriptions/${writerId}/cancel`);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      {message ? (
        <p className="text-sm text-muted-foreground rounded-md bg-muted/50 px-3 py-2">{message}</p>
      ) : null}

      {cancelAtPeriodEnd ? (
        <p className="flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Cancelamento confirmado
            {periodEndFmt ? ` — acesso até ${periodEndFmt}` : ""}.
          </span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!cancelAtPeriodEnd && status !== "CANCELED" ? (
          <Button variant="destructive" size="sm" disabled={busy} onClick={confirmCancel}>
            Cancelar assinatura
          </Button>
        ) : null}

        {cancelAtPeriodEnd ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => call(`/api/reader-subscriptions/${writerId}/resume`)}
          >
            Manter assinatura
          </Button>
        ) : null}

        <Button variant="outline" size="sm" asChild>
          <Link href="/reader/account">Minha conta</Link>
        </Button>
      </div>
    </div>
  );
}

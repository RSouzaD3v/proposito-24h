"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "./billing";

type Props = {
  writerId: string;
  status: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  isTrial?: boolean;
};

const buttonBase = "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60";

export default function ManageSubscription({ status, cancelAtPeriodEnd, currentPeriodEnd, isTrial }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const periodEnd = currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

  const call = async (url: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Não foi possível concluir.");
      window.location.reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível concluir.");
      setBusy(false);
      setConfirming(false);
    }
  };

  const consequence = isTrial
    ? "O teste grátis termina agora e os conteúdos exclusivos ficam bloqueados."
    : periodEnd
      ? `A renovação é cancelada e você continua com acesso até ${periodEnd}.`
      : "A renovação automática será cancelada.";

  return (
    <div className="grid gap-3">
      {message && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {message}
        </p>
      )}

      {cancelAtPeriodEnd ? (
        <div className="flex flex-col gap-3 rounded-xl bg-amber-500/10 p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-amber-900 dark:text-amber-200">
            Renovação cancelada{periodEnd ? `. Acesso até ${periodEnd}.` : "."}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => call("/api/v1/billing/subscription/resume")}
            className={`${buttonBase} shrink-0 bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]`}
          >
            {busy ? "Reativando…" : "Manter assinatura"}
          </button>
        </div>
      ) : status !== "CANCELED" ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-fit text-sm font-semibold text-red-700 underline-offset-4 hover:underline dark:text-red-300"
        >
          {isTrial ? "Encerrar teste grátis" : "Cancelar assinatura"}
        </button>
      ) : null}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="reader-premium rounded-3xl bg-[var(--reader-bg)] text-[var(--liquid-ink)] sm:max-w-md">
          <DialogTitle className="text-xl">{isTrial ? "Encerrar o teste grátis?" : "Cancelar a assinatura?"}</DialogTitle>
          <DialogDescription className="text-[15px] text-[var(--liquid-muted)]">{consequence}</DialogDescription>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={`${buttonBase} border border-[var(--input)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]`}
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => call("/api/v1/billing/subscription/cancel")}
              className={`${buttonBase} bg-red-600 text-white hover:bg-red-700`}
            >
              {busy ? "Cancelando…" : isTrial ? "Encerrar teste" : "Cancelar assinatura"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

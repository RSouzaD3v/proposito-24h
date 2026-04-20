"use client";

import { useState } from "react";

type Props = {
  writerId: string;
  status: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
};

export default function ManageSubscription({
  writerId,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: Props) {
  const [busy, setBusy] = useState(false);

  const call = async (url: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro");
      window.location.reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Falha na operação.");
    } finally {
      setBusy(false);
    }
  };

  const openAccount = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro");
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Falha ao abrir área da conta.");
    } finally {
      setBusy(false);
    }
  };

  const periodEndFmt = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3">
      <div className="text-sm">
        <b>Status:</b> {status ?? "—"}
        {periodEndFmt ? ` • Próx. renovação: ${periodEndFmt}` : null}
        {cancelAtPeriodEnd ? " • Cancelará ao fim do período" : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {!cancelAtPeriodEnd && (
          <button
            disabled={busy}
            onClick={() => call(`/api/reader-subscriptions/${writerId}/cancel`)}
            className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
          >
            Cancelar assinatura
          </button>
        )}

        {cancelAtPeriodEnd && (
          <button
            disabled={busy}
            onClick={() => call(`/api/reader-subscriptions/${writerId}/resume`)}
            className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          >
            Retomar assinatura
          </button>
        )}

        <button
          disabled={busy}
          onClick={openAccount}
          className="px-3 py-2 rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-60"
        >
          Área da conta
        </button>
      </div>
    </div>
  );
}

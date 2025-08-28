"use client";

import { useState } from "react";

type Props = {
  writerId: string;
  status: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null; // ISO string
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
    } catch (e: any) {
      alert(e.message || "Falha na operação.");
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao abrir portal");
      window.location.href = data.url;
    } catch (e: any) {
      alert(e.message || "Falha ao abrir portal de cobrança.");
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

      <div className="flex gap-2">
        {!cancelAtPeriodEnd && (
          <button
            disabled={busy}
            onClick={() => call(`/api/reader-subscriptions/${writerId}/cancel`)}
            className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
          >
            Cancelar no fim do período
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
          onClick={openPortal}
          className="px-3 py-2 rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-60"
        >
          Abrir Portal de Pagamentos
        </button>
      </div>
    </div>
  );
}

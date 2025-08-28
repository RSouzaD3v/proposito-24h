"use client";

import { useEffect, useState } from "react";
import ManageSubscription from "./ManageSubscription";

type Item = {
  id: string;
  writerId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  priceId: string;
  writer: { id: string; name: string; slug: string | null; logoUrl: string | null };
};

export default function MySubscriptions() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/reader-subscriptions/me", { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) {
          const text = await res.text();
          throw new Error(text.slice(0, 140));
        }
        const data = await res.json();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message || "Falha ao carregar assinaturas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Carregando…</div>;
  if (err) return <div className="text-sm text-rose-600">Erro: {err}</div>;
  if (!items.length) return <div>Você ainda não possui assinaturas.</div>;

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <div key={s.id} className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            {s.writer.logoUrl ? (
              <img src={s.writer.logoUrl} alt={s.writer.name} className="w-10 h-10 rounded" />
            ) : null}
            <div className="font-medium">{s.writer.name}</div>
          </div>
          <ManageSubscription
            writerId={s.writerId}
            status={s.status}
            cancelAtPeriodEnd={s.cancelAtPeriodEnd}
            currentPeriodEnd={s.currentPeriodEnd}
          />
        </div>
      ))}
    </div>
  );
}

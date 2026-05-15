"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

import SubscriptionStatusCard from "./SubscriptionStatusCard";
import SubscribeWidget from "./SubscribeWidget";

type Item = {
  id: string;
  writerId: string;
  status: string;
  lifetime: boolean;
  isActive: boolean;
  isTrial?: boolean;
  statusLabel?: string;
  nextPaymentLabel?: string | null;
  daysUntilRenewal?: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  writer: { id: string; name: string; slug: string | null; logoUrl: string | null };
};

export default function MySubscriptions({ writerId }: { writerId?: string }) {
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
        setItems(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Falha ao carregar assinaturas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground text-sm">Carregando assinaturas…</p>;
  }

  if (err) {
    return <p className="text-sm text-destructive">Erro: {err}</p>;
  }

  const active = items.filter((s) => s.isActive);
  const inactive = items.filter((s) => !s.isActive);

  return (
    <div className="space-y-8">
      {writerId && !active.length ? (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Comece com 7 dias grátis</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Teste o conteúdo exclusivo do escritor. Após o período de teste, a assinatura é renovada
            automaticamente conforme o plano escolhido.
          </p>
          <SubscribeWidget writerId={writerId} />
        </section>
      ) : null}

      {active.length > 0 ? (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            <CreditCard className="size-4" />
            Assinaturas ativas
          </h2>
          {active.map((s) => (
            <SubscriptionStatusCard
              key={s.id}
              writerId={s.writerId}
              writerName={s.writer.name}
              writerSlug={s.writer.slug}
              writerLogoUrl={s.writer.logoUrl}
              status={s.status}
              isActive={s.isActive}
              isTrial={s.isTrial}
              lifetime={s.lifetime}
              statusLabel={s.statusLabel}
              nextPaymentLabel={s.nextPaymentLabel}
              cancelAtPeriodEnd={s.cancelAtPeriodEnd}
              currentPeriodEnd={s.currentPeriodEnd}
            />
          ))}
        </section>
      ) : null}

      {!active.length && !writerId ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-2">Você ainda não possui assinaturas ativas.</p>
          <p className="text-sm text-muted-foreground">
            Acesse a vitrine do escritor para assinar e liberar conteúdos exclusivos.
          </p>
        </div>
      ) : null}

      {inactive.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Histórico
          </h2>
          {inactive.map((s) => (
            <SubscriptionStatusCard
              key={s.id}
              writerId={s.writerId}
              writerName={s.writer.name}
              writerSlug={s.writer.slug}
              writerLogoUrl={s.writer.logoUrl}
              status={s.status}
              isActive={false}
              statusLabel={s.statusLabel}
              showManage={false}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}


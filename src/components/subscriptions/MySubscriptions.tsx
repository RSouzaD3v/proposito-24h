"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionStatusCard from "./SubscriptionStatusCard";

type Item = {
  id: string;
  writerId: string;
  status: string;
  lifetime: boolean;
  isActive: boolean;
  isTrial?: boolean;
  statusLabel?: string;
  nextPaymentLabel?: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  writer: { id: string; name: string; slug: string | null; logoUrl: string | null };
};

export default function MySubscriptions({ writerSlug, writerName }: { writerSlug?: string; writerName?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/v1/billing/subscriptions", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3" role="status" aria-label="Carregando assinaturas">
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-5 text-center text-sm text-[var(--liquid-muted)]">
        Não foi possível carregar suas assinaturas agora. Tente novamente em instantes.
      </p>
    );
  }

  const active = items.filter((item) => item.isActive);
  const history = items.filter((item) => !item.isActive);

  return (
    <div className="grid gap-8">
      {active.length > 0 ? (
        <section className="grid gap-3">
          {active.map((item) => (
            <SubscriptionStatusCard
              key={item.id}
              writerId={item.writerId}
              writerName={item.writer.name}
              writerSlug={item.writer.slug}
              writerLogoUrl={item.writer.logoUrl}
              status={item.status}
              isActive
              isTrial={item.isTrial}
              lifetime={item.lifetime}
              statusLabel={item.statusLabel}
              nextPaymentLabel={item.nextPaymentLabel}
              cancelAtPeriodEnd={item.cancelAtPeriodEnd}
              currentPeriodEnd={item.currentPeriodEnd}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--input)] p-8 text-center">
          <p className="font-semibold text-[var(--liquid-ink)]">Você ainda não tem uma assinatura ativa</p>
          <p className="mt-1 text-sm text-[var(--liquid-muted)]">
            Assine para liberar os conteúdos exclusivos{writerName ? ` de ${writerName.trim()}` : ""}.
          </p>
          {writerSlug && (
            <Link
              href={`/reader/area/w/${writerSlug}`}
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-[var(--liquid-accent)] px-5 text-sm font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95"
            >
              Ver planos
            </Link>
          )}
        </div>
      )}

      {history.length > 0 && (
        <section className="grid gap-3">
          <h2 className="reader-eyebrow">Histórico</h2>
          {history.map((item) => (
            <SubscriptionStatusCard
              key={item.id}
              writerId={item.writerId}
              writerName={item.writer.name}
              writerSlug={active.length ? null : item.writer.slug}
              writerLogoUrl={item.writer.logoUrl}
              status={item.status}
              isActive={false}
              statusLabel={item.statusLabel}
              showManage={false}
            />
          ))}
        </section>
      )}
    </div>
  );
}

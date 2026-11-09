"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import { formatDate } from "./billing";
import ManageSubscription from "./ManageSubscription";

type Props = {
  writerId: string;
  writerName: string;
  writerSlug?: string | null;
  writerLogoUrl?: string | null;
  status: string;
  isActive: boolean;
  isTrial?: boolean;
  lifetime?: boolean;
  statusLabel?: string;
  nextPaymentLabel?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  showManage?: boolean;
};

export default function SubscriptionStatusCard({
  writerId,
  writerName,
  writerSlug,
  writerLogoUrl,
  status,
  isActive,
  isTrial,
  lifetime,
  statusLabel,
  nextPaymentLabel,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  showManage = true,
}: Props) {
  const name = writerName.trim();
  const badge = lifetime ? "Vitalício" : isTrial && isActive ? "Teste grátis" : (statusLabel ?? status);

  return (
    <article className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-5">
      <div className="flex items-center gap-3">
        {writerLogoUrl ? (
          <OptimizedImage src={writerLogoUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl object-contain" />
        ) : (
          <span className="reader-serif grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-xl">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="reader-serif truncate text-lg text-[var(--liquid-ink)]">{name}</p>
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold",
              isActive
                ? "bg-emerald-600/12 text-emerald-800 dark:text-emerald-300"
                : "bg-[var(--muted)] text-[var(--liquid-muted)]",
            )}
          >
            {badge}
          </span>
        </div>
      </div>

      {isActive && (nextPaymentLabel || currentPeriodEnd) && !cancelAtPeriodEnd && (
        <p className="flex items-start gap-2 text-sm text-[var(--liquid-muted)]">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {nextPaymentLabel && <span className="block font-medium text-[var(--liquid-ink)]">{nextPaymentLabel}</span>}
            {currentPeriodEnd && <span className="block">Período atual até {formatDate(currentPeriodEnd)}</span>}
          </span>
        </p>
      )}

      {!isActive && writerSlug && (
        <Link
          href={`/reader/area/w/${writerSlug}`}
          className="inline-flex h-10 w-fit items-center rounded-xl bg-[var(--liquid-accent)] px-4 text-sm font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95"
        >
          Assinar novamente
        </Link>
      )}

      {showManage && isActive && !lifetime && (
        <div className="border-t border-[var(--border)] pt-4">
          <ManageSubscription
            writerId={writerId}
            status={status}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            currentPeriodEnd={currentPeriodEnd ?? null}
            isTrial={isTrial}
          />
        </div>
      )}
    </article>
  );
}

import type { SubscriptionStatus } from "@prisma/client";

export type ReaderSubRecord = {
  status: SubscriptionStatus | string;
  currentPeriodEnd: Date | null;
  currentPeriodStart?: Date | null;
  lifetime: boolean;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: Date | null;
} | null;

const ACTIVE_STATUSES = new Set<SubscriptionStatus | string>(["ACTIVE", "TRIALING"]);

export function readerSubscriptionIsActive(
  sub: ReaderSubRecord,
  now = new Date()
): boolean {
  if (!sub) return false;
  if (sub.lifetime && sub.status === "ACTIVE") return true;

  const periodEnd = sub.currentPeriodEnd;
  const inGracePeriod =
    !!sub.cancelAtPeriodEnd && !!periodEnd && periodEnd > now;

  if (inGracePeriod) return true;

  if (!ACTIVE_STATUSES.has(sub.status)) return false;
  if (periodEnd && periodEnd <= now) return false;
  return true;
}

export function daysUntil(date: Date | null | undefined, now = new Date()): number | null {
  if (!date) return null;
  const ms = date.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatSubscriptionStatus(status: string | null): string {
  const map: Record<string, string> = {
    TRIALING: "Período de teste",
    ACTIVE: "Ativa",
    PAST_DUE: "Pagamento em atraso",
    CANCELED: "Cancelada",
    INCOMPLETE: "Aguardando pagamento",
    INCOMPLETE_EXPIRED: "Pagamento expirado",
    UNPAID: "Não paga",
    PAUSED: "Pausada",
  };
  return status ? map[status] ?? status : "—";
}

export function subscriptionSummary(sub: NonNullable<ReaderSubRecord> & {
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: Date | null;
}) {
  const now = new Date();
  const active = readerSubscriptionIsActive(sub, now);
  const daysLeft = daysUntil(sub.currentPeriodEnd, now);
  const isTrial = sub.status === "TRIALING" && active;

  return {
    isActive: active,
    isTrial,
    daysUntilRenewal: daysLeft,
    statusLabel: formatSubscriptionStatus(sub.status),
    nextPaymentLabel: isTrial
      ? daysLeft != null
        ? `${daysLeft} dia(s) restante(s) no teste`
        : "Período de teste"
      : daysLeft != null
        ? daysLeft === 0
          ? "Renovação hoje"
          : `Próximo pagamento em ${daysLeft} dia(s)`
        : null,
  };
}

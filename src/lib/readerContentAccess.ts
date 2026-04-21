export type ReaderAccessTier = "FREE" | "SUBSCRIPTION" | "PAID_PATRON";

type ReaderSubLite = {
  status: string;
  currentPeriodEnd: Date | null;
  lifetime: boolean;
} | null;

export function readerSubscriptionIsActive(
  sub: ReaderSubLite,
  now = new Date()
): boolean {
  if (!sub) return false;
  if (sub.lifetime && sub.status === "ACTIVE") return true;
  if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd <= now) return false;
  return true;
}

export function readerTierAllowsAccess(
  tier: ReaderAccessTier,
  ctx: {
    hasActiveSubscription: boolean;
    /** Pelo menos uma compra concluída com este escritor (ex.: ebook). */
    hasPatronPurchase: boolean;
    platformFreePlan: boolean;
  }
): boolean {
  if (ctx.platformFreePlan) return true;
  if (tier === "FREE") return true;
  if (tier === "SUBSCRIPTION") return ctx.hasActiveSubscription;
  if (tier === "PAID_PATRON") return ctx.hasActiveSubscription || ctx.hasPatronPurchase;
  return false;
}

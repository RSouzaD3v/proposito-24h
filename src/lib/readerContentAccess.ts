export type ReaderAccessTier = "FREE" | "SUBSCRIPTION" | "PAID_PATRON";

export {
  readerSubscriptionIsActive,
  daysUntil,
  formatSubscriptionStatus,
  subscriptionSummary,
} from "@/lib/readerSubscription";

export function readerTierAllowsAccess(
  tier: ReaderAccessTier,
  ctx: {
    hasActiveSubscription: boolean;
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

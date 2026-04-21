import { db } from "@/lib/db";
import {
  readerSubscriptionIsActive,
  readerTierAllowsAccess,
  type ReaderAccessTier,
} from "@/lib/readerContentAccess";

export type ReaderContentKind = "quote" | "devotional" | "verse" | "prayer" | "biblePlan";

export async function getReaderContentGate(
  writerId: string,
  readerUserId: string,
  kind: ReaderContentKind
) {
  const [access, subscription, patronPurchase, user] = await Promise.all([
    db.writerReaderAccess.findUnique({ where: { writerId } }),
    db.readerSubscription.findFirst({
      where: { writerId, readerId: readerUserId },
    }),
    db.purchase.findFirst({
      where: { userId: readerUserId, writerId, status: "SUCCESS" },
      select: { id: true },
    }),
    db.user.findUnique({
      where: { id: readerUserId },
      select: { freePlan: true },
    }),
  ]);

  const tier = (access?.[kind] as ReaderAccessTier | undefined) ?? ("FREE" as ReaderAccessTier);
  const hasActiveSubscription = readerSubscriptionIsActive(subscription);
  const hasPatronPurchase = !!patronPurchase;
  const allowed = readerTierAllowsAccess(tier, {
    hasActiveSubscription,
    hasPatronPurchase,
    platformFreePlan: !!user?.freePlan,
  });

  return { allowed, tier, hasActiveSubscription, hasPatronPurchase };
}

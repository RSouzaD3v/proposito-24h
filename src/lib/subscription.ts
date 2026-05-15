import { db } from "@/lib/db";
import { readerSubscriptionIsActive } from "@/lib/readerSubscription";

export async function hasActiveSubscription(readerId: string, writerId: string) {
  const sub = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId, writerId } },
    select: {
      status: true,
      currentPeriodEnd: true,
      lifetime: true,
      cancelAtPeriodEnd: true,
    },
  });
  return readerSubscriptionIsActive(sub);
}

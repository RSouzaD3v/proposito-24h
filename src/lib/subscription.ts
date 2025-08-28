import { db } from "@/lib/db";

export async function hasActiveSubscription(readerId: string, writerId: string) {
  const sub = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId, writerId } },
    select: { status: true, currentPeriodEnd: true },
  });
  if (!sub) return false;
  const now = new Date();
  return (
    (sub.status === "ACTIVE" || sub.status === "TRIALING") &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > now)
  );
}

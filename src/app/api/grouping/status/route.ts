import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const userGrouping = await db.userGroupingDaily.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  if (!userGrouping) {
    return NextResponse.json({
      hasActiveGrouping: false,
    });
  }

  const groupingId = userGrouping.groupingDailyId;

  // 🔹 Busca TODOS os conteúdos do grouping
  const [quotes, verses, devotionals, prayers] = await Promise.all([
    db.quote.findMany({
      where: { groupingDailies: { some: { id: groupingId } } },
      select: { id: true },
    }),
    db.verse.findMany({
      where: { groupingDailies: { some: { id: groupingId } } },
      select: { id: true },
    }),
    db.devotional.findMany({
      where: { groupingDailies: { some: { id: groupingId } } },
      select: { id: true },
    }),
    db.prayer.findMany({
      where: { groupingDailies: { some: { id: groupingId } } },
      select: { id: true },
    }),
  ]);

  // 🔹 Conclusões do usuário
  const [doneQuotes, doneVerses, doneDevotionals, donePrayers] =
    await Promise.all([
      db.userCompletationQuote.count({
        where: { userId, quoteId: { in: quotes.map(q => q.id) } },
      }),
      db.userCompletationVerse.count({
        where: { userId, verseId: { in: verses.map(v => v.id) } },
      }),
      db.userCompletationDevotional.count({
        where: {
          userId,
          devotionalId: { in: devotionals.map(d => d.id) },
        },
      }),
      db.userCompletationPrayer.count({
        where: { userId, prayerId: { in: prayers.map(p => p.id) } },
      }),
    ]);

  const isCompleted =
    doneQuotes === quotes.length &&
    doneVerses === verses.length &&
    doneDevotionals === devotionals.length &&
    donePrayers === prayers.length;

  return NextResponse.json({
    hasActiveGrouping: true,
    canComplete: isCompleted,
    groupingId: userGrouping.id,
  });
}

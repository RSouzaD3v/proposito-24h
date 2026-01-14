// /api/writer/daily/quote/new/route.ts
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { addDays, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TZ = process.env.APP_TZ || "America/Sao_Paulo";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nameAuthor, content, verse, imageUrl, date, referenceDay } = await req.json();

  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
  });
  if (!userWriter?.writerId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // --- janela de "hoje" na TZ desejada, usando API atual ---
  const now = new Date();
  // const localNow = toZonedTime(now, TZ);      // << API atual
  // const startLocal = startOfDay(localNow);
  // const endLocal = addDays(startLocal, 1);
  // const startUtc = fromZonedTime(startLocal, TZ); // << API atual
  // const endUtc = fromZonedTime(endLocal, TZ);

  // const existingQuoteToday = await db.quote.findFirst({
  //   where: {
  //     writerId: userWriter.writerId, // << bug fix
  //     createdAt: {
  //       gte: startUtc,
  //       lt: endUtc,
  //     },
  //   },
  // });

  // if (existingQuoteToday) {
  //   return NextResponse.json(
  //     { error: "Você já criou uma citação hoje." },
  //     { status: 400 }
  //   );
  // }

  // date (YYYY-MM-DD) → meia-noite local na TZ → UTC
  const createdAt =
    typeof date === "string" && date.length === 10
      ? fromZonedTime(`${date}T00:00:00`, TZ) // << API atual
      : now;

  const createQuote = await db.quote.create({
    data: {
      nameAuthor,
      content,
      verse,
      imageUrl,
      writerId: userWriter.writerId,
      referenceDay: Number(referenceDay),
      createdAt,
    },
  });

  return NextResponse.json({
    quote: createQuote,
    message: "Citação criada com sucesso!",
  });
}

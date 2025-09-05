// app/api/_diag/reader-area/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const report: any = {
    ok: true,
    session: null,
    user: null,
    checks: { tables: {}, queries: {} },
  };

  try {
    // 1) Sessão
    const session = await getServerSession(authOptions);
    report.session = !!session;
    if (!session) throw new Error("No session (NextAuth)");

    // 2) User + writerId
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, writerId: true },
    });
    report.user = user;
    if (!user?.writerId) throw new Error("User has no writerId");

    // 3) Tabelas existem?
    const tableNames = [
      "Verse",
      "Quote",
      "Devotional",
      "UserCompletationVerse",
      "UserCompletationQuote",
      "UserCompletationDevotional",
    ];

    for (const name of tableNames) {
      const rows = await db.$queryRawUnsafe<any[]>(
        `SELECT to_regclass('public."${name}"') AS reg`
      );
      report.checks.tables[name] = !!rows?.[0]?.reg;
    }

    // 4) Smoke queries do dia
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date();   end.setHours(23,59,59,999);

    try {
      const verse = await db.verse.findFirst({
        where: { writerId: user.writerId, createdAt: { gte: start, lte: end } },
        select: { id: true },
      });
      report.checks.queries.verse = verse ?? null;
    } catch (e: any) {
      report.checks.queries.verse = { error: e?.code || e?.message || String(e) };
    }

    try {
      const quote = await db.quote.findFirst({
        where: { writerId: user.writerId, createdAt: { gte: start, lte: end } },
        select: { id: true },
      });
      report.checks.queries.quote = quote ?? null;
    } catch (e: any) {
      report.checks.queries.quote = { error: e?.code || e?.message || String(e) };
    }

    try {
      const devo = await db.devotional.findFirst({
        where: { writerId: user.writerId, createdAt: { gte: start, lte: end } },
        select: { id: true },
      });
      report.checks.queries.devotional = devo ?? null;
    } catch (e: any) {
      report.checks.queries.devotional = { error: e?.code || e?.message || String(e) };
    }
  } catch (e: any) {
    report.ok = false;
    report.error = {
      name: e?.name,
      message: e?.message,
      code: e?.code,
      meta: e?.meta,
    };
    console.error("[DIAG:/reader-area]", e);
  }

  return NextResponse.json(report, { status: report.ok ? 200 : 500 });
}

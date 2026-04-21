import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertWriterAdmin } from "@/lib/authz";
import type { ReaderAccessTier } from "@/lib/readerContentAccess";

const TIERS: ReaderAccessTier[] = ["FREE", "SUBSCRIPTION", "PAID_PATRON"];

function parseTier(v: unknown): ReaderAccessTier | null {
  return typeof v === "string" && (TIERS as string[]).includes(v) ? (v as ReaderAccessTier) : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const { writerId } = await params;
  try {
    await assertWriterAdmin(writerId);
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const writer = await db.writer.findUnique({
    where: { id: writerId },
    include: {
      readerAccess: true,
    },
  });

  return NextResponse.json({
    quote: writer?.readerAccess?.quote ?? "FREE",
    devotional: writer?.readerAccess?.devotional ?? "FREE",
    verse: writer?.readerAccess?.verse ?? "FREE",
    prayer: writer?.readerAccess?.prayer ?? "FREE",
    biblePlan: writer?.readerAccess?.biblePlan ?? "FREE",
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const { writerId } = await params;
  try {
    await assertWriterAdmin(writerId);
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const quote = parseTier(body.quote);
  const devotional = parseTier(body.devotional);
  const verse = parseTier(body.verse);
  const prayer = parseTier(body.prayer);
  const biblePlan = parseTier(body.biblePlan);

  if (!quote || !devotional || !verse || !prayer || !biblePlan) {
    return NextResponse.json(
      { error: "Cada campo deve ser FREE, SUBSCRIPTION ou PAID_PATRON." },
      { status: 400 }
    );
  }

  const writer = await db.writer.findUnique({
    where: { id: writerId },
    include: {
      readerAccess: true,
    },
  });

  if (!writer) {
    return NextResponse.json({ error: "Writer not found" }, { status: 404 });
  }

  let readerAccess = writer.readerAccess;

  if (!readerAccess) {
    readerAccess = await db.writerReaderAccess.create({
      data: {
        writerId: writer.id,
        quote: "FREE",
        devotional: "FREE",
        verse: "FREE",
        prayer: "FREE",
        biblePlan: "FREE",
      },
    });
  }

  await db.writerReaderAccess.update({
    where: { id: readerAccess.id },
    data: {
      quote,
      devotional,
      verse,
      prayer,
      biblePlan,
    },
  });

  return NextResponse.json({ success: true });
}

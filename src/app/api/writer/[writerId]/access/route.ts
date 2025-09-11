import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string; planId: string }> }
) {
    const { writerId } = await params;

    const writer = await db.writer.findUnique({
        where: { id: writerId },
        include: {
            readerAccess: true,
        },
    });

    return NextResponse.json({         
        quote: writer?.readerAccess?.quote ?? true,
        devotional: writer?.readerAccess?.devotional ?? true,
        verse: writer?.readerAccess?.verse ?? true,
        prayer: writer?.readerAccess?.prayer ?? true,
        biblePlan: writer?.readerAccess?.biblePlan ?? true, 
    });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string; planId: string }> }
) {
    const { writerId } = await params;
    const body = await req.json();
    const { quote, devotional, verse, prayer, biblePlan } = body;

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
                quote: true,
                devotional: true,
                verse: true,
                prayer: true,
                biblePlan: true,
            },
        });
    }

    readerAccess.quote = quote;
    readerAccess.devotional = devotional;
    readerAccess.verse = verse;
    readerAccess.prayer = prayer;
    readerAccess.biblePlan = biblePlan;

    await db.writerReaderAccess.update({
        where: { id: readerAccess.id },
        data: readerAccess,
    });

    return NextResponse.json({ success: true });
}

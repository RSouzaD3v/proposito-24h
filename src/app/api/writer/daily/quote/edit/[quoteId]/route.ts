import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ quoteId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id,
        },
    });

    if (!userWriter || !userWriter.writerId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { quoteId } = await params;

    const quote = await db.quote.findUnique({
        where: {
            id: quoteId,
            writerId: userWriter.writerId,
        },
    });

    if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ quoteId: string }> }) {
    const session = await getServerSession(authOptions);
    const { nameAuthor, content, verse, imageUrl, date } = await req.json();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id,
        },
    });

    if (!userWriter || !userWriter.writerId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { quoteId } = await params;

    const quote = await db.quote.findUnique({
        where: {
            id: quoteId,
            writerId: userWriter.writerId,
        },
    });

    if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    await db.quote.update({
        where: {
            id: quoteId,
            writerId: userWriter.writerId,
        },
        data: {
            nameAuthor,
            content,
            verse,
            imageUrl,
            createdAt: date ? new Date(date + 'T00:00:00') : quote.createdAt,
        },
    });

    return NextResponse.json({ quote });
}
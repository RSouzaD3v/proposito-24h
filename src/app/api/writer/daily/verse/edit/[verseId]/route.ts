import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ verseId: string }> }) {
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

    const { verseId } = await params;

    const verse = await db.verse.findUnique({
        where: {
            id: verseId,
            writerId: userWriter.writerId,
        },
    });

    if (!verse) {
        return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    }

    return NextResponse.json({ verse });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ verseId: string }> }) {
    const session = await getServerSession(authOptions);
    const { content, reference } = await req.json();

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

    const { verseId } = await params;

    const verse = await db.verse.findUnique({
        where: {
            id: verseId,
            writerId: userWriter.writerId,
        },
    });

    if (!verse) {
        return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    }

    await db.verse.update({
        where: {
            id: verseId,
            writerId: userWriter.writerId,
        },
        data: {
            content,
            reference,
        },
    });

    return NextResponse.json({ verse });
}
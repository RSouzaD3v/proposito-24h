import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const { content, reference, imageUrl } = await req.json();

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

    const existingVerseToday = await db.verse.findFirst({
        where: {
            writerId: userWriter.id,
            createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        },
    });

    if (existingVerseToday) {
        return NextResponse.json({ error: "Você já criou uma passagem hoje." }, { status: 400 });
    }

    const createVerse = await db.verse.create({
        data: {
            content,
            reference,
            imageUrl,
            writerId: userWriter.writerId
        },
    });

    return NextResponse.json({ verse: createVerse, message: "Passagem criada com sucesso!" });
}
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const existingQuoteToday = await db.quote.findFirst({
        where: {
            writerId: userWriter.id,
            createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        },
    });

    if (existingQuoteToday) {
        return NextResponse.json({ error: "Você já criou uma citação hoje." }, { status: 400 });
    }

    const createQuote = await db.quote.create({
        data: {
            nameAuthor,
            content,
            verse,
            imageUrl,
            writerId: userWriter.writerId,
            createdAt: date ? new Date(date + 'T00:00:00') : new Date(),
        },
    });

    return NextResponse.json({ quote: createQuote, message: "Citação criada com sucesso!" });
}
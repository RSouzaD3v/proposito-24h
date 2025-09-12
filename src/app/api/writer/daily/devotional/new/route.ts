import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const { title, content, verse, imageUrl, date, audioUrl } = await req.json();

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

    const existingDevotionalToday = await db.devotional.findFirst({
        where: {
            writerId: userWriter.id,
            createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        },
    });

    if (existingDevotionalToday) {
        return NextResponse.json({ error: "Você já criou um devocional hoje." }, { status: 400 });
    }

    const createDevotional = await db.devotional.create({
        data: {
            title,
            content,
            verse,
            imageUrl,
            audioUrl,
            writerId: userWriter.writerId,
            createdAt: date ? new Date(date + "T12:00:00Z") : new Date(),
        },
    });

    return NextResponse.json({ devotional: createDevotional, message: "Devocional criado com sucesso!" });
}
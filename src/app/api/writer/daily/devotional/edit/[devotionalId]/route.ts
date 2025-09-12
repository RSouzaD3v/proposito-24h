import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ devotionalId: string }> }) {
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

    const { devotionalId } = await params;

    const devotional = await db.devotional.findUnique({
        where: {
            id: devotionalId,
            writerId: userWriter.writerId,
        },
    });

    if (!devotional) {
        return NextResponse.json({ error: "Devotional not found" }, { status: 404 });
    }

    return NextResponse.json({ devotional });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ devotionalId: string }> }) {
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

    const { devotionalId } = await params;

    const devotional = await db.devotional.findUnique({
        where: {
            id: devotionalId,
            writerId: userWriter.writerId,
        },
    });

    if (!devotional) {
        return NextResponse.json({ error: "Devotional not found" }, { status: 404 });
    }

    await db.devotional.update({
        where: {
            id: devotionalId,
            writerId: userWriter.writerId,
        },
        data: {
            title,
            content,
            verse,
            imageUrl,
            audioUrl,
            createdAt: date ? new Date(date + "T12:00:00Z") : devotional.createdAt,
        },
    });

    return NextResponse.json({ devotional });
}
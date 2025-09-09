import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ prayerId: string }> }) {
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

    const { prayerId } = await params;

    const prayer = await db.prayer.findUnique({
        where: {
            id: prayerId,
            writerId: userWriter.writerId,
        },
    });

    if (!prayer) {
        return NextResponse.json({ error: "Prayer not found" }, { status: 404 });
    }

    return NextResponse.json({ prayer });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ prayerId: string }> }) {
    const session = await getServerSession(authOptions);
    const { content, title, imageUrl, date } = await req.json();

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

    const { prayerId } = await params;

    const prayer = await db.prayer.findUnique({
        where: {
            id: prayerId,
            writerId: userWriter.writerId,
        },
    });

    if (!prayer) {
        return NextResponse.json({ error: "Prayer not found" }, { status: 404 });
    }

    await db.prayer.update({
        where: {
            id: prayerId,
            writerId: userWriter.writerId,
        },
        data: {
            content,
            title,
            imageUrl,
            createdAt: date ? new Date(date + "T12:00:00Z") : prayer.createdAt,
        },
    });

    return NextResponse.json({ prayer });
}
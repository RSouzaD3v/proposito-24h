import { authOptions } from "@/lib/authOption"
import { db } from "@/lib/db";
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, content } = await req.json();

    const newPrayer = await db.prayer.create({
        data: {
            title,
            content,
            userId: session.user.id
        }
    });

    return NextResponse.json(newPrayer);
};

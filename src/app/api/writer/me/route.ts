import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ user: null });
    };

    const user = await db.user.findUnique({
        where: {
            id: session.user.id,
            role: Role.WRITER_ADMIN
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    if (!user) {
        return NextResponse.json({ user: null }, { status: 404 });
    };

    return NextResponse.json({ user });
}

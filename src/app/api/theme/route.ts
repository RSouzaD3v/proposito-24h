import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: {
        writer: {
            select: {
                logoUrl:        true,
                colorPrimary:   true,
                colorSecondary: true
            }
        }
    }});

    if (!user) {
        return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify({ theme: user.writer }), { status: 200 });
}
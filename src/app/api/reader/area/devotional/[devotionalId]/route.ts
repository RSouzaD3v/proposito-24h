import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ devotionalId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Não autorizado", { status: 401 });
    }

    const { devotionalId } = await params;

    try {
        const existingDevotional = await db.devotional.findUnique({
            where: {
                id: devotionalId
            }
        });

        if (!existingDevotional) {
            return NextResponse.json("Devocional não encontrado", { status: 404 });
        }

        const userCompletationDevotionalExisting = await db.userCompletationDevotional.findFirst({
            where: {
                userId: session.user.id,
                devotionalId: existingDevotional.id
            }
        });

        if (userCompletationDevotionalExisting) {
            return NextResponse.json("Devocional já completado", { status: 400 });
        }

        const userCompletationDevotional = await db.userCompletationDevotional.create({
            data: {
                userId: session.user.id,
                devotionalId: existingDevotional.id
            }
        });

        return  NextResponse.json(userCompletationDevotional, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ prayerId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Não autorizado", { status: 401 });
    }

    const { prayerId } = await params;

    try {
        const existingPrayer = await db.prayer.findUnique({
            where: {
                id: prayerId
            }
        });

        if (!existingPrayer) {
            return NextResponse.json("Oração não encontrada", { status: 404 });
        }

        const userCompletationPrayerExisting = await db.userCompletationPrayer.findFirst({
            where: {
                userId: session.user.id,
                prayerId: existingPrayer.id
            }
        });

        if (userCompletationPrayerExisting) {
            return NextResponse.json("Oração já completada", { status: 400 });
        }

        const userCompletationPrayer = await db.userCompletationPrayer.create({
            data: {
                userId: session.user.id,
                prayerId: existingPrayer.id
            }
        });

        return  NextResponse.json(userCompletationPrayer, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}


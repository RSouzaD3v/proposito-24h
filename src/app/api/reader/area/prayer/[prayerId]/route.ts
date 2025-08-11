import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ prayerId: string }> }) {
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

        await db.prayer.delete({
            where: {
                id: prayerId
            }
        });

        return  NextResponse.json("Oração deletada com sucesso", { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}

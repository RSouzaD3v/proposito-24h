import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ verseId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Não autorizado", { status: 401 });
    }

    const { verseId } = await params;

    try {
        const existingVerse = await db.verse.findUnique({
            where: {
                id: verseId
            }
        });

        if (!existingVerse) {
            return NextResponse.json("Verso não encontrado", { status: 404 });
        }

        const userCompletationVerseExisting = await db.userCompletationVerse.findFirst({
            where: {
                userId: session.user.id,
                verseId: existingVerse.id
            }
        });

        if (userCompletationVerseExisting) {
            return NextResponse.json("Verso já completado", { status: 400 });
        }

        const userCompletationVerse = await db.userCompletationVerse.create({
            data: {
                userId: session.user.id,
                verseId: existingVerse.id
            }
        });

        return  NextResponse.json(userCompletationVerse, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}

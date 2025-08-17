import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ quoteId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json("Não autorizado", { status: 401 });
    }

    const { quoteId } = await params;

    try {
        const existingQuote = await db.quote.findUnique({
            where: {
                id: quoteId
            }
        });

        if (!existingQuote) {
            return NextResponse.json("Citação não encontrada", { status: 404 });
        }

        const userCompletationQuoteExisting = await db.userCompletationQuote.findFirst({
            where: {
                userId: session.user.id,
                quoteId: existingQuote.id
            }
        });

        if (userCompletationQuoteExisting) {
            return NextResponse.json("Citação já completada", { status: 400 });
        }

        const userCompletationQuote = await db.userCompletationQuote.create({
            data: {
                userId: session.user.id,
                quoteId: existingQuote.id
            }
        });

        return  NextResponse.json(userCompletationQuote, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}

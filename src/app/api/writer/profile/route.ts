import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const {  logoUrl, colorPrimary, colorSecondary, titleApp, titleHeader } = await req.json();

    if (!session) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id
        },
        select: {
            role: true,
            writer: true
        }
    });

    if (!userWriter?.writer) {
        return NextResponse.json({ error: "Perfil de escritor não encontrado." }, { status: 404 });
    }

    if (userWriter.role !== 'WRITER_ADMIN') {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    
    try {
        await db.writer.update({
            where: {
                id: userWriter.writer.id
            },
            data: {
                logoUrl,
                colorPrimary,
                colorSecondary,
                titleApp,
                titleHeader,
            }
        });

        return NextResponse.json({ message: "Perfil atualizado com sucesso." });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
    }
}
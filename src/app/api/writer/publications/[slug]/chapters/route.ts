import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session || !session.user.writerId || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    };

    const chapters = await db.chapter.findMany({
        where: {
            publication: {
                slug,
                writerId: session.user.writerId, // Garante que o writerId é do usuário autenticado
            }
        },
        orderBy: {
            order: 'asc'
        }
    });

    return NextResponse.json({ chapters });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session || !session.user.writerId || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { title, subtitle, coverUrl, content, order } = await req.json();

    if (!title || !content ) {
        return new Response("Missing title or content", { status: 400 });
    }

    try {
        const createdChapter = await db.chapter.create({
            data: {
                content,
                title,
                subtitle,
                coverUrl,
                order: Number(order) || 1,
                publication: {
                    connect: {
                        writerId_slug: {
                            writerId: session.user.writerId,
                            slug: slug
                        }
                    }
                }
            }
        });

        return NextResponse.json({ chapter: createdChapter });
    } catch (e) {
        console.log(e);
    }
}
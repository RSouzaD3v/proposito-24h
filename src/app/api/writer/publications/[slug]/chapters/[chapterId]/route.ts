import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; chapterId: string }> }) {
    const session = await getServerSession(authOptions);
    const { slug, chapterId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
        where: {
            id: chapterId,
            publication: {
                slug
            }
        }
    });

    if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; chapterId: string }> }) {
    const session = await getServerSession(authOptions);
    const { slug, chapterId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
        where: {
            id: chapterId,
            publication: {
                slug
            }
        }
    });

    if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const body = await req.json();
    const updatedChapter = await db.chapter.update({
        where: {
            id: chapterId
        },
        data: {
            title: body.title,
            subtitle: body.subtitle,
            content: body.content,
            coverUrl: body.coverUrl,
            order: typeof body.order === "number" ? body.order : 1
        }
    });

    return NextResponse.json({ chapter: updatedChapter });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ chapterId: string }> }) {
    const session = await getServerSession(authOptions);
    const { chapterId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
        where: {
            id: chapterId
        }
    });

    if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    await db.chapter.delete({
        where: {
            id: chapterId
        }
    });

    return NextResponse.json({ message: "Chapter deleted successfully" });
}
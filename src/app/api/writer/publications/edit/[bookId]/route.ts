import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
    const session = await getServerSession(authOptions);
    const { bookId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, tags, coverUrl, visibility, price, subtitle, status } = await req.json();

    if (!title || !description || !tags || !coverUrl || !visibility || !status) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const existingPublication = await db.publication.findUnique({
            where: { id: bookId }
        });

        if (!existingPublication) {
            return NextResponse.json({ error: "Publication not found" }, { status: 404 });
        }

        let tagsModified = tags;
        if(typeof tags === "string") {
            tagsModified = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
        }

        await db.publication.update({
            where: { id: bookId },
            data: {
                title,
                description,
                tags: tagsModified,
                coverUrl,
                visibility,
                price,
                subtitle,
                status
            }
        });
        return NextResponse.json({ message: "Publication updated successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update publication" }, { status: 500 });
    }

};

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
    const session = await getServerSession(authOptions);
    const { bookId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publication = await db.publication.findUnique({
        where: { id: bookId }
    });

    if (!publication) {
        return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    return NextResponse.json(publication);
}
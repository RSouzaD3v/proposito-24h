import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { writerAi } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { contents } = await req.json();

    if (!contents || typeof contents !== "string") {
        return new Response(JSON.stringify({ error: "Invalid input" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const response = await writerAi(contents);
        return NextResponse.json({ result: response });
    } catch (error) {
        console.error("Error generating content:", error);
        return NextResponse.json({ error: "Internal Server Error" });
    }
}
// app/api/teacher-bible-ai/route.ts
import { NextResponse } from "next/server";
// ajuste o caminho abaixo para onde sua função está salva
import { teacherBibleAi } from "@/lib/gemini"; 

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({ prompt: "" }));
    const text = await teacherBibleAi(
      prompt && typeof prompt === "string"
        ? prompt
        : "Explain about genesis in a few words"
    );
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "AI error" },
      { status: 500 }
    );
  }
}

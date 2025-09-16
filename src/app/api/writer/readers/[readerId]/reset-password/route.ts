import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: { readerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role as "ADMIN" | "WRITER_ADMIN" | "CLIENT" | undefined;
    const sessionWriterId = (session.user as any).writerId as string | undefined;

    if (role !== "ADMIN" && role !== "WRITER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { readerId } = params;
    const body = await req.json();
    const newPassword: string | undefined = body?.newPassword;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 400 });
    }

    const reader = await db.user.findUnique({ where: { id: readerId } });
    if (!reader) return NextResponse.json({ error: "Leitor não encontrado" }, { status: 404 });

    if (role === "WRITER_ADMIN") {
      if (!sessionWriterId || reader.writerId !== sessionWriterId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: readerId },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
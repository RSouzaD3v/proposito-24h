import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Parâmetros inválidos." }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ message: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ message: "A nova senha deve ser diferente da atual." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    if (!user.password) {
      // Conta criada via OAuth/SSO sem senha local
      return NextResponse.json(
        { message: "Sua conta não possui senha local. Use 'Esqueci minha senha' para definir uma." },
        { status: 400 }
      );
    }

    const ok = await compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ message: "Senha atual incorreta" }, { status: 401 });
    }

    const hashed = await hash(String(newPassword), 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    return NextResponse.json({ message: "Erro inesperado" }, { status: 500 });
  }
}

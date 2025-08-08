// /app/api/auth/register-writer/route.ts
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      writerName,
      slug,
      email,
      password,
      name,
      logoUrl,
      colorPrimary,
      colorSecondary,
    } = await req.json();

    if (!writerName || !slug || !email || !password) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    const existingWriter = await db.writer.findFirst({
      where: { OR: [{ slug }, { name: writerName }] },
    });
    if (existingWriter) {
      return NextResponse.json({ error: "Já existe um escritor com esse nome ou slug." }, { status: 409 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso." }, { status: 409 });
    }

    const writer = await db.writer.create({
      data: {
        name: writerName,
        slug,
        logoUrl,
        colorPrimary,
        colorSecondary,
        domains: {
          create: [{ host: `${slug}.seudominio.com`, isPrimary: true }],
        },
      },
    });

    const hashed = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: Role.WRITER_ADMIN,
        writerId: writer.id,
      },
    });

    return NextResponse.json({
      message: "Writer registrado com sucesso!",
      writer,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Erro ao registrar writer:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WRITER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    type,
    status,
    visibility,
    price,
    currency,
    slug,
    title,
    subtitle,
    description,
    coverUrl,
    body: content,
    tags,
  } = body;

  // garante que writerId existe
  if (!session.user.writerId) {
    return NextResponse.json({ error: "Writer não encontrado para este usuário" }, { status: 400 });
  }

  // evita slugs duplicados
  const publicationExists = await db.publication.findFirst({
    where: { slug },
  });

  if (publicationExists) {
    return NextResponse.json({ error: "Slug já está em uso" }, { status: 400 });
  }

  const newPublication = await db.publication.create({
    data: {
      writerId: session.user.writerId, // 🔹 aqui está o fix
      type,
      status,
      visibility,
      price,
      currency,
      slug,
      title,
      subtitle,
      description,
      coverUrl,
      body: content,
      tags,
    },
  });

  return NextResponse.json(newPublication, { status: 201 });
}

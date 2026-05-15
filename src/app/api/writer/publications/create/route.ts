import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { notifyNewBook } from "@/lib/push/send";

function assertPaidInputs(visibility: string, price?: number | null, currency?: string | null) {
  if (visibility !== "PAID") return;
  if (price == null) throw new Error("Informe o preço em centavos ou 0 para somente assinantes.");
  if (price < 0) throw new Error("Preço inválido.");
  if (price >= 1 && !currency) {
    throw new Error("Para venda avulsa, 'currency' é obrigatória (ex.: 'BRL').");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WRITER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.writerId) {
    return NextResponse.json({ error: "Writer não encontrado para este usuário" }, { status: 400 });
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
    isPdf,
    pdfUrl,
    category,
  } = body;

  const duplicate = await db.publication.findFirst({
    where: { writerId: session.user.writerId, slug },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json({ error: "Slug já está em uso neste writer" }, { status: 400 });
  }

  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userWriter || !userWriter.writerId) {
    return NextResponse.json({ error: "User não encontrado" }, { status: 404 });
  }

  const writer = await db.writer.findUnique({
    where: { id: userWriter.writerId },
    select: { id: true },
  });
  if (!writer) {
    return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
  }

  const created = await db.publication.create({
    data: {
      writerId: writer.id,
      type,
      status,
      visibility,
      price: price ?? null,
      currency: currency ?? null,
      slug,
      title,
      subtitle: subtitle ?? null,
      description: description ?? null,
      coverUrl: coverUrl ?? null,
      body: content ?? null,
      tags: Array.isArray(tags) ? tags : [],
      isPdf: isPdf ?? false,
      pdfUrl: pdfUrl ?? null,
      category: category ?? "Outros",
    },
  });

  await notifyNewBook(writer.id, { id: created.id, title: created.title, slug: created.slug });

  if (created.visibility !== "PAID") {
    return NextResponse.json({ publication: created }, { status: 201 });
  }

  try {
    assertPaidInputs(created.visibility, created.price, created.currency);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Validação" }, { status: 400 });
  }

  return NextResponse.json({ publication: created }, { status: 201 });
}

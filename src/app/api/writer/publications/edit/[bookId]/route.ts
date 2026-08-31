// app/api/writer/publications/[bookId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

function normalizeTags(tags: string | string[]) {
  if (Array.isArray(tags)) return tags.filter(Boolean).map((t) => t.trim());
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function assertPaidInputs(visibility: string, price?: number | null, currency?: string | null) {
  if (visibility !== "PAID") return;
  if (price == null) throw new Error("Informe o preço em centavos ou 0 para somente assinantes.");
  if (price < 0) throw new Error("Preço inválido.");
  if (price >= 1 && !currency) {
    throw new Error("Para venda avulsa, 'currency' é obrigatória (ex.: 'BRL').");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bookId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      tags,
      coverUrl,
      visibility,
      price,
      subtitle,
      status,
      isPdf,
      pdfUrl,
      currency: bodyCurrency,
      category,
      body: content,
    } = body ?? {};

    if (!title || !description || !coverUrl || !visibility || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        writer: { select: { id: true } },
      },
    });

    if (!me?.writer) {
      return NextResponse.json({ error: "User is not a writer" }, { status: 403 });
    }

    const existing = await db.publication.findUnique({
      where: { id: bookId },
      include: { writer: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }
    if (existing.writer?.id !== me.writer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currencyUpper = (bodyCurrency ?? existing.currency ?? "BRL").toUpperCase();
    const tagsNormalized = normalizeTags(tags);
    const isPdfBool = isPdf === true || isPdf === "true";

    const updated = await db.publication.update({
      where: { id: bookId },
      data: {
        title,
        description,
        tags: tagsNormalized,
        coverUrl,
        visibility,
        price,
        subtitle,
        status,
        isPdf: isPdfBool,
        pdfUrl: isPdfBool ? (pdfUrl || null) : null,
        body: content ?? null,
        currency: currencyUpper,
        category: category ?? "Outros",
      },
    });

    if (updated.visibility === "PAID" && (updated.price ?? 0) > 0) {
      try {
        assertPaidInputs(updated.visibility, updated.price, updated.currency);
      } catch (e: unknown) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Validação" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ publication: updated }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update publication" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { bookId } = await params;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publication = await db.publication.findUnique({
    where: { id: bookId },
  });

  if (!publication) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  return NextResponse.json(publication);
}

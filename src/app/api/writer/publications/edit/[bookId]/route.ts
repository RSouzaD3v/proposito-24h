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

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function parsePrice(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

    const titleFinal = (title ?? existing.title)?.trim();
    const visibilityFinal = visibility ?? existing.visibility;
    const statusFinal = status ?? existing.status;
    const descriptionFinal = description ?? existing.description ?? null;
    const coverUrlFinal = coverUrl || existing.coverUrl || null;
    const subtitleFinal = subtitle ?? existing.subtitle ?? null;
    const categoryFinal = category ?? existing.category ?? "Outros";
    const currencyUpper = (bodyCurrency ?? existing.currency ?? "BRL").toUpperCase();
    const tagsNormalized = normalizeTags(tags ?? existing.tags);
    const isPdfBool = parseBoolean(isPdf ?? existing.isPdf);
    const pdfUrlFinal = isPdfBool
      ? (pdfUrl || existing.pdfUrl || null)
      : null;
    const contentFinal = content ?? existing.body ?? null;

    if (!titleFinal) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }
    if (!visibilityFinal) {
      return NextResponse.json({ error: "Visibilidade é obrigatória" }, { status: 400 });
    }
    if (!statusFinal) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 });
    }

    const priceParsed = parsePrice(price);
    const priceFinal =
      visibilityFinal === "PAID"
        ? (priceParsed ?? existing.price ?? 0)
        : null;

    try {
      assertPaidInputs(visibilityFinal, priceFinal, currencyUpper);
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Validação" },
        { status: 400 }
      );
    }

    const updated = await db.publication.update({
      where: { id: bookId },
      data: {
        title: titleFinal,
        description: descriptionFinal,
        tags: tagsNormalized,
        coverUrl: coverUrlFinal,
        visibility: visibilityFinal,
        price: priceFinal,
        subtitle: subtitleFinal,
        status: statusFinal,
        isPdf: isPdfBool,
        pdfUrl: pdfUrlFinal,
        body: contentFinal,
        currency: currencyUpper,
        category: categoryFinal,
      },
    });

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

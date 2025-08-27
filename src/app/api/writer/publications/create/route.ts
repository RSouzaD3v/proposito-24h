import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { notifyNewBook } from "@/lib/push/send";

function assertPaidInputs(visibility: string, price?: number | null, currency?: string | null) {
  if (visibility !== "PAID") return;
  if (price == null || price < 1) throw new Error("Para conteúdo pago, 'price' (centavos) é obrigatório.");
  if (!currency) throw new Error("Para conteúdo pago, 'currency' é obrigatória (ex.: 'BRL').");
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
    type, status, visibility,
    price, currency,
    slug, title, subtitle, description,
    coverUrl, body: content, tags,
    isPdf, pdfUrl, category
  } = body;

  // slug único POR writer
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

  // pega writer (precisamos do stripeAccountId)
  const writer = await db.writer.findUnique({
    where: { id: userWriter.writerId },
    select: { id: true, stripeAccountId: true },
  });
  if (!writer) {
    return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
  }

  // 👉 exigimos conexão Stripe
  if (!writer.stripeAccountId) {
    return NextResponse.json(
      { error: "Conecte sua conta Stripe antes de criar produtos." },
      { status: 400 }
    );
  }

  // cria a publicação primeiro (sem IDs do Stripe)
  const created = await db.publication.create({
    data: {
      writerId: writer.id,
      type,
      status,
      visibility,
      price: price ?? null,        // centavos
      currency: currency ?? null,  // ex: "BRL"
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

  // se for FREE, retorna sem criar catálogo
  if (created.visibility !== "PAID") {
    return NextResponse.json({ publication: created }, { status: 201 });
  }

  // valida entradas de pago
  try {
    assertPaidInputs(created.visibility, created.price, created.currency);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const unit_amount = created.price!;                    // já em centavos
  const currencyLc = created.currency!.toLowerCase();   // "brl"
  const acct = writer.stripeAccountId;                  // <- CONTA CONECTADA

  // idempotência para evitar duplicação em retries
  const idemKey = `pub_${created.id}_create_product_v1`;

  try {
    // ✅ cria Product + Price NA CONTA DO WRITER (Stripe-Account header)
    const product = await stripe.products.create(
      {
        name: created.title,
        description: created.description || undefined,
        metadata: {
          publicationId: created.id,
          writerId: writer.id,
          type: created.type,
        },
        default_price_data: {
          currency: currencyLc,
          unit_amount,
          metadata: { publicationId: created.id, writerId: writer.id },
        },
      },
      {
        stripeAccount: acct,
        idempotencyKey: idemKey,
      }
    );

    const defaultPrice = (product as any).default_price as string | undefined;

    // fallback raríssimo: se não vier default_price, cria Price separado
    let priceId = defaultPrice;
    if (!priceId) {
      const priceObj = await stripe.prices.create(
        {
          currency: currencyLc,
          unit_amount,
          product: product.id,
          metadata: { publicationId: created.id, writerId: writer.id },
        },
        { stripeAccount: acct, idempotencyKey: `${idemKey}_price` }
      );
      priceId = priceObj.id;
    }

    // salva IDs (lembrando: pertencem à CONTA do writer)
    const updated = await db.publication.update({
      where: { id: created.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: priceId!,
        // se quiser publicar automaticamente:
        // status: "PUBLISHED",
        // publishedAt: new Date(),
      },
    });

    return NextResponse.json({ publication: updated }, { status: 201 });
  } catch (e: any) {
    console.error("Erro criando Product/Price no Stripe (connected):", e.message);
    // mantemos a publicação criada para você editar depois
    return NextResponse.json(
      { publication: created, stripeError: e.message },
      { status: 201 }
    );
  }
}

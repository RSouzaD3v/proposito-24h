import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { publicationId } = await req.json();

    // Busca publicação e writer
    const publication = await db.publication.findUnique({
      where: { id: publicationId },
      include: { writer: true },
    });

    if (!publication) {
      return NextResponse.json({ error: "Publicação não encontrada" }, { status: 404 });
    }

    if (publication.visibility !== "PAID" || !publication.price) {
      return NextResponse.json({ error: "Publicação não é paga ou sem preço" }, { status: 400 });
    }

    if (!publication.writer.stripeAccountId) {
      return NextResponse.json({ error: "Writer não possui conta Stripe conectada" }, { status: 400 });
    }

    // Criar produto no Stripe
    const product = await stripe.products.create({
      name: publication.title,
      description: publication.description ?? "",
      images: publication.coverUrl ? [publication.coverUrl] : [],
      metadata: {
        writerId: publication.writerId,
        publicationId: publication.id,
      },
    }, {
      stripeAccount: publication.writer.stripeAccountId,
    });

    // Criar preço
    const price = await stripe.prices.create({
      unit_amount: publication.price,
      currency: publication.currency ?? "brl",
      product: product.id,
    }, {
      stripeAccount: publication.writer.stripeAccountId,
    });

    // Atualizar no banco
    await db.publication.update({
      where: { id: publication.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
      },
    });

    return NextResponse.json({ product, price });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

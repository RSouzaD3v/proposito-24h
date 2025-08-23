// app/api/writer/publications/[bookId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

function normalizeTags(tags: string | string[]) {
  if (Array.isArray(tags)) return tags.filter(Boolean).map(t => t.trim());
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }
  return [];
}

function assertPaidInputs(visibility: string, price?: number | null, currency?: string | null) {
  if (visibility !== "PAID") return;
  if (price == null || price < 1) throw new Error("Para conteúdo pago, 'price' (centavos) é obrigatório.");
  if (!currency) throw new Error("Para conteúdo pago, 'currency' é obrigatória (ex.: 'BRL').");
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
    } = body ?? {};

    if (!title || !description || !coverUrl || !visibility || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // carrega usuário + writer
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        writer: { select: { id: true, stripeAccountId: true } },
      },
    });

    if (!me || !me.writer) {
      return NextResponse.json({ error: "User is not a writer" }, { status: 403 });
    }

    // carrega publicação e valida posse
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

    // currency final (mantém existente, usa do body se veio, default BRL)
    const currencyUpper = (bodyCurrency ?? existing.currency ?? "BRL").toUpperCase();

    // normaliza tags
    const tagsNormalized = normalizeTags(tags);

    // atualiza publicação (sem tocar nos campos stripe por enquanto)
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
        isPdf,
        pdfUrl,
        currency: currencyUpper,
      },
    });

    // Se for pago, garantir Stripe Product/Price na CONTA CONECTADA do writer
    if (updated.visibility === "PAID" && (updated.price ?? 0) > 0) {
      if (!me.writer.stripeAccountId) {
        return NextResponse.json({ error: "Writer não conectado ao Stripe" }, { status: 403 });
      }

      const acct = me.writer.stripeAccountId;
      const unit_amount = updated.price!; // já em centavos
      const currencyLc = currencyUpper.toLowerCase();

      // Se já tem product/price, sincroniza. Senão cria.
      const hasProduct = !!updated.stripeProductId;
      const hasPrice = !!updated.stripePriceId;

      try {
        if (hasProduct) {
          // Atualiza nome/descrição do product
          await stripe.products.update(
            updated.stripeProductId!,
            {
              name: updated.title,
              description: updated.description || undefined,
              metadata: {
                publicationId: updated.id,
                writerId: me.writer.id,
                type: updated.type,
              },
            },
            { stripeAccount: acct }
          );

          // Se já tem price salvo, verifica se mudou valor/moeda
          const priceId = updated.stripePriceId ?? null;
          if (priceId) {
            const prevPrice = await stripe.prices.retrieve(priceId, { stripeAccount: acct });
            const changed =
              (prevPrice.unit_amount ?? 0) !== unit_amount ||
              prevPrice.currency !== currencyLc ||
              !!prevPrice.active === false;

            if (changed) {
              // cria novo price e seta como default_price do product
              const newPrice = await stripe.prices.create(
                {
                  currency: currencyLc,
                  unit_amount,
                  product: updated.stripeProductId!,
                  metadata: { publicationId: updated.id, writerId: me.writer.id },
                },
                {
                  stripeAccount: acct,
                  idempotencyKey: `price_${updated.id}_${unit_amount}_${currencyUpper}`,
                }
              );

              await stripe.products.update(
                updated.stripeProductId!,
                { default_price: newPrice.id },
                { stripeAccount: acct }
              );

              const upd = await db.publication.update({
                where: { id: updated.id },
                data: { stripePriceId: newPrice.id },
              });

              return NextResponse.json({ publication: upd }, { status: 200 });
            }

            // não mudou — garante que seja default_price
            await stripe.products.update(
              updated.stripeProductId!,
              { default_price: priceId },
              { stripeAccount: acct }
            );

            return NextResponse.json({ publication: updated }, { status: 200 });
          } else {
            // Sem price salvo — cria um
            const newPrice = await stripe.prices.create(
              {
                currency: currencyLc,
                unit_amount,
                product: updated.stripeProductId!,
                metadata: { publicationId: updated.id, writerId: me.writer.id },
              },
              {
                stripeAccount: acct,
                idempotencyKey: `price_${updated.id}_${unit_amount}_${currencyUpper}`,
              }
            );

            await stripe.products.update(
              updated.stripeProductId!,
              { default_price: newPrice.id },
              { stripeAccount: acct }
            );

            const upd = await db.publication.update({
              where: { id: updated.id },
              data: { stripePriceId: newPrice.id },
            });

            return NextResponse.json({ publication: upd }, { status: 200 });
          }
        } else {
          // Não tem product — cria Product + default_price_data
          // Valida inputs obrigatórios para pago
          assertPaidInputs(updated.visibility, updated.price, updated.currency);

          const product = await stripe.products.create(
            {
              name: updated.title,
              description: updated.description || undefined,
              metadata: {
                publicationId: updated.id,
                writerId: me.writer.id,
                type: updated.type,
              },
              default_price_data: {
                currency: currencyLc,
                unit_amount,
                metadata: { publicationId: updated.id, writerId: me.writer.id },
              },
            },
            {
              stripeAccount: acct,
              idempotencyKey: `product_${updated.id}_v1`,
            }
          );

          const defaultPrice = (product as any).default_price as string | undefined;

          let priceId = defaultPrice;
          if (!priceId) {
            // fallback raríssimo (quando não retorna default_price)
            const priceObj = await stripe.prices.create(
              {
                currency: currencyLc,
                unit_amount,
                product: product.id,
                metadata: { publicationId: updated.id, writerId: me.writer.id },
              },
              {
                stripeAccount: acct,
                idempotencyKey: `price_${updated.id}_${unit_amount}_${currencyUpper}`,
              }
            );
            priceId = priceObj.id;

            await stripe.products.update(
              product.id,
              { default_price: priceId },
              { stripeAccount: acct }
            );
          }

          const upd = await db.publication.update({
            where: { id: updated.id },
            data: {
              stripeProductId: product.id,
              stripePriceId: priceId!,
            },
          });

          return NextResponse.json({ publication: upd }, { status: 200 });
        }
      } catch (e: any) {
        console.error("Erro Stripe (connected):", e?.message ?? e);
        // Publicação já foi atualizada com sucesso no banco; devolve com aviso
        return NextResponse.json(
          { publication: updated, stripeError: String(e?.message ?? e) },
          { status: 200 }
        );
      }
    }

    // Caso não seja pago, só retorna atualização
    return NextResponse.json({ publication: updated }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update publication" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
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

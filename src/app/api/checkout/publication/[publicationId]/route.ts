import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicationId: string }> }
) {
  const session = await getServerSession(authOptions);

  const userReader = await db.user.findUnique({
    where: { id: session?.user.id },
    select: {
      writer: {
        select: {
          slug: true
        }
      }
    }
  });

  if (!userReader) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const { publicationId } = await params;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User não encontrado" }, { status: 404 });
  }

  // 1) Carregar publicação + writer
  const pub = await db.publication.findUnique({
    where: { id: publicationId },
    include: { writer: true },
  });

  if (!pub || pub.visibility !== "PAID" || !pub.stripePriceId) {
    return NextResponse.json({ error: "Publicação inválida" }, { status: 400 });
  }
  if (!pub.writer.stripeAccountId) {
    return NextResponse.json({ error: "Writer sem conta Stripe conectada" }, { status: 400 });
  }

  const APP_URL = process.env.BASE_URL || "http://localhost:3000";

  const URL_WITH_SUBDOMAIN = new URL(APP_URL);
  const userSlug = userReader.writer?.slug;
  if (userSlug) {
    URL_WITH_SUBDOMAIN.hostname = `${userSlug}.${URL_WITH_SUBDOMAIN.hostname}`;
  }

  // 2) (Opcional) taxa da plataforma em centavos
  const PLATFORM_FEE = 0; // ex.: 10% -> Math.round((pub.price ?? 0) * 0.10)

  // 3) Criar sessão NA CONTA CONECTADA (direct charges)
  const idemKey = `chk_${pub.id}_${user.id}_${randomUUID()}`;
  const stripeAccount = pub.writer.stripeAccountId; // <- chave!
  const currency = (pub.currency || "BRL").toLowerCase();

  const sessionCheckout = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        { price: pub.stripePriceId!, quantity: 1 },
      ],
      currency,
      payment_method_types: ["card"], // Add pix
      // Gera/reutiliza customer para esse e-mail na conta conectada
      customer_creation: "always",
      customer_email: user.email,
      // Identifica o comprador no webhook
      client_reference_id: user.id,
      // Metadados úteis para conciliação
      metadata: {
        publicationId: pub.id,
        writerId: pub.writerId,
        userId: user.id,
      },
      // taxa da plataforma (se quiser cobrar)
      payment_intent_data: PLATFORM_FEE > 0 ? {
        application_fee_amount: PLATFORM_FEE,
      } : undefined,

      success_url: `${URL_WITH_SUBDOMAIN}/reader/area/courses/${publicationId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${URL_WITH_SUBDOMAIN}/reader/purchase/cancel`,
      allow_promotion_codes: true,
    },
    {
      stripeAccount,                // <<< cria na conta conectada
      idempotencyKey: idemKey,
    }
  );

  return NextResponse.json({ url: sessionCheckout.url }, { status: 200 });
}

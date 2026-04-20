import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { deleteSubscription } from "@/lib/asaas";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writerId } = await params;
  const sub = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId: session.user.id, writerId } },
  });

  if (!sub?.asaasSubscriptionId) {
    return NextResponse.json({ error: "Assinatura Asaas não encontrada" }, { status: 404 });
  }

  try {
    await deleteSubscription(sub.asaasSubscriptionId);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao cancelar no Asaas" },
      { status: 502 }
    );
  }

  await db.readerSubscription.update({
    where: { id: sub.id },
    data: {
      status: "CANCELED",
      cancelAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });

  return NextResponse.json({ ok: true });
}

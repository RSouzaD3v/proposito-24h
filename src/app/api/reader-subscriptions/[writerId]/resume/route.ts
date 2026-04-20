import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { getSubscription } from "@/lib/asaas";

export const runtime = "nodejs";

/**
 * Se a assinatura ainda existir no Asaas como ACTIVE, sincroniza o status local.
 * Após cancelamento removido no Asaas, não há retomada automática — o leitor deve assinar de novo.
 */
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
    return NextResponse.json(
      { error: "Nenhuma assinatura recorrente ativa para retomar." },
      { status: 404 }
    );
  }

  try {
    const remote = await getSubscription(sub.asaasSubscriptionId);
    if (remote.status === "ACTIVE") {
      const nextEnd = remote.nextDueDate
        ? new Date(`${remote.nextDueDate}T23:59:59.000Z`)
        : null;
      await db.readerSubscription.update({
        where: { id: sub.id },
        data: {
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          cancelAt: null,
          currentPeriodEnd: nextEnd,
        },
      });
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json(
      { error: "Assinatura não encontrada no Asaas. Assine novamente." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Não foi possível retomar. Inicie uma nova assinatura." },
    { status: 400 }
  );
}

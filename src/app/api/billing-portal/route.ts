import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.user.findUnique({ where: { id: session.user.id } });
  if (!me?.asaasCustomerId) {
    return NextResponse.json(
      { error: "Cliente Asaas ainda não criado (assine ou compre algo primeiro)." },
      { status: 400 }
    );
  }

  const base = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return NextResponse.json({
    url: `${base}/account`,
    message:
      "O Asaas não oferece portal tipo Stripe. Gerencie assinaturas na área do leitor ou pelo link enviado por e-mail.",
  });
}

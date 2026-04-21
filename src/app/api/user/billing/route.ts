import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** Dados de cobrança do próprio usuário (para pré-preencher checkout). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const u = await db.user.findUnique({
    where: { id: session.user.id },
    select: { cpfCnpj: true },
  });
  return NextResponse.json({ cpfCnpj: u?.cpfCnpj ?? null });
}

// app/writer/(check-subscription)/analytics/_lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireWriter() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true, writerId: true },
  });

  if (!user?.writerId || (user.role !== "WRITER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/");
  }

  const writer = await db.writer.findUnique({ where: { id: user.writerId } });
  if (!writer) redirect("/");

  return { session, user, writer };
}

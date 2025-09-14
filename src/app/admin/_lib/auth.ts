// app/admin/_lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") redirect("/");

  return { session, user };
}

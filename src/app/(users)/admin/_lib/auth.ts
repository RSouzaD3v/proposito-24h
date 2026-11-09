// app/admin/_lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { redirect } from "next/navigation";

/** Decide só o redirecionamento da tela; a permissão real é validada pela API. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return { session };
}

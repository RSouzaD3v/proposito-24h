import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { redirect } from "next/navigation";

export default async function RedirectorPage() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as any)?.role;

  if (role === "ADMIN") return redirect("/admin");
  if (role === "WRITER_ADMIN") return redirect("/writer/dashboard");
  if (role === "CLIENT") return redirect("/reader/area");
  return redirect("/app");
}

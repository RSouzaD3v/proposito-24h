import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function assertWriterAdmin(writerId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // ajuste: se tiver enum Role no token, use aqui
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const isWriterAdmin =
    !!user &&
    (user.role === "WRITER_ADMIN" || user.role === "ADMIN") &&
    (user.role === "ADMIN" || user.writerId === writerId);

  if (!isWriterAdmin) throw new Error("Forbidden");
  return { session, user };
}

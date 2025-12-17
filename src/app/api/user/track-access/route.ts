// app/api/user/track-access/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({}, { status: 401 });

  await db.user.updateMany({
    where: {
      id: session.user.id,
      OR: [
        { lastAccess: null },
        { lastAccess: { lt: new Date(Date.now() - 1000 * 60 * 5) } },
      ],
    },
    data: { lastAccess: new Date() },
  });

  return Response.json({ ok: true });
}

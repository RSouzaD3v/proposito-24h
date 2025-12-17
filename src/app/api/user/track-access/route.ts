import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Sao_Paulo";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({}, { status: 401 });
  }

  // ⏰ Data ajustada para horário do Brasil
  const nowSP = toZonedTime(new Date(), TZ);

  await db.user.updateMany({
    where: {
      id: session.user.id,
      OR: [
        { lastAccess: null },
        {
          lastAccess: {
            lt: new Date(Date.now() - 1000 * 60 * 5),
          },
        },
      ],
    },
    data: {
      lastAccess: nowSP,
    },
  });

  return Response.json({ ok: true });
}

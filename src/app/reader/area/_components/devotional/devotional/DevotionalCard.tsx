import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { authOptions } from "@/lib/authOption"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { FaCheck, FaComments } from "react-icons/fa"

export const DevotionalCard = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      }
    })

    if (!user?.writerId) {
      return null;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const devotional = await db.devotional.findFirst({
      where: {
      writerId: user.writerId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      },
    });

    const userCompletationDevotional = devotional
      ? await db.userCompletationDevotional.findFirst({
        where: {
        userId: user.id,
        devotionalId: devotional.id,
        },
      })
      : null;

    if (!devotional) {
      return (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
          <CardContent className="flex items-center justify-center flex-col text-center h-full">
            <h4>Nenhum devocional ainda.</h4>
          </CardContent>
        </Card>
      );
    }

    return (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaComments size={25} />
                <h2>Devocional</h2>
              </div>

              {userCompletationDevotional ? (
                <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg">
                  <FaCheck />
                </div>
              ) : null}
            </CardHeader>

            <CardContent>
              <h2 className="text-xl font-bold">{devotional?.verse}</h2>
            </CardContent>

            <CardFooter>
              <Link href={`/reader/area/devotional/${devotional?.id}`} className="bg-black p-2 text-center text-xl font-bold w-full rounded-xl text-white hover:underline">
                Ler
              </Link>
            </CardFooter>
        </Card>
    )
}
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { authOptions } from "@/lib/authOption"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { FaCheck } from "react-icons/fa"
import { FiActivity } from "react-icons/fi"

export const QuoteCard = async () => {
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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const quota = await db.quote.findFirst({
      where: {
      writerId: user.writerId,
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
      },
    });

    const userCompletionQuote = await db.userCompletationQuote.findFirst({
      where: {
      userId: user.id,
      quoteId: quota?.id,
      },
    });

    if (!quota) {
      return (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
          <CardContent className="flex items-center justify-center flex-col text-center h-full">
            <h4>Nenhuma citação ainda.</h4>
          </CardContent>
        </Card>
      );
    }

    return (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiActivity size={25} />
                <h2>Citação Diária</h2>
              </div>

              {userCompletionQuote ? (
                <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg">
                  <FaCheck />
                </div>
              ) : null}
            </CardHeader>

            <CardContent>
              <h4>A CITAÇÃO DE HOJE É DE:</h4>
              <h2 className="text-xl font-bold">{quota?.nameAuthor}</h2>
            </CardContent>

            <CardFooter>
              <Link href={`/reader/area/quote/${quota?.id}`} className="bg-black p-2 text-center text-xl font-bold w-full rounded-xl text-white hover:underline">
                Ler
              </Link>
            </CardFooter>
        </Card>
    )
}
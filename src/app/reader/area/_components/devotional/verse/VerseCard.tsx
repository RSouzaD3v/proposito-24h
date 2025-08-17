import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { authOptions } from "@/lib/authOption"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { FaCheck } from "react-icons/fa"
import { FiBook } from "react-icons/fi"

export const VerseCard = async () => {
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

    const verse = await db.verse.findFirst({
      where: {
        writerId: user.writerId,
      }
    });

    const userCompletionVerse = await db.userCompletationVerse.findFirst({
      where: {
        userId: user.id,
        verseId: verse?.id
      }
    });

    if (!verse) {
      return (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="flex items-center justify-center flex-col text-center h-full">
            <h4>Nenhum versículo ainda.</h4>
          </CardContent>
        </Card>
      );
    }

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiBook size={25} />
                <h2>Passagem</h2>
              </div>

              {userCompletionVerse ? (
                <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg">
                  <FaCheck />
                </div>
              ) : null}
            </CardHeader>

            <CardContent>
              <h2 className="text-xl font-bold">{verse?.reference}</h2>
            </CardContent>

            <CardFooter>
              <Link href={`/reader/area/verse/${verse?.id}`} className="bg-black p-2 text-center text-xl font-bold w-full rounded-xl text-white hover:underline">
                Ler
              </Link>
            </CardFooter>
        </Card>
    )
}
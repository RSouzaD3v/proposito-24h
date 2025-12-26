import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ReaderGroupDailyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.writerId) {
    return (
      <p className="text-sm text-muted-foreground">
        Você precisa estar logado para acessar esta área.
      </p>
    );
  }

  /**
   * 1) Buscar agrupamentos ativos do writer
   */
  const groupings = await db.groupingDaily.findMany({
    where: {
      writerId: session.user.writerId,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  if (groupings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum devocional disponível no momento.
      </p>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-6">
      <Link href={"/reader/area"}>
        <Button className="my-2 cursor-pointer">
          Voltar para area
        </Button>
      </Link>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          Agrupamento de diários
        </h1>
        <p className="text-sm text-muted-foreground">
          Separe um tempo para estar com Deus hoje
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groupings.map((group) => (
          <Link
            key={group.id}
            href={`/reader/area/group-daily/${group.id}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-md transition">
              {/* IMAGEM */}
              {group.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-base">
                  {group.title}
                </h2>

                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {group.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

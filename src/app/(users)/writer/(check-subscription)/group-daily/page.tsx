import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { ModalGroupDaily } from "./_components/ModalGroupDaily";

export default async function GroupDaily() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.writerId) {
    return (
      <p className="text-sm text-muted-foreground">
        Você precisa estar logado para acessar esta página.
      </p>
    );
  }

  const groupingDailies = await db.groupingDaily.findMany({
    where: {
      writerId: session.user.writerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 mt-5 max-w-4xl mx-auto px-3">
      {/* HEADER */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            Agrupamentos Diários
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize os conteúdos do seu devocional diário
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ModalGroupDaily />

          <Button asChild variant="outline">
            <Link
              href="/writer/dashboard"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* SEM GROUPINGS */}
      {groupingDailies.length === 0 && (
        <div className="flex justify-center mt-10">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-lg font-semibold">
                Nenhum agrupamento criado
              </h2>

              <p className="text-sm text-muted-foreground">
                Você ainda não criou um agrupamento diário.
                Crie um para organizar seus devocionais.
              </p>

              <ModalGroupDaily />
            </CardContent>
          </Card>
        </div>
      )}

      {/* LISTA DE GROUPINGS */}
      {groupingDailies.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groupingDailies.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              {/* IMAGEM */}
              {group.imageUrl && (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base">
                    {group.title}
                  </h3>

                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {group.description}
                    </p>
                  )}
                </div>

                <Button asChild className="w-full gap-2">
                  <Link
                    href={`/writer/group-daily/${group.id}`}
                  >
                    <Pencil size={16} />
                    Entrar / Editar agrupamento
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

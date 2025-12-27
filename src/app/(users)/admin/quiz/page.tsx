import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const session = await getServerSession(authOptions);

  // 🔒 Segurança: apenas ADMIN
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  // 🔹 Buscar quizzes da aplicação
  const quizzes = await db.quiz.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      active: true,
      createdAt: true,
      _count: {
        select: {
          questions: true,
          sessions: true,
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os quizzes da aplicação
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/quiz/new">
            Criar quiz
          </Link>
        </Button>
      </div>

      {/* LISTAGEM */}
      {quizzes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/admin/quiz/${quiz.id}`}
              className="group"
            >
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-base line-clamp-2">
                      {quiz.title}
                    </h2>

                    <Badge
                      variant={quiz.active ? "default" : "secondary"}
                    >
                      {quiz.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>
                      {quiz._count.questions} perguntas
                    </span>
                    <span>
                      {quiz._count.sessions} partidas
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================
 * EMPTY STATE
 * ====================================================== */

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-10 text-center space-y-4">
        <h2 className="text-lg font-semibold">
          Nenhum quiz criado ainda
        </h2>
        <p className="text-sm text-muted-foreground">
          Crie o primeiro quiz da aplicação para começar.
        </p>

        <Button asChild>
          <Link href="/admin/quiz/new">
            Criar primeiro quiz
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

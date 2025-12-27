import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ModalCreateQuestion } from "./_components/ModalCreateQuestion";
import { ModalEditQuestion } from "./_components/ModalEditQuestion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteQuizQuestionAction } from "./actions";
import Link from "next/link";

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={"/admin/quiz"}>
        <Button className="my-2 cursor-pointer">
          Voltar
        </Button>
      </Link>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{quiz.title}</h1>

          {quiz.description && (
            <p className="text-sm text-muted-foreground">
              {quiz.description}
            </p>
          )}
        </div>

        <ModalCreateQuestion quizId={quiz.id} />
      </div>

      {/* LISTA DE PERGUNTAS */}
      <div className="space-y-4">
        {quiz.questions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta criada ainda.
          </p>
        )}

        {quiz.questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4 space-y-3">
              {/* HEADER DA PERGUNTA */}
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">
                  {question.order}. {question.title}
                </p>

                <div className="flex gap-2">
                  {/* EDITAR */}
                  <ModalEditQuestion
                    quizId={quiz.id}
                    questionId={question.id}
                    initialTitle={question.title}
                    initialOptions={question.options.map((opt) => ({
                      id: opt.id,
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    }))}
                  />

                  {/* EXCLUIR */}
                  <form
                    action={async () => {
                      "use server";
                      await deleteQuizQuestionAction(
                        quiz.id,
                        question.id
                      );
                    }}
                  >
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Excluir pergunta"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </form>
                </div>
              </div>

              {/* ALTERNATIVAS */}
              <ul className="space-y-1 pl-4">
                {question.options.map((opt) => (
                  <li
                    key={opt.id}
                    className={`text-sm ${
                      opt.isCorrect
                        ? "font-semibold text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {opt.isCorrect ? "✓ " : "– "}
                    {opt.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

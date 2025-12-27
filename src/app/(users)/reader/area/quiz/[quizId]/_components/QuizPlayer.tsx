"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitQuizAnswerAction } from "../actions";
import Link from "next/link";

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    pointsPerHit: number;
  };
  questions: {
    id: string;
    title: string;
    options: {
      id: string;
      text: string;
    }[];
  }[];
  session: {
    id: string;
    score: number;
    answeredIds: string[];
  };
}

export function QuizPlayer({
  quiz,
  questions,
  session,
}: QuizPlayerProps) {
  const [isPending, startTransition] = useTransition();

  const [currentIndex, setCurrentIndex] = useState(() => {
    return questions.findIndex(
      (q) => !session.answeredIds.includes(q.id)
    );
  });

  const [selectedOption, setSelectedOption] =
    useState<string | null>(null);

  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  const isFinished = currentIndex === -1;

  const currentQuestion = questions[currentIndex];

  /* =========================
   * HANDLERS
   * ========================= */

  function handleAnswer(optionId: string) {
    if (!currentQuestion || isPending) return;

    setSelectedOption(optionId);

    startTransition(async () => {
      const res = await submitQuizAnswerAction({
        sessionId: session.id,
        quizId: quiz.id,
        questionId: currentQuestion.id,
        optionId,
      });

      setFeedback(res.correct ? "correct" : "wrong");

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);

        const nextIndex = questions.findIndex(
          (q, idx) =>
            idx > currentIndex &&
            !session.answeredIds.includes(q.id)
        );

        setCurrentIndex(nextIndex === -1 ? -1 : nextIndex);
      }, 900);
    });
  }

  /* =========================
   * FINALIZADO
   * ========================= */

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center space-y-4">
        <h1 className="text-2xl font-semibold">
          Quiz finalizado 🎉
        </h1>

        <p className="text-muted-foreground">
          Você concluiu o quiz <strong>{quiz.title}</strong>.
        </p>

        <Button asChild>
          <a href="/reader/area/quiz">Voltar aos quizzes</a>
        </Button>
      </div>
    );
  }

  /* =========================
   * UI
   * ========================= */

  return (
    <div className="max-w-xl mx-auto mt-8 space-y-4">
                <Link href={"/reader/area/quiz"}>
            <Button className="cursor-pointer my-2">
                Voltar
            </Button>
        </Link>
      <h1 className="text-lg font-semibold text-center">
        {quiz.title}
      </h1>

      <p className="text-sm text-muted-foreground text-center">
        Pergunta {currentIndex + 1} de {questions.length}
      </p>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-medium text-base">
            {currentQuestion.title}
          </h2>

          <div className="space-y-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;

              return (
                <Button
                  key={opt.id}
                  variant="outline"
                  className={cn(
                    "w-full justify-start",
                    isSelected &&
                      feedback === "correct" &&
                      "border-green-600 bg-green-50",
                    isSelected &&
                      feedback === "wrong" &&
                      "border-red-600 bg-red-50"
                  )}
                  disabled={!!selectedOption}
                  onClick={() => handleAnswer(opt.id)}
                >
                  {opt.text}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

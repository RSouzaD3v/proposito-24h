"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { ModalCreateQuestion } from "./ModalCreateQuestion";

interface Props {
  quizId: string;
  questions: any[];
}

export function QuizQuestionsManager({ quizId, questions }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Perguntas</h2>
          <ModalCreateQuestion quizId={quizId} />
        </div>

        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta criada ainda.
          </p>
        )}

        <div className="space-y-3">
          {questions.map((q, index) => {
            const hasCorrect = q.options.some((o: any) => o.isCorrect);

            return (
              <Card key={q.id}>
                <CardContent className="p-4 flex justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {index + 1}. {q.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.options.length} opções
                    </p>
                  </div>

                  {hasCorrect ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <AlertTriangle className="text-yellow-500" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

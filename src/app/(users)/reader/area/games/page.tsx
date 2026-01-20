import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Link2 } from "lucide-react";

export default function GamesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href={"/reader/area"}>
            <Button className="my-5 cursor-pointer">
                Voltar para Area
            </Button>
        </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Jogos Bíblicos
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aprenda, reflita e se divirta enquanto aprofunda seu conhecimento.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QUIZ */}
        <Card className="group hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain size={20} />
              </div>
              <div>
                <CardTitle>Quiz Bíblico</CardTitle>
                <CardDescription>
                  Perguntas e respostas para testar seus conhecimentos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex justify-end">
            <Button asChild>
              <Link href="/reader/area/quiz">
                Jogar agora
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* WORD CONNECT */}
        <Card className="group hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 size={20} />
              </div>
              <div>
                <CardTitle>Conectar Palavras</CardTitle>
                <CardDescription>
                  Forme palavras e exercite sua memória e atenção.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex justify-end">
            <Button asChild variant="secondary">
              <Link href="/reader/area/word-connect">
                Jogar agora
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

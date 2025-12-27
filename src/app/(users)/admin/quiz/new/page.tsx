import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { ModalCreateQuiz } from "./_components/ModalCreateQuiz";

export const dynamic = "force-dynamic";

export default async function AdminCreateQuizPage() {
  const session = await getServerSession(authOptions);

  // 🔒 Apenas ADMIN
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Criar Quiz</h1>
          <p className="text-sm text-muted-foreground">
            Configure um novo quiz da aplicação
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/quiz">Voltar</Link>
        </Button>
      </div>

      {/* FORM */}
      <Card>
        <CardContent className="p-6">
          <ModalCreateQuiz openDefault />
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import MySubscriptions from "@/components/subscriptions/MySubscriptions";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reader/area" aria-label="Voltar para a área do leitor">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Minhas assinaturas</h1>
      </div>
      <MySubscriptions />
    </main>
  );
}

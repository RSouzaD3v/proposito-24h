import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ScreenSubscription({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
      <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border bg-white/90 px-8 py-10 text-center shadow-xl">
        <Sparkles className="mb-4 size-10 text-amber-500" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Conteúdo exclusivo
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          Assinatura necessária
        </h2>
        <p className="mt-3 text-muted-foreground">
          Este conteúdo faz parte do plano do escritor. Comece com o teste grátis (até 7 dias,
          conforme o plano) e continue com a assinatura para manter o acesso.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/reader/area">Voltar</Link>
          </Button>
          <Button asChild>
            <Link href={`/reader/area/w/${slug}`}>Ver planos e assinar</Link>
          </Button>
        </div>
        <Link
          href="/reader/area/subscription"
          className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
        >
          Já assinou? Gerenciar assinatura
        </Link>
      </div>
    </div>
  );
}

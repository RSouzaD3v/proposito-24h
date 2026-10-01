import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default function GamesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
      <PageHeader
        title="Jogos Bíblicos"
        description="Aprenda, reflita e se divirta enquanto aprofunda seu conhecimento."
        backHref="/reader/area"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard strong className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[var(--liquid-accent)]">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
                Quiz Bíblico
              </h2>
              <p className="text-sm text-[var(--liquid-muted)]">
                Perguntas e respostas para testar seus conhecimentos.
              </p>
            </div>
          </div>
          <Button asChild variant="glass-primary" className="w-full rounded-full">
            <Link href="/reader/area/quiz">Jogar agora</Link>
          </Button>
        </GlassCard>

        <GlassCard strong className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[var(--liquid-accent)]">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
                Conectar Palavras
              </h2>
              <p className="text-sm text-[var(--liquid-muted)]">
                Forme palavras e exercite sua memória e atenção.
              </p>
            </div>
          </div>
          <Button asChild variant="glass" className="w-full rounded-full">
            <Link href="/reader/area/word-connect">Jogar agora</Link>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}

import Link from "next/link";
import { OldTestamentRadial } from "@/components/charts/OldTestamentRadial";
import { NewTestamentRadial } from "@/components/charts/NewTestamentRadial";
import { OverallBibleRadial } from "@/components/charts/OverallBibleRadial";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { apiGet } from "@/lib/api/server";
import type { BibleProgress } from "@/lib/api/types";
import { ProgressSection } from "./_components/ProgressSection";

const PENDING_BLOCK = "“Dias finais” concluídos, mas ainda há leituras pendentes neste bloco.";

const OLD_TESTAMENT = [
  { key: "pentateuch", title: "Progresso de Leitura - Pentateuco", books: "Gênesis, Êxodo, Levítico, Números, Deuteronômio", finishedLabel: "PENTATEUCO FINALIZADO", pendingLabel: "Livros concluídos (pelos “dias finais”), mas ainda há dias do Pentateuco pendentes." },
  { key: "history", title: "Progresso de Leitura - Históricos", books: "Juízes, Rute, 1–2 Samuel, 1–2 Reis, 1–2 Crônicas, Esdras, Neemias, Ester", finishedLabel: "LIVROS HISTÓRICOS FINALIZADOS", pendingLabel: "“Dias finais” concluídos, mas ainda há leituras dos Históricos pendentes." },
  { key: "poetry", title: "Progresso de Leitura - Poéticos e Sabedoria", books: "Salmos, Provérbios, Eclesiastes, Cântico dos Cânticos", finishedLabel: "POÉTICOS E SABEDORIA FINALIZADOS", pendingLabel: "“Dias finais” concluídos, mas ainda há leituras de Poéticos/Sabedoria pendentes." },
  { key: "majorProphets", title: "Progresso de Leitura - Profetas Maiores", books: "Isaías, Jeremias, Lamentações, Ezequiel, Daniel", finishedLabel: "PROFETAS MAIORES FINALIZADOS", pendingLabel: "“Dias finais” concluídos, mas ainda há leituras dos Profetas Maiores pendentes." },
  { key: "minorProphets", title: "Progresso de Leitura - Profetas Menores", books: "Oséias, Joel, Amós, Obadias, Jonas, Miquéias, Naum, Habacuque, Sofonias, Ageu, Zacarias, Malaquias", finishedLabel: "PROFETAS MENORES FINALIZADOS", pendingLabel: "“Dias finais” concluídos, mas ainda há leituras dos Profetas Menores pendentes." },
];

const NEW_TESTAMENT = [
  { key: "gospelsActs", title: "Progresso de Leitura — Evangelhos e Atos", books: "Mateus, Marcos, Lucas, João, Atos", finishedLabel: "EVANGELHOS E ATOS FINALIZADOS", pendingLabel: PENDING_BLOCK },
  { key: "pauline", title: "Progresso de Leitura — Cartas Paulinas", books: "Romanos, 1–2 Coríntios, Gálatas, Efésios, Filipenses, Colossenses, 1–2 Tessalonicenses, 1–2 Timóteo, Tito, Filemom", finishedLabel: "CARTAS PAULINAS FINALIZADAS", pendingLabel: "“Dias finais” concluídos, mas ainda há leituras das Paulinas pendentes." },
  { key: "generalEpistles", title: "Progresso de Leitura — Cartas Gerais", books: "Hebreus, Tiago, 1–2 Pedro, 1–3 João, Judas", finishedLabel: "CARTAS GERAIS FINALIZADAS", pendingLabel: PENDING_BLOCK },
  { key: "prophetic", title: "Progresso de Leitura — Profético (Apocalipse)", books: "Apocalipse", finishedLabel: "APOCALIPSE FINALIZADO", pendingLabel: "“Dia final” concluído, mas ainda há leituras de Apocalipse pendentes." },
];

export default async function DashboardPage() {
  const { progress } = await apiGet<{ progress: BibleProgress | null }>("/reader/bible-progress");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <PageHeader
        title="Dashboard Bíblico"
        description="Acompanhe seu progresso na leitura das Escrituras"
        backHref="/reader/area"
        actions={
          <Button asChild variant="glass-primary" className="rounded-full px-4">
            <Link href="/reader/area/reading/plan/365">
              Plano 365 dias
            </Link>
          </Button>
        }
      />

      {!progress ? (
        <GlassCard strong className="mb-8">
          <p>Nenhum plano de leitura encontrado.</p>
        </GlassCard>
      ) : (
        <>
          <GlassCard strong className="mb-8">
            <div className="grid gap-4 md:grid-cols-3">
              <OldTestamentRadial value={progress.oldTestament} />
              <NewTestamentRadial value={progress.newTestament} />
              <OverallBibleRadial value={progress.overall} />
            </div>
          </GlassCard>

          <h2 className="mt-6 font-bold text-xl text-[var(--liquid-ink)]">
            Velho Testamento
          </h2>
          <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-6">
            {OLD_TESTAMENT.map(({ key, ...section }) => (
              <ProgressSection key={key} {...section} progress={progress.sections[key]} />
            ))}
          </div>

          <h2 className="mt-10 font-bold text-xl text-[var(--liquid-ink)]">
            Novo Testamento
          </h2>
          <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-6">
            {NEW_TESTAMENT.map(({ key, ...section }) => (
              <ProgressSection key={key} {...section} progress={progress.sections[key]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

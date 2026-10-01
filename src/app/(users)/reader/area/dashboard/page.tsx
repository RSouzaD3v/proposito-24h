import React from "react";
import PentateucoProgress from "./_components/Pentateuco";
import Link from "next/link";
import HistoryProgress from "./_components/History";
import PoetryWisdomProgress from "./_components/PoetryWisdom";
import MajorProphetsProgress from "./_components/MajorProphets";
import MinorProphetsProgress from "./_components/MinorProphets";
import GospelsActsProgress from "./_components/GospelsActs";
import PaulineLettersProgress from "./_components/PaulineLetters";
import GeneralEpistlesProgress from "./_components/GeneralEpistles";
import PropheticProgress from "./_components/Prophetic";
import BibleProgressServer from "./_components/BibleProgressServer";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
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

      <GlassCard strong className="mb-8">
        <BibleProgressServer />
      </GlassCard>

      <h2 className="mt-6 font-bold text-xl text-[var(--liquid-ink)]">
        Velho Testamento
      </h2>
      <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-6">
        <PentateucoProgress />
        <HistoryProgress />
        <PoetryWisdomProgress />
        <MajorProphetsProgress />
        <MinorProphetsProgress />
      </div>

      <h2 className="mt-10 font-bold text-xl text-[var(--liquid-ink)]">
        Novo Testamento
      </h2>
      <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-6">
        <GospelsActsProgress />
        <PaulineLettersProgress />
        <GeneralEpistlesProgress />
        <PropheticProgress />
      </div>
    </div>
  );
}

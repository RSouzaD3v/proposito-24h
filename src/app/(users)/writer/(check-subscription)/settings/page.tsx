import Link from "next/link";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { Plans } from "./_components/Plans";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <WriterShell maxWidth="md">
        <GlassCard strong className="flex flex-col items-center gap-6 text-center">
          <PageHeader
            title="Configurações"
            description="Você precisa estar logado para acessar as configurações."
            centered
            className="mb-0"
          />
          <Button asChild variant="glass-primary" className="rounded-full px-6">
            <Link href="/login">Ir para Login</Link>
          </Button>
        </GlassCard>
      </WriterShell>
    );
  }

  return (
    <WriterShell maxWidth="md">
      <div className="mb-6">
        <BackButton href="/writer/dashboard" label="Voltar ao Painel" />
      </div>
      <GlassCard strong className="flex flex-col items-center gap-6 text-center">
        <PageHeader
          title="Configurações"
          description="Gerencie sua assinatura e preferências da conta. Pagamentos de leitores e vendas são processados pela plataforma via Asaas (conta única)."
          centered
          className="mb-0"
        />
        <div className="flex w-full flex-col items-center gap-3">
          <Plans />
        </div>
        <Button asChild variant="glass-primary" className="rounded-full px-6">
          <Link href="/writer/dashboard">Ir para o Painel</Link>
        </Button>
      </GlassCard>
    </WriterShell>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOption";
import PersonalizationForm from "./_components/PersonalizationForm";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function WriterPersonalizationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const writerId = (session.user as { writerId?: string })?.writerId;

  if (!writerId) {
    return (
      <WriterShell maxWidth="2xl">
        <GlassCard>
          <p className="text-[var(--liquid-muted)]">Writer não identificado.</p>
        </GlassCard>
      </WriterShell>
    );
  }

  return (
    <WriterShell maxWidth="2xl">
      <PageHeader
        title="Personalização do cliente"
        description="Ajuste as cores e a identidade visual do app do leitor."
        backHref="/writer/dashboard"
        backLabel="Voltar ao Painel"
      />
      <PersonalizationForm writerId={writerId} />
    </WriterShell>
  );
}

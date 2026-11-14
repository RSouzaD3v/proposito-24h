import { BackButton } from "@/components/ui/back-button";
import { WriterShell } from "@/components/ui/writer-shell";
import WriterPlansManager from "@/components/writer/WriterPlansManager";
import { PainelControllerAccess } from "./_components/PainelControllerAccess";

export default async function Page({ params }: { params: Promise<{ writerId: string }> }) {
  const { writerId } = await params;
  return (
    <WriterShell maxWidth="2xl">
      <BackButton href="/writer/settings" label="Voltar às configurações" className="mb-6" />

      <header className="mb-8">
        <p className="reader-eyebrow mb-2">Monetização</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">Planos para leitores</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--liquid-muted)]">
          Crie os planos que seus leitores podem assinar e escolha quais conteúdos ficam livres ou exclusivos para
          assinantes.
        </p>
      </header>

      <div className="grid gap-10">
        <WriterPlansManager />
        <PainelControllerAccess writerId={writerId} />
      </div>
    </WriterShell>
  );
}

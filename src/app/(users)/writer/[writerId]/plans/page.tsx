import WriterPlansManager from "@/components/writer/WriterPlansManager";
import Link from "next/link";
import { PainelControllerAccess } from "./_components/PainelControllerAccess";

export default async function Page({ params }: { params: Promise<{ writerId: string }> }) {
  const { writerId } = await params;
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link className="text-blue-500 underline" href={"/writer/settings"}>Voltar as configurações</Link>
      <h1 className="text-2xl font-bold">Planos e acesso do leitor</h1>
      <p className="text-muted-foreground text-sm">
        Configure o teste grátis (padrão 7 dias), preços e o que cada tipo de conteúdo exige — grátis,
        assinatura ou compra.
      </p>
      <PainelControllerAccess writerId={writerId} />
      <WriterPlansManager writerId={writerId} />
    </main>
  );
}

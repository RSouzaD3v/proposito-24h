import WriterPlansManager from "@/components/writer/WriterPlansManager";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ writerId: string }> }) {
  const { writerId } = await params;
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link className="text-blue-500 underline" href={"/writer/settings"}>Voltar as configurações</Link>
      <h1 className="text-2xl font-bold">Planos de assinatura</h1>
      <WriterPlansManager writerId={writerId} />
    </main>
  );
}

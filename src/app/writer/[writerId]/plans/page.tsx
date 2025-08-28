import WriterPlansManager from "@/components/writer/WriterPlansManager";

export default async function Page({ params }: { params: Promise<{ writerId: string }> }) {
  const { writerId } = await params;
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Planos de assinatura</h1>
      <WriterPlansManager writerId={writerId} />
    </main>
  );
}

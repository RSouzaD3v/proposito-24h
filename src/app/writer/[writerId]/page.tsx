import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import { db } from "@/lib/db";

// 👉 se preferir usar slug, resolva o writerId pelo slug aqui
export default async function WriterPage({
  params,
}: {
  params: Promise<{ writerId: string }>
}) {
  const { writerId } = await params;
  const writer = await db.writer.findUnique({ where: { id: writerId } });

  if (!writer) {
    return <div className="p-6">Escritor não encontrado.</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{writer.name}</h1>
        <p className="text-sm text-neutral-600">Assinatura mensal para conteúdos premium.</p>
      </header>

      {/* Widget completo */}
      <SubscribeWidget writerId={writerId} />
    </main>
  );
}

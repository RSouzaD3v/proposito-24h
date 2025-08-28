import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { hasActiveSubscription } from "@/lib/subscription";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";

export default async function PremiumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const writer = await db.writer.findUnique({
    where: { slug: slug },
    select: { id: true, name: true },
  });

  if (!writer) {
    return <main className="max-w-3xl mx-auto p-6">Escritor não encontrado.</main>;
  }

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Conteúdo premium</h1>
        <p>Faça login para continuar.</p>
        <SubscribeWidget writerId={writer.id} />
      </main>
    );
  }

  const ok = await hasActiveSubscription(session.user.id, writer.id);
  if (!ok) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">{writer.name} • Premium</h1>
        <p>Este conteúdo é exclusivo para assinantes.</p>
        <SubscribeWidget writerId={writer.id} />
      </main>
    );
  }

  return <>{children}</>;
}

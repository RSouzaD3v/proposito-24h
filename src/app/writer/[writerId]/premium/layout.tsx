import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { hasActiveSubscription } from "@/lib/subscription";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";

export default async function PremiumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { writerId: string };
}) {
  const session = await getServerSession(authOptions);
  const { writerId } = params;

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Conteúdo premium</h1>
        <p>Faça login para continuar.</p>
        <SubscribeWidget writerId={writerId} />
      </main>
    );
  }

  const ok = await hasActiveSubscription(session.user.id, writerId);
  if (!ok) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Conteúdo premium</h1>
        <p>Este conteúdo é exclusivo para assinantes.</p>
        <SubscribeWidget writerId={writerId} />
      </main>
    );
  }

  return <>{children}</>;
}

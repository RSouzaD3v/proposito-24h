import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";

export default async function PremiumLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await apiGetOrNull<ReaderProfile>("/reader/profile");
  const writer = profile?.writer?.slug === slug ? profile.writer : null;

  if (!writer) {
    return <main className="max-w-3xl mx-auto p-6">Escritor não encontrado.</main>;
  }

  const { isActive } = await apiGet<{ isActive: boolean }>("/billing/subscription");
  if (!isActive) {
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

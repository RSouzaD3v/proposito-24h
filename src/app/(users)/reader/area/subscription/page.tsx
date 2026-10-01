import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import MySubscriptions from "@/components/subscriptions/MySubscriptions";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function ReaderSubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in?from=/reader/area/subscription");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { writerId: true },
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <BackButton href="/reader/account" className="mb-6" />
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)]">
          Minhas assinaturas
        </h1>
        <p className="text-sm text-[var(--liquid-muted)]">
          Gerencie teste grátis, renovação e cancelamento.
        </p>
      </div>
      <GlassCard strong>
        <MySubscriptions writerId={user?.writerId ?? undefined} />
      </GlassCard>
    </div>
  );
}

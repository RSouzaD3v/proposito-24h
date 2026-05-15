import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import MySubscriptions from "@/components/subscriptions/MySubscriptions";
import { Button } from "@/components/ui/button";
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
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reader/account" aria-label="Voltar">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minhas assinaturas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie teste grátis, renovação e cancelamento.
          </p>
        </div>
      </div>
      <MySubscriptions writerId={user?.writerId ?? undefined} />
    </main>
  );
}

import { db } from "@/lib/db";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { readerSubscriptionIsActive } from "@/lib/readerSubscription";
import { Button } from "@/components/ui/button";

export default async function WriterPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg font-semibold text-neutral-700">
            Você precisa estar logado para acessar esta página.
          </p>
          <Button asChild className="mt-4">
            <Link href="/sign-in">Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    select: { writerId: true },
  });

  const { slug } = await params;

  const writer = await db.writer.findUnique({
    where: { slug, id: userReader?.writerId || undefined },
    select: { id: true, name: true, logoUrl: true, slug: true },
  });

  if (!writer) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center space-y-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg font-semibold text-red-600">Escritor não encontrado.</p>
          <Link href="/reader/area" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    );
  }

  const readerSubscription = await db.readerSubscription.findUnique({
    where: {
      reader_writer_unique: {
        readerId: session.user.id,
        writerId: writer.id,
      },
    },
    select: {
      status: true,
      currentPeriodEnd: true,
      lifetime: true,
      cancelAtPeriodEnd: true,
    },
  });

  const isActive = readerSubscriptionIsActive(readerSubscription);

  if (isActive) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <header className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-lg font-semibold text-green-700">Sua assinatura está ativa.</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie renovação, teste grátis ou cancelamento na área de assinaturas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/reader/area/subscription">Gerenciar assinatura</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reader/area">Voltar ao início</Link>
            </Button>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <header className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-md">
        {writer.logoUrl ? (
          <img
            src={writer.logoUrl}
            alt={writer.name}
            className="h-24 w-24 rounded-full border-4 border-blue-200 object-cover shadow"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-4xl font-bold text-blue-400 shadow">
            {writer.name[0]}
          </div>
        )}
        <h1 className="text-4xl font-bold text-neutral-800">{writer.name}</h1>
        <p className="mt-2 max-w-md text-center text-lg text-neutral-500">
          Teste grátis por 7 dias (conforme plano do escritor) e apoie este ministério com conteúdo
          exclusivo.
        </p>
      </header>

      <section className="flex flex-col items-center rounded-xl bg-gradient-to-br from-blue-50 to-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-blue-700">Assine agora</h2>
        <SubscribeWidget writerId={writer.id} />
        <p className="mt-4 text-sm text-neutral-500">
          Cancele quando quiser. Após o teste, a cobrança segue o plano escolhido.
        </p>
      </section>

      <div className="flex justify-center">
        <Link href="/reader/area" className="text-blue-600 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}

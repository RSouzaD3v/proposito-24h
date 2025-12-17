import { db } from "@/lib/db";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export default async function WriterPublicPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg font-semibold text-neutral-700">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      writerId: true,
    }
  });

  const readerSubscription = await db.readerSubscription.findFirst({
    where: {
      readerId: session.user.id,
      status: "ACTIVE"
    }
  });

  if (readerSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <Link className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg px-5 py-2 rounded-md transition" href={"/reader/area/subscription"}>
            Gerenciar assinatura
          </Link>
          <p className="text-lg font-semibold text-green-600 mt-5">
            Você já possui uma assinatura ativa.
          </p>
          <Link href="/reader/area" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-8">
      <header className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-8">
        {writer.logoUrl ? (
          <img src={writer.logoUrl} alt={writer.name} className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-400 shadow">
            {writer.name[0]}
          </div>
        )}
        <h1 className="text-4xl font-bold text-neutral-800">{writer.name}</h1>
        <p className="text-lg text-neutral-500 mt-2 max-w-md text-center">
          Torne-se um assinante e apoie este escritor! Tenha acesso a conteúdos exclusivos, novidades e benefícios especiais.
        </p>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-8 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Assine agora</h2>
        <SubscribeWidget writerId={writer.id} />
        <p className="text-sm text-neutral-500 mt-4">
          Cancelamento fácil e rápido a qualquer momento.
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

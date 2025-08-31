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
    return (<div className="max-w-3xl mx-auto p-6">
      <p>Você precisa estar logado para acessar esta página.</p>
    </div>);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center space-y-4">
          <Link className="bg-blue-500 text-white text-xl p-2 rounded-sm my-3" href={"/reader/area/subscription"}>
            Gerenciar assinatura
          </Link>
          <p className="text-lg font-semibold mt-5">Você já possui uma assinatura ativa.</p>
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
        <p className="text-lg font-semibold">Escritor não encontrado.</p>
        <Link href="/reader/area" className="text-blue-600 hover:underline">
          Voltar para a página inicial
        </Link>
      </main>
    );
  }

  // (opcional) listar algumas publicações recentes do escritor
  const publications = await db.publication.findMany({
    where: { writerId: writer.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    select: { id: true, title: true, coverUrl: true, visibility: true },
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-4">
        {writer.logoUrl ? (
          <img src={writer.logoUrl} alt={writer.name} className="w-14 h-14 rounded-lg object-cover" />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold">{writer.name}</h1>
          <p className="text-sm text-neutral-600">Apoie este escritor e acesse conteúdos exclusivos.</p>
        </div>
      </header>

      {/* Assinatura do LEITOR para este escritor */}
      <SubscribeWidget writerId={writer.id} />

      {/* Vitrine (opcional) */}
      {!!publications.length && (
        <section className="space-y-3">
          <h2 className="font-semibold">Publicações</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {publications.map((p) => (
              <Link
                key={p.id}
                href={`/reader/area/courses/${p.id}`}
                className="border rounded-lg overflow-hidden hover:shadow-sm"
              >
                {p.coverUrl ? (
                  <img src={p.coverUrl} alt={p.title} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-neutral-100" />
                )}
                <div className="p-2">
                  <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                  <div className="text-xs text-neutral-500">
                    {p.visibility === "FREE" ? "Gratuito" : "Assinantes/Compra"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

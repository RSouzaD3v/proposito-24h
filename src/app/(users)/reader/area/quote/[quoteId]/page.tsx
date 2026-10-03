import { db } from "@/lib/db";
import { CompleteQuote } from "./_components/CompleteQuote";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { getReaderContentGate } from "@/lib/readerAccessForWriter";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function QuoteDetails({ params, searchParams }: { params: Promise<{ quoteId: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return (<div>Você precisa estar logado para ver esta citação.</div>);
    }

    const { quoteId } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);

    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: {
            writer: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            }
        }
    });

  // Usuário (precisamos do writer atual p/ regra de acesso)
  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      writer: { select: { id: true, name: true, slug: true } },
    },
  });

  // Se sua regra exige que o usuário seja "writer" para ver o plano, mantenha:
  if (!userReader || !userReader.writerId) {
    return (
      <div>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser um escritor para acessar este plano de leitura.</p>
      </div>
    );
  }

  const gate = await getReaderContentGate(userReader.writerId, session.user.id, "quote");
  if (!gate.allowed) {
    return <ScreenSubscription slug={userReader.writer?.slug || ""} />;
  }

    return (
        <div style={{ backgroundImage: quote?.imageUrl ? `url(${quote.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="flex w-full max-w-xl flex-col gap-4">
                <BackButton href={backHref} className="self-start" />
                <GlassCard strong className="flex w-full flex-col items-center">
                <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">{quote?.writer.name}</h2>
                <blockquote className="relative text-center">
                    <p className="text-2xl font-light text-gray-700 italic leading-relaxed z-10">{quote?.content}</p>
                </blockquote>
                <div className="mt-8">
                    <span className="text-gray-400 text-sm tracking-wide uppercase">{quote?.nameAuthor}</span>
                </div>
                {quote?.id && (
                    <div className="mt-10 w-full flex justify-center">
                        <CompleteQuote quoteId={quote.id} />
                    </div>
                )}
                </GlassCard>
            </div>
        </div>
    );
}

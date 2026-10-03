import { db } from "@/lib/db";
import { CompleteVerse } from "./_components/CompleteVerse";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { getReaderContentGate } from "@/lib/readerAccessForWriter";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function VerseDetails({ params, searchParams }: { params: Promise<{ verseId: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return (<div>Você precisa estar logado para ver este versículo.</div>);
    }
    const { verseId } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);

    const verse = await db.verse.findUnique({
        where: { id: verseId },
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

  const gate = await getReaderContentGate(userReader.writerId, session.user.id, "verse");
  if (!gate.allowed) {
    return <ScreenSubscription slug={userReader.writer?.slug || ""} />;
  }

    return (
        <div style={{ backgroundImage: verse?.imageUrl ? `url(${verse.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} 
        className="min-h-screen flex items-center  px-4 justify-center bg-linear-to-br from-gray-50 to-gray-200">
            <div className="flex w-full max-w-xl flex-col gap-4">
                <BackButton href={backHref} className="self-start" />
                <GlassCard strong className="flex w-full flex-col items-center space-y-8">
                <span className="text-gray-500 italic text-lg tracking-wide font-serif">
                    {verse?.reference}
                </span>
                <p className="text-2xl text-gray-800 font-serif text-center leading-relaxed select-text">
                    “{verse?.content}”
                </p>
                {verse?.id && (
                    <div className="pt-4 w-full flex justify-center">
                        <CompleteVerse verseId={verse.id} />
                    </div>
                )}
                </GlassCard>
            </div>
        </div>
    );
}

import { db } from "@/lib/db";
import { CompleteVerse } from "./_components/CompleteVerse";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ScreenSubscription } from "../../_components/ScreenSubscription";

export default async function VerseDetails({ params }: { params: Promise<{ verseId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return (<div>Você precisa estar logado para ver este versículo.</div>);
    }
    const { verseId } = await params;

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

  // Regras de acesso do writer
  const verifyAccess = await db.writerReaderAccess.findFirst({
    where: { writerId: userReader.writerId },
  });

  // Assinatura do leitor para esse writer
  const subscription = await db.readerSubscription.findFirst({
    where: { writerId: userReader.writerId, readerId: session.user.id },
    // select: { status: true, endsAt: true } // opcional
  });

  // Defina aqui o que considera "ativa"
  const hasActiveSubscription =
    !!subscription &&
    // ajuste conforme seu schema: 'ACTIVE' / 'active' / etc.
    ((subscription as any).status === "ACTIVE" ||
      (subscription as any).status === "active");

  if (!verifyAccess?.verse && !hasActiveSubscription && !userReader.freePlan) {
    return <ScreenSubscription slug={userReader.writer?.slug || ""} />;
  }

    return (
        <div style={{ backgroundImage: verse?.imageUrl ? `url(${verse.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen flex items-center  px-4 justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="bg-white/80 rounded-2xl shadow-xl p-8 max-w-xl w-full flex flex-col items-center space-y-8 border border-gray-200">
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
            </div>
        </div>
    );
}

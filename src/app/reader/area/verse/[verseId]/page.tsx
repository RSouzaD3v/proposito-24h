import { db } from "@/lib/db";
import { CompleteVerse } from "./_components/CompleteVerse";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";

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

        const verifyAccess = await db.writerReaderAccess.findFirst({
        where: {
            writerId: verse?.writer.id
        }
    });

    const subscription = await db.readerSubscription.findFirst({
        where: {
            writerId: verse?.writer.id,
            readerId: session.user.id
        }
    });

    if (!verifyAccess?.verse || !subscription) {
        return (
            <div className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
                    <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">Acesso Negado</h2>
                    <p className="text-gray-600">Você precisa de uma assinatura para acessar este versículo.</p>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                        <Link
                            href="/reader/area"
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                        >
                            Voltar
                        </Link>
                        <Link
                            href={`/reader/area/w/${verse?.writer.slug}`}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                            Assinar agora
                        </Link>
                    </div>
                </div>
            </div>
        );
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

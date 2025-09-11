import { db } from "@/lib/db";
import { CompleteDevotional } from "./_components/CompleteDevotional";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function VerseDetails({ params }: { params: Promise<{ devotionalId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return (<div>Você precisa estar logado para ver este devocional.</div>);
    }
    const { devotionalId } = await params;

    const devotional = await db.devotional.findUnique({
        where: { id: devotionalId },
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
            writerId: devotional?.writer.id
        }
    });

    const subscription = await db.readerSubscription.findFirst({
        where: {
            writerId: devotional?.writer.id,
            readerId: session.user.id
        }
    });

    if (!verifyAccess?.devotional || !subscription) {
        return (
            <div className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
                    <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">Acesso Negado</h2>
                    <p className="text-gray-600">Você precisa de uma assinatura para acessar este devocional.</p>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                        <Link
                            href="/reader/area"
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                        >
                            Voltar
                        </Link>
                        <Link
                            href={`/reader/area/w/${devotional?.writer.slug}`}
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
        <div style={{ backgroundImage: devotional?.imageUrl ? `url(${devotional?.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] px-4">
            <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">{devotional?.title}</h2>
                    <h3 className="text-base text-gray-500 italic">{devotional?.verse}</h3>
                </div>
                <div>
                    <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                        {devotional?.content}
                    </p>
                </div>
                {devotional?.id && (
                    <div className="flex justify-center">
                        <CompleteDevotional devotionalId={devotional.id} devotionalContent={devotional?.content} />
                    </div>
                )}
            </div>
        </div>
    );
}

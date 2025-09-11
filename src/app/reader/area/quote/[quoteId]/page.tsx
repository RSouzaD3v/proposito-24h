import { db } from "@/lib/db";
import { CompleteQuote } from "./_components/CompleteQuote";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import Link from "next/link";

export default async function QuoteDetails({ params }: { params: Promise<{ quoteId: string }>}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return (<div>Você precisa estar logado para ver esta citação.</div>);
    }

    const { quoteId } = await params;

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

    const verifyAccess = await db.writerReaderAccess.findFirst({
        where: {
            writerId: quote?.writer.id
        }
    });

    const subscription = await db.readerSubscription.findFirst({
        where: {
            writerId: quote?.writer.id,
            readerId: session.user.id
        }
    });

    const isFree = verifyAccess?.quote === true;
    const hasSubscription = !!subscription;

    if (!isFree && !hasSubscription) {
        return (
            <div className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
                    <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">Acesso Negado</h2>
                    <p className="text-gray-600">Você precisa de uma assinatura para acessar esta citação.</p>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                        <Link
                            href="/reader/area"
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                        >
                            Voltar
                        </Link>
                        <Link
                            href={`/reader/area/w/${quote?.writer.slug}`}
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
        <div style={{ backgroundImage: quote?.imageUrl ? `url(${quote.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
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
            </div>
        </div>
    );
}
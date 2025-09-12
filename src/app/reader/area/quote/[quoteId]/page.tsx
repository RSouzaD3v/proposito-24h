import { db } from "@/lib/db";
import { CompleteQuote } from "./_components/CompleteQuote";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import Link from "next/link";
import { ScreenSubscription } from "../../_components/ScreenSubscription";

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
        <ScreenSubscription slug={quote?.writer.slug || ""} />
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
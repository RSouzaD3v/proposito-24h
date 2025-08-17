import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { CompleteQuote } from "./_components/CompleteQuote";

export default async function QuoteDetails({ params }: { params: Promise<{ quoteId: string }>}) {
    const { quoteId } = await params;

    const quote = await db.quote.findUnique({
        where: {
            id: quoteId
        }
    });

    return (
        <div className="overflow-hidden relative bg-black">
            <div className="absolute hidden md:flex opacity-90 -z-20 inset-0 items-center justify-center h-full w-full">
                <img className="w-full blur-sm object-contain" src={quote?.imageUrl || ""} alt="" />
            </div>
            <div className="absolute -z-10 inset-0 flex items-center justify-center h-full w-full">
                <img className="md:max-w-full min-w-full min-h-full md:max-h-full object-contain" src={quote?.imageUrl || ""} alt="" />
            </div>
            <div className="text-center flex items-center justify-between flex-col h-screen py-10">
                <h2 className="bg-black/20 text-white p-2 rounded-xl">PROPOSITO 24H</h2>

                <div className="text-center flex items-center flex-col space-y-3 max-w-[400px]">
                    <p className="text-xl text-white bg-black/20 p-2 rounded-xl">{quote?.content}</p>

                    <h2 className="bg-black/20 w-fit text-white p-2 rounded-xl">{quote?.nameAuthor.toUpperCase()}</h2>
                </div>

                {quote?.id && (
                    <CompleteQuote quoteId={quote?.id} />
                )}
            </div>
        </div>
    );
}
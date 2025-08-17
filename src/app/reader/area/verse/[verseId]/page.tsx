import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { CompleteVerse } from "./_components/CompleteVerse";

export default async function VerseDetails({ params }: { params: Promise<{ verseId: string }>}) {
    const { verseId } = await params;

    const verse = await db.verse.findUnique({
        where: {
            id: verseId
        }
    });

    return (
        <div className="overflow-hidden relative bg-black">
            {/* <div className="absolute hidden md:flex opacity-90 -z-20 inset-0 items-center justify-center h-full w-full">
                <img className="w-full blur-sm object-contain" src={quote?.imageUrl || ""} alt="" />
            </div>
            <div className="absolute -z-10 inset-0 flex items-center justify-center h-full w-full">
                <img className="md:max-w-full min-w-full min-h-full md:max-h-full object-contain" src={quote?.imageUrl || ""} alt="" />
            </div> */}
            <div className="text-center flex items-center justify-between flex-col h-screen py-10">
                <h2 className="bg-black/20 text-white p-2 rounded-xl">{verse?.reference}</h2>

                <div className="text-center flex items-center flex-col space-y-3 max-w-[400px]  max-h-[350px] overflow-auto">
                    <p className="text-xl text-white bg-black/20 p-2 rounded-xl">{verse?.content}</p>
                </div>

                {verse?.id && (
                    <div>
                        <CompleteVerse verseId={verse.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
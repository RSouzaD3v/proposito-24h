import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { CompleteDevotional } from "./_components/CompleteDevotional";

export default async function VerseDetails({ params }: { params: Promise<{ devotionalId: string }>}) {
    const { devotionalId } = await params;

    const devotional = await db.devotional.findUnique({
        where: {
            id: devotionalId
        }
    });

    return (
        <div className="flex items-center justify-center container">
            <div className="relative bg-black p-5">
                {/* <div className="absolute hidden md:flex opacity-90 -z-20 inset-0 items-center justify-center h-full w-full">
                    <img className="w-full blur-sm object-contain" src={quote?.imageUrl || ""} alt="" />
                </div>
                <div className="absolute -z-10 inset-0 flex items-center justify-center h-full w-full">
                    <img className="md:max-w-full min-w-full min-h-full md:max-h-full object-contain" src={quote?.imageUrl || ""} alt="" />
                </div> */}
                <div className="flex justify-between flex-col min-h-screen py-10">
                    <div className="text-white max-w-[400px]">
                        <h2 className="bg-black/20 text-white rounded-xl">{devotional?.title}</h2>
                        <h3 className="bg-black/20  text-sm text-gray-500 rounded-xl">{devotional?.verse}</h3>
                    </div>

                    <div className="flex items-center flex-col space-y-3 max-w-[400px]">
                        <p className="text-xl text-white bg-black/20 p-2 rounded-xl">{devotional?.content}</p>
                    </div>

                    {devotional?.id && (
                        <div className="flex items-center justify-center mt-5">
                            <CompleteDevotional devotionalId={devotional.id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
import { db } from "@/lib/db";
import { CompleteDevotional } from "./_components/CompleteDevotional";

export default async function VerseDetails({ params }: { params: Promise<{ devotionalId: string }> }) {
    const { devotionalId } = await params;

    const devotional = await db.devotional.findUnique({
        where: { id: devotionalId }
    });

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
                        <CompleteDevotional devotionalId={devotional.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

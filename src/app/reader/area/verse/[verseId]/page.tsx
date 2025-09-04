import { db } from "@/lib/db";
import { CompleteVerse } from "./_components/CompleteVerse";

export default async function VerseDetails({ params }: { params: Promise<{ verseId: string }> }) {
    const { verseId } = await params;

    const verse = await db.verse.findUnique({
        where: { id: verseId }
    });

    return (
        <div style={{ backgroundImage: verse?.imageUrl ? `url(${verse.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
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

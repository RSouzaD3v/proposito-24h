import { db } from "@/lib/db";
import { CompleteDevotional } from "./_components/CompleteDevotional";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ScreenSubscription } from "../../_components/ScreenSubscription";

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

        const isFree = verifyAccess?.verse === true;
    const hasSubscription = !!subscription;

    if (!isFree && !hasSubscription) {
        <ScreenSubscription slug={devotional?.writer.slug || ""} />
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
                {devotional?.audioUrl && (
                    <div>
                        <audio controls preload="none" className="w-full">
                            <source src={devotional?.audioUrl as string} type="audio/mpeg" />
                            Seu navegador não suporta o player de áudio.
                        </audio>
                    </div>
                )}
                {devotional?.id && (
                    <div className="flex justify-center">
                        <CompleteDevotional devotionalId={devotional.id} devotionalContent={devotional?.content} />
                    </div>
                )}
            </div>
        </div>
    );
}

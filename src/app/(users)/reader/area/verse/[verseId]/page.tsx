import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { notFound } from "next/navigation";
import { CompleteVerse } from "./_components/CompleteVerse";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function VerseDetails({ params, searchParams }: { params: Promise<{ verseId: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const { verseId } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);
    const result = await apiFetch<any>(`/reader/content/verse/${verseId}`);

    if (result.status === 403) {
        const profile = await apiGet<ReaderProfile>("/reader/profile");
        return <ScreenSubscription slug={profile.writer?.slug || ""} />;
    }
    if (!result.ok) notFound();
    const verse = result.data;

    return (
        <div style={{ backgroundImage: verse?.imageUrl ? `url(${verse.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} 
        className="min-h-screen flex items-center  px-4 justify-center bg-linear-to-br from-gray-50 to-gray-200">
            <div className="flex w-full max-w-xl flex-col gap-4">
                <BackButton href={backHref} className="self-start" />
                <GlassCard strong className="flex w-full flex-col items-center space-y-8">
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
                </GlassCard>
            </div>
        </div>
    );
}

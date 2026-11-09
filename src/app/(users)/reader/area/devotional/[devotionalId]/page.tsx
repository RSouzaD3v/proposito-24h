import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { notFound } from "next/navigation";
import { CompleteDevotional } from "./_components/CompleteDevotional";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function VerseDetails({ params, searchParams }: { params: Promise<{ devotionalId: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const { devotionalId } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);
    const result = await apiFetch<any>(`/reader/content/devotional/${devotionalId}`);

    if (result.status === 403) {
        const profile = await apiGet<ReaderProfile>("/reader/profile");
        return <ScreenSubscription slug={profile.writer?.slug || ""} />;
    }
    if (!result.ok) notFound();
    const devotional = result.data;

    return (
        <div style={{ backgroundImage: devotional?.imageUrl ? `url(${devotional?.imageUrl}), 
        linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", 
        backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen flex items-center justify-center 
        bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] px-4 py-5">
            <div className="flex w-full max-w-xl flex-col gap-4">
                <BackButton href={backHref} className="self-start" />
                <GlassCard strong className="flex flex-col gap-8">
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
                </GlassCard>
            </div>
        </div>
    );
}

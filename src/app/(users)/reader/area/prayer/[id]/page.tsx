import { notFound } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import { CompletePrayer } from "./_components/CompletePrayer";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { resolveReaderBackHref } from "@/lib/readerBackHref";
import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";

export default async function PrayerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const { id } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);
    const result = await apiFetch<any>(`/reader/content/prayer/${id}`);

    if (result.status === 403) {
        const profile = await apiGet<ReaderProfile>("/reader/profile");
        return <ScreenSubscription slug={profile.writer?.slug || ""} />;
    }
    if (!result.ok) notFound();
    const prayer = result.data;
    const userCompletionPrayer = prayer.completed;

    return (
        <section style={{ backgroundImage: prayer?.imageUrl ? `url(${prayer?.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} 
        className="w-screen flex flex-col items-center justify-center py-10 px-4 min-h-screen">
            <div className="flex w-full max-w-xl flex-col gap-4">
            <BackButton href={backHref} className="self-start" />
            {!prayer ? (
                <GlassCard strong className="text-center text-gray-500">
                    <span className="block text-2xl mb-2">🙏</span>
                    Nenhuma oração encontrada.
                </GlassCard>
            ) : (
                <div className="space-y-8">
                    <GlassCard
                        strong
                        className="relative flex w-full flex-col items-center justify-center gap-4 md:max-w-[31.25rem]"
                    >
                        <h3 className="text-2xl font-bold text-black mb-3 flex items-center gap-2">
                                <span className="inline-block">🕊️</span>
                                {prayer.title}
                            </h3>
                            <p className="text-gray-700 mb-4 whitespace-pre-line">{prayer.content}</p>
                            <div className="absolute top-4 right-4">
                                {userCompletionPrayer ? (
                                    <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg">
                                    <FaCheck />
                                    </div>
                                ) : null}                               
                            </div>

                                {prayer.audioUrl && (
                                    <div className="mt-4 w-full">
                                        <audio controls className="w-full">
                                            <source src={prayer.audioUrl as string} type="audio/mpeg" />
                                            Seu navegador não suporta o elemento de áudio.
                                        </audio>
                                    </div>
                                )}

                            <div>
                                <CompletePrayer prayerId={prayer.id} />
                            </div>
                        </GlassCard>
                </div>
            )}
            </div>

        </section>
    );
}
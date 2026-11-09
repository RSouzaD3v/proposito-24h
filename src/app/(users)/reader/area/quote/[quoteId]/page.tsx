import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { notFound } from "next/navigation";
import { CompleteQuote } from "./_components/CompleteQuote";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function QuoteDetails({ params, searchParams }: { params: Promise<{ quoteId: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
    const { quoteId } = await params;
    const backHref = resolveReaderBackHref((await searchParams).from);
    const result = await apiFetch<any>(`/reader/content/quote/${quoteId}`);

    if (result.status === 403) {
        const profile = await apiGet<ReaderProfile>("/reader/profile");
        return <ScreenSubscription slug={profile.writer?.slug || ""} />;
    }
    if (!result.ok) notFound();
    const quote = result.data;

    return (
        <div style={{ backgroundImage: quote?.imageUrl ? `url(${quote.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="flex w-full max-w-xl flex-col gap-4">
                <BackButton href={backHref} className="self-start" />
                <GlassCard strong className="flex w-full flex-col items-center">
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
                </GlassCard>
            </div>
        </div>
    );
}

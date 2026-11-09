import { apiGetOrNull } from "@/lib/api/server";
import { notFound } from "next/navigation";
import BookFormatContent from "./_components/BookFormatContent";
import { BackButton } from "@/components/ui/back-button";

export default async function BookDetailsPage({ params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = await params;
    const bookDetails = await apiGetOrNull<any>(`/writer/publications/${bookId}/preview`);
    if (!bookDetails) notFound();

    return (
        <div className="bg-yellow-50 min-h-screen relative">
            <div className="absolute top-2 left-2 z-50">
                <BackButton href="/writer/publications/my-vitrine" />
            </div>

            <BookFormatContent
                pdfUrl={bookDetails?.pdfUrl}
                chapters={(bookDetails.chapters ?? []).map((chapter: any) => ({
                    ...chapter,
                    subtitle: chapter.subtitle ?? "",
                    coverUrl: chapter.coverUrl ?? undefined,
                }))}
            />
        </div>
    );
}

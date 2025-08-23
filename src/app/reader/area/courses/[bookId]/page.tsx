import { db } from "@/lib/db";
import ChapterSlider from "./_components/ChapterSlider";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { FaCrown } from "react-icons/fa";
import { BuyButton } from "./_components/BuyButton";
import PdfViewer from "@/app/writer/(check-subscription)/publications/my-vitrine/[bookId]/_components/PdfViewer";

export default async function BookDetailsPage({ params }: { params: Promise<{ bookId: string }> }) {
    const session = await getServerSession(authOptions);
    const { bookId } = await params;

    const bookDetails = await db.publication.findUnique({
        where: {
            id: bookId
        },
        select: {
            visibility: true,
            isPdf: true,
            pdfUrl: true,
            chapters: {
                select: {
                    title: true,
                    subtitle: true,
                    content: true,
                    coverUrl: true
                }
            }
        }
    });

    if(bookDetails?.visibility === 'PAID') {
        const purchase = await db.purchase.findFirst({
            where: {
                userId: session?.user.id,
                publication: {
                    id: bookId
                }
            }
        });

        if (!purchase) {
            // If no purchase found, handle accordingly (e.g., redirect to payment page)
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <Link className="absolute underline top-5 left-5" href={"/reader/area/courses"}>Voltar aos ebooks</Link>
                    <h2 className="text-2xl md:text-3xl flex flex-col items-center font-bold mb-4 text-white">
                        <FaCrown className="inline mb-2" />
                        Este ebook é pago
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Por favor, adquira o ebook para acessar o conteúdo.
                    </p>
                    {/* <Link
                        href={`/purchase/book/${bookId}`} // Adjust this link to your pricing or purchase page
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Comprar Livro
                    </Link> */}
                    <BuyButton publicationId={bookId} />
                </div>
            );
        }
    }

    return (
        <div className="bg-gray-950 min-h-screen relative">
            <Link
                className="absolute top-2 left-2 z-50 flex items-center gap-1 bg-gray-100 text-black p-2 rounded-sm w-fit"
                href={"/writer/publications/my-vitrine"}
            >
                <FiArrowLeft className="inline mr-2" />
                Voltar
            </Link>

            {/* Se for PDF */}
            {bookDetails?.isPdf && bookDetails?.pdfUrl ? (
                <div className="p-4 md:p-8">
                    <PdfViewer url={bookDetails.pdfUrl} />
                </div>
            ) : bookDetails?.chapters && bookDetails.chapters.length > 0 ? (
                <ChapterSlider
                    chapters={bookDetails.chapters.map((chapter) => ({
                        ...chapter,
                        subtitle: chapter.subtitle ?? "",
                        coverUrl: chapter.coverUrl ?? undefined,
                    }))}
                />
            ) : (
                <div className="text-center text-white py-20">Nenhum capítulo encontrado.</div>
            )}
        </div>
    );
}
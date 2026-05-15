import { db } from "@/lib/db";
import ChapterSlider from "./_components/ChapterSlider";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { FaCrown } from "react-icons/fa";
import { BuyButton } from "./_components/BuyButton";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import PdfViewer from "@/app/(users)/writer/(check-subscription)/publications/my-vitrine/[bookId]/_components/PdfViewer";
import { canAccessPublication, publicationAccessMode } from "@/lib/publicationAccess";

export default async function BookDetailsPage({ params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  const { bookId } = await params;

  const bookDetails = await db.publication.findUnique({
    where: { id: bookId },
    select: {
      visibility: true,
      price: true,
      writerId: true,
      title: true,
      isPdf: true,
      pdfUrl: true,
      writer: { select: { slug: true, name: true } },
      chapters: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          title: true,
          subtitle: true,
          content: true,
          coverUrl: true,
          order: true,
        },
      },
    },
  });

  if (!bookDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-lg">Livro não encontrado.</p>
        <Link href="/reader/area/courses" className="mt-4 text-blue-600 underline">
          Voltar aos ebooks
        </Link>
      </div>
    );
  }

  const mode = publicationAccessMode(bookDetails.visibility, bookDetails.price);

  if (mode !== "FREE" && session?.user?.id) {
    const [purchase, subscription, user] = await Promise.all([
      db.purchase.findFirst({
        where: { userId: session.user.id, publicationId: bookId, status: "SUCCESS" },
        select: { id: true },
      }),
      db.readerSubscription.findUnique({
        where: {
          reader_writer_unique: {
            readerId: session.user.id,
            writerId: bookDetails.writerId,
          },
        },
        select: {
          status: true,
          currentPeriodEnd: true,
          lifetime: true,
          cancelAtPeriodEnd: true,
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { freePlan: true },
      }),
    ]);

    const access = canAccessPublication({
      visibility: bookDetails.visibility,
      price: bookDetails.price,
      hasPurchase: !!purchase,
      subscription,
      platformFreePlan: !!user?.freePlan,
    });

    if (!access.allowed) {
      const slug = bookDetails.writer?.slug ?? "";
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <Link className="absolute left-5 top-5 underline" href="/reader/area/courses">
            Voltar aos ebooks
          </Link>
          <h2 className="mb-4 flex flex-col items-center text-2xl font-bold text-white md:text-3xl">
            <FaCrown className="mb-2 inline" />
            {mode === "SUBSCRIPTION" ? "Conteúdo para assinantes" : "Este ebook é pago"}
          </h2>
          <p className="mb-6 max-w-md text-gray-500">
            {access.reason ??
              (mode === "SUBSCRIPTION"
                ? "Assine o escritor para ler este conteúdo."
                : "Compre o ebook ou assine o escritor.")}
          </p>
          <div className="flex w-full max-w-md flex-col items-center justify-center gap-4">
            {mode === "PAID" && bookDetails.price && bookDetails.price >= 1 ? (
              <BuyButton publicationId={bookId} />
            ) : null}
            {slug ? (
              <div className="w-full rounded-xl border bg-white/95 p-4 text-left text-gray-900 shadow-lg">
                <SubscribeWidget writerId={bookDetails.writerId} />
              </div>
            ) : null}
          </div>
        </div>
      );
    }
  } else if (mode !== "FREE" && !session?.user?.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-white">Faça login para acessar este conteúdo.</p>
        <Link href="/sign-in" className="rounded-lg bg-blue-600 px-6 py-3 text-white">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Link
        className="absolute left-[5px] top-[5px] z-50 flex w-fit items-center gap-1 rounded-sm bg-gray-100 p-2 text-black md:left-2 md:top-2"
        href="/reader/area/courses"
      >
        <FiArrowLeft className="mr-2 inline" />
        Voltar
      </Link>

      {bookDetails.isPdf && bookDetails.pdfUrl ? (
        <div className="p-4 md:p-8">
          <PdfViewer url={bookDetails.pdfUrl} />
        </div>
      ) : bookDetails.chapters.length > 0 ? (
        <ChapterSlider
          bookId={bookId}
          chapters={bookDetails.chapters.map((chapter) => ({
            title: chapter.title,
            subtitle: chapter.subtitle ?? "",
            content: chapter.content,
            coverUrl: chapter.coverUrl ?? undefined,
          }))}
        />
      ) : (
        <div className="py-20 text-center text-black">Nenhum capítulo encontrado.</div>
      )}
    </div>
  );
}


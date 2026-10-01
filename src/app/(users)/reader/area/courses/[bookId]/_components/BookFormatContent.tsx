"use client";

import { useState } from "react";
import ChapterSlider from "./ChapterSlider";
import PdfViewer from "@/app/(users)/writer/(check-subscription)/publications/my-vitrine/[bookId]/_components/PdfViewer";

type Chapter = {
  title: string;
  subtitle: string;
  content: string;
  coverUrl?: string;
};

type Props = {
  bookId: string;
  pdfUrl?: string | null;
  chapters: Chapter[];
};

export default function BookFormatContent({ bookId, pdfUrl, chapters }: Props) {
  const hasPdf = Boolean(pdfUrl);
  const hasChapters = chapters.length > 0;
  const [view, setView] = useState<"read" | "pdf">(
    hasChapters ? "read" : "pdf"
  );

  if (!hasPdf && !hasChapters) {
    return (
      <div className="py-20 text-center text-black">
        Nenhum capítulo encontrado.
      </div>
    );
  }

  if (hasPdf && hasChapters) {
    return (
      <div>
        <div className="sticky top-0 z-40 flex justify-center gap-2 border-b bg-white/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setView("read")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ler no app
          </button>
          <button
            type="button"
            onClick={() => setView("pdf")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === "pdf"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Abrir PDF
          </button>
        </div>
        {view === "read" ? (
          <ChapterSlider bookId={bookId} chapters={chapters} />
        ) : (
          <div className="p-4 md:p-8">
            <PdfViewer url={pdfUrl!} />
          </div>
        )}
      </div>
    );
  }

  if (hasPdf) {
    return (
      <div className="p-4 md:p-8">
        <PdfViewer url={pdfUrl!} />
      </div>
    );
  }

  return <ChapterSlider bookId={bookId} chapters={chapters} />;
}

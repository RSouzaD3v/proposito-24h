"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChapterSlider from "@/app/(users)/reader/area/courses/[bookId]/_components/ChapterSlider";

type Chapter = { title: string; subtitle?: string; content: string; coverUrl?: string };

/** Leitor real recebendo do editor, a cada alteração, o capítulo que ainda não foi salvo. */
export function LiveChapter({
  bookId,
  bookTitle,
  chapters,
  initialIndex,
  libraryHref,
}: {
  bookId: string;
  bookTitle: string;
  chapters: Chapter[];
  initialIndex: number;
  libraryHref: string;
}) {
  const router = useRouter();
  const editing = Math.min(initialIndex, chapters.length);
  const [index, setIndex] = useState(editing);
  const [draft, setDraft] = useState<Chapter>(chapters[editing] ?? { title: "Novo capítulo", content: "" });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === "writer-preview:chapter") setDraft(event.data.chapter);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "writer-preview:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const merged = [...chapters.slice(0, editing), draft, ...chapters.slice(editing + 1)];

  return (
    <ChapterSlider
      bookId={`preview-${bookId}`}
      bookTitle={bookTitle}
      chapters={merged}
      index={index}
      onChange={setIndex}
      onExit={() => router.push(`/writer/preview/book/${bookId}`)}
      libraryHref={libraryHref}
    />
  );
}

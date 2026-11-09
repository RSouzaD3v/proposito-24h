import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { notFound } from "next/navigation";
import { CompleteStep } from "../../_components/CompleteStep";
import { ReadingHighlight, ReadingScene } from "../../_components/ReadingScene";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
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
  const item = result.data;

  return (
    <ReadingScene imageUrl={item.imageUrl} backHref={backHref} eyebrow="Palavra do dia" title={item.reference} scene="reader-scene-night">
      <ReadingHighlight>“{item.content}”</ReadingHighlight>
      <CompleteStep kind="verse" id={item.id} completed={item.completed} />
    </ReadingScene>
  );
}

import { apiFetch, apiGet } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { notFound } from "next/navigation";
import { CompleteStep } from "../../_components/CompleteStep";
import { ReadingAudio, ReadingScene, ReadingText } from "../../_components/ReadingScene";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { resolveReaderBackHref } from "@/lib/readerBackHref";

export default async function PrayerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  const { id } = await params;
  const backHref = resolveReaderBackHref((await searchParams).from);
  const result = await apiFetch<any>(`/reader/content/prayer/${id}`);

  if (result.status === 403) {
    const profile = await apiGet<ReaderProfile>("/reader/profile");
    return <ScreenSubscription slug={profile.writer?.slug || ""} />;
  }
  if (!result.ok) notFound();
  const item = result.data;

  return (
    <ReadingScene imageUrl={item.imageUrl} backHref={backHref} eyebrow="Oração do dia" title={item.title} scene="reader-scene-olive">
      <ReadingAudio src={item.audioUrl} />
      <ReadingText>{item.content}</ReadingText>
      <CompleteStep kind="prayer" id={item.id} completed={item.completed} />
    </ReadingScene>
  );
}

import ChapterStudio from "../_components/ChapterStudio";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapterId: string }> }) {
  const { slug, chapterId } = await params;
  return <ChapterStudio key={chapterId} slug={slug} chapterId={chapterId} />;
}

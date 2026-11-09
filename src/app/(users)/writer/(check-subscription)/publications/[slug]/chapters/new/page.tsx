import ChapterStudio from "../_components/ChapterStudio";

export default async function WriterPublicationChapterNewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ChapterStudio slug={slug} />;
}

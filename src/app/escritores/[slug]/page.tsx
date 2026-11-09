import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { apiPublicGet } from "@/lib/api/server";
import { siteUrl } from "@/lib/site-url";
import { WriterProfile } from "../_components/WriterProfile";
import { contentSummary, profilePath, type WriterProfileData } from "../_lib/directory";

type Props = { params: Promise<{ slug: string }> };

export const getWriterProfile = cache(async (encodedSlug: string) => {
  // O Next pode entregar o parâmetro ainda codificado; a API recebe sempre uma única codificação.
  const slug = encodeURIComponent(decodeURIComponent(encodedSlug));
  return apiPublicGet<WriterProfileData>(`/public/directory/writers/${slug}`, 300);
});

function descriptionOf(writer: WriterProfileData) {
  const name = writer.name.trim();
  const summary = contentSummary(writer);
  return summary
    ? `${name} na DevotionalApp: ${summary}. Crie sua conta e acompanhe todos os dias.`
    : `Conheça ${name} na DevotionalApp e acompanhe seus devocionais e leituras.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const writer = await getWriterProfile((await params).slug);
  if (!writer) return { title: "Escritor não encontrado | DevotionalApp", robots: { index: false } };

  const title = `${writer.name.trim()} | DevotionalApp`;
  const description = descriptionOf(writer);
  const url = profilePath(writer.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: writer.hasContent ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, siteName: "DevotionalApp", locale: "pt_BR", type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function WriterPage({ params }: Props) {
  const writer = await getWriterProfile((await params).slug);
  if (!writer) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${siteUrl()}${profilePath(writer.slug)}`,
    mainEntity: {
      "@type": "Person",
      name: writer.name.trim(),
      ...(writer.logoUrl && { image: writer.logoUrl }),
      description: descriptionOf(writer),
    },
  };

  return (
    <div className="reader-premium relative min-h-screen bg-[var(--reader-bg)] text-[var(--liquid-ink)]">
      <Header logo="/AppImages/ios/192.png" name="DevotionalApp" showPlatformLinks />
      <div className="reader-scene reader-scene-night h-32" />
      <main className="mx-auto max-w-xl px-5 py-8">
        <Link href="/escritores" className="text-sm font-semibold text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]">
          ← Todos os escritores
        </Link>
        <h1 className="sr-only">{writer.name.trim()}</h1>
        <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--reader-surface)] p-6">
          <WriterProfile writer={writer} />
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}

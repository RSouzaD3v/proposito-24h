import type { Metadata } from "next";
import { DocsBrowser } from "../_components/DocsBrowser";
import { WRITER_DOCS } from "../_content";

export const metadata: Metadata = {
  title: "Ajuda para escritores | DevotionalApp",
  description: "Como criar sua plataforma, publicar conteúdo diário e livros, convidar leitores e acompanhar resultados.",
  alternates: { canonical: "/docs/escritor" },
};

export default function WriterDocsPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl leading-tight">Ajuda para escritores</h1>
      <DocsBrowser sections={WRITER_DOCS} />
    </>
  );
}

import type { Metadata } from "next";
import { DocsBrowser } from "../_components/DocsBrowser";
import { READER_DOCS } from "../_content";

export const metadata: Metadata = {
  title: "Ajuda para leitores | DevotionalApp",
  description: "Como criar sua conta, ler o conteúdo do dia, usar a Bíblia, o Caderno de oração e sua assinatura.",
  alternates: { canonical: "/docs/leitor" },
};

export default function ReaderDocsPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl leading-tight">Ajuda para leitores</h1>
      <DocsBrowser sections={READER_DOCS} />
    </>
  );
}

import type { Metadata } from "next";
import { DocsHeader } from "./_components/DocsHeader";

export const metadata: Metadata = {
  title: "Ajuda | DevotionalApp",
  description: "Guias simples para leitores e escritores usarem a DevotionalApp.",
};

export default function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="reader-premium min-h-screen bg-[var(--reader-bg)] text-[var(--liquid-ink)]">
      <DocsHeader />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}

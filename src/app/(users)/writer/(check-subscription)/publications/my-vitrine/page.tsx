"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { DevicePreview } from "@/components/writer/DevicePreview";

export default function WriterLibraryPreviewStudio() {
  const [drafts, setDrafts] = useState(false);

  return (
    <div className="flex h-screen flex-col gap-3 px-4 py-4 md:px-8">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <BackButton href="/writer/publications" label="Publicações" />
        <div>
          <h1 className="text-xl font-bold text-[var(--liquid-ink)]">Prévia da sua biblioteca</h1>
          <p className="text-sm text-[var(--liquid-muted)]">É a tela real do leitor. Clique em um livro para abrir.</p>
        </div>
      </header>
      <DevicePreview
        src={`/writer/preview/library${drafts ? "?drafts=1" : ""}`}
        className="flex-1"
        controls={
          <label className="glass-surface flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--liquid-ink)]">
            <input type="checkbox" checked={drafts} onChange={(event) => setDrafts(event.target.checked)} />
            Incluir rascunhos
          </label>
        }
      />
    </div>
  );
}

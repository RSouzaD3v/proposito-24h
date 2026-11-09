"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { DevicePreview } from "@/components/writer/DevicePreview";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";
import { cn } from "@/lib/utils";

const ACCESS = [
  { key: "reader", label: "Com acesso" },
  { key: "locked", label: "Sem acesso" },
] as const;

export function BookPreviewStudio({ book }: { book: { id: string; title: string; status: string; visibility: string } }) {
  const [access, setAccess] = useState<(typeof ACCESS)[number]["key"]>("reader");

  return (
    <div className="flex h-screen flex-col gap-3 px-4 py-4 md:px-8">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <BackButton href="/writer/publications" label="Publicações" />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-[var(--liquid-ink)]">
            {book.title} <PublicationStatusBadge status={book.status} />
          </h1>
          <p className="text-sm text-[var(--liquid-muted)]">
            {book.status === "PUBLISHED"
              ? "É assim que o leitor vê este livro."
              : "Só você vê este livro até publicá-lo."}
          </p>
        </div>
      </header>
      <DevicePreview
        src={`/writer/preview/book/${book.id}${access === "locked" ? "?as=locked" : ""}`}
        className="flex-1"
        controls={
          book.visibility === "PAID" ? (
            <div className="glass-surface flex items-center gap-0.5 rounded-full p-1">
              {ACCESS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={access === key}
                  onClick={() => setAccess(key)}
                  className={cn(
                    "h-9 rounded-full px-3 text-sm font-medium transition-colors",
                    access === key ? "bg-[var(--liquid-accent)] text-white" : "text-[var(--liquid-muted)] hover:bg-white/70",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />
    </div>
  );
}

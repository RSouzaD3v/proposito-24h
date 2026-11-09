"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { profilePath } from "../_lib/directory";

export function ShareButton({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${profilePath(slug)}`;
    const title = name.trim();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Conheça ${title} na DevotionalApp`, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    // Navegadores sem menu de compartilhamento recebem o link copiado.
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label = copied ? "Link copiado" : `Compartilhar ${name.trim()}`;
  return (
    <button
      type="button"
      onClick={share}
      aria-label={label}
      title={label}
      className="grid size-12 shrink-0 place-items-center rounded-xl border border-[var(--input)] transition hover:bg-[var(--muted)]"
    >
      {copied ? <Check className="size-5" aria-hidden /> : <Share2 className="size-5" aria-hidden />}
    </button>
  );
}

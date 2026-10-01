'use client';
import { useState } from "react";
import { Clipboard } from "lucide-react";

export const ClipboardLink = ({ slug }: { slug: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://${slug}.devotionalapp.com.br/reader/register`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/40"
            onClick={handleCopy}
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[var(--liquid-accent)] shadow-sm">
                <Clipboard className="size-5" />
            </span>
            <span className="text-base font-medium text-[var(--liquid-ink)]">
                {copied ? "Link copiado!" : "Copiar meu link para cliente."}
            </span>
        </button>
    );
};

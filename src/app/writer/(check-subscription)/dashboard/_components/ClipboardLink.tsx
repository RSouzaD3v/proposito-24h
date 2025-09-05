'use client';
import { useState } from "react";
import { FaClipboard } from "react-icons/fa";
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
            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer"
            onClick={handleCopy}
        >
            <FaClipboard className="inline-block mr-1" />
            <h2>
                {copied ? "Link copiado!" : "Copiar meu link para cliente."}
            </h2>
        </button>
    );
};
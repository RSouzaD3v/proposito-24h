'use client';
import { FaClipboard } from "react-icons/fa";

export const ClipboardLink = ({ slug }: {slug: string}) => {
    return (
        <button className="flex items-center gap-2 hover:bg-blue-300 p-3 rounded-xl cursor-pointer" onClick={() => {
          navigator.clipboard.writeText(`https://${slug}.example.com/reader/register`);
        }}>
            <FaClipboard className="inline-block mr-1" />
            Clique para copiar: <b>https://{slug}.example.com/reader/register</b>
        </button>
    )
}
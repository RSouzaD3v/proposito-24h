"use client";
import { useState } from "react";

interface WriterAiButtonProps {
  onInsert?: (text: string) => void;
}

function extractTextFromAny(data: any): string | null {
  // ✅ seu backend
  if (typeof data?.result === "string") return data.result;

  // formatos comuns (mantidos como fallback)
  if (typeof data?.text === "string") return data.text;
  const openai = data?.choices?.[0]?.message?.content;
  if (typeof openai === "string") return openai;
  const openaiLegacy = data?.choices?.[0]?.text;
  if (typeof openaiLegacy === "string") return openaiLegacy;
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((p: any) => p?.text)
      .filter((t: any) => typeof t === "string" && t.trim().length > 0)
      .join("\n");
    if (joined) return joined;
  }
  if (typeof data?.output === "string") return data.output;
  if (typeof data === "string") return data;

  return null;
}

export default function WriterAiButton({ onInsert }: WriterAiButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [idea, setIdea] = useState("");

  const handleClick = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai/writerAi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: idea }),
      });

      if (!response.ok) {
        console.error("WriterAI HTTP error:", response.status);
        return;
      }

      const data = await response.json();
      const text = extractTextFromAny(data);

      if (!text) {
        console.warn("WriterAI sem texto reconhecível. Payload:", data);
      } else {
        onInsert?.(text);   // ✅ injeta no textarea do pai
        setIsOpen(false);   // fecha modal
        setIdea("");        // limpa input
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isOpen ? (
        <div className="fixed flex items-center justify-center flex-col top-0 left-0 w-screen min-h-screen h-full bg-black/30 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Escreva sua ideia</h2>
            <div className="mb-4">
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                type="text"
                placeholder="Digite aqui..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Gerando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out w-8 h-8 bg-gradient-to-l from-blue-500 to-indigo-600 text-white font-bold rounded-full"
        >
          IA
        </button>
      )}
    </div>
  );
}

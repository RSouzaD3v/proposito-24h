"use client";
import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<"devotional" | "quote" | "verse">("devotional");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResp(null);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`/api/massive/${kind}s/import`, { method: "POST", body: fd });
    const j = await r.json();
    setResp(j);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-indigo-700 text-center mb-2">Importar Arquivo</h1>

        {/* Links de exemplos */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-indigo-600">Baixe um modelo de exemplo:</span>
          <a
            href="/spreadsheets/devocional-exemplo.xlsx"
            download="devocional-exemplo.xlsx"
            className="text-indigo-600 hover:underline"
          >
            📘 Devocional (exemplo)
          </a>
          <a
            href="/spreadsheets/citacao-exemplo.xlsx"
            download="citacao-exemplo.xlsx"
            className="text-indigo-600 hover:underline"
          >
            💬 Citação (exemplo)
          </a>
          <a
            href="/spreadsheets/versiculo-exemplo.xlsx"
            download="versiculo-exemplo.xlsx"
            className="text-indigo-600 hover:underline"
          >
            ✝️ Versículo (exemplo)
          </a>
        </div>

        {/* Select de tipo */}
        <div className="flex justify-center">
          <select
            value={kind}
            onChange={e => setKind(e.target.value as any)}
            className="border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="devotional">Devocional</option>
            <option value="quote">Citação</option>
            <option value="verse">Versículo</option>
          </select>
        </div>

        {/* Upload */}
        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-indigo-600 mb-1">Arquivo (.xls, .xlsx)</span>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
            />
          </label>
          <button
            disabled={!file || loading}
            className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar"
            )}
          </button>
        </form>

        {/* Resposta */}
        {resp && (
          <div className="mt-4">
            <span className="block text-sm font-medium text-indigo-600 mb-1">Resposta:</span>
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(resp, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<"devotional"|"quote"|"verse">("devotional");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setResp(null);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`/api/massive/${kind}s/import`, { method: "POST", body: fd });
    const j = await r.json(); setResp(j); setLoading(false);
  }

  return (
    <main className="p-6 space-y-4">
      <select value={kind} onChange={e => setKind(e.target.value as any)} className="border p-2">
        <option value="devotional">Devotional</option>
        <option value="quote">Quote</option>
        <option value="verse">Verse</option>
      </select>
      <form onSubmit={handleUpload} className="space-y-3">
        <input type="file" accept=".xls,.xlsx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <button disabled={!file || loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {resp && <pre className="bg-zinc-900 text-zinc-100 p-4 rounded text-sm overflow-auto">
{JSON.stringify(resp, null, 2)}
      </pre>}
    </main>
  );
}

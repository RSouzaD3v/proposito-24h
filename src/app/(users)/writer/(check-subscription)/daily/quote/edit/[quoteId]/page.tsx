"use client";
import S3Uploader from "@/components/S3Uploader";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ButtonSpinner, LoadingState } from "@/components/ui/loading-state";
import { useEffect, useState } from "react";

const TZ = "America/Sao_Paulo";
const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: TZ }); // yyyy-MM-dd

export default function QuoteEditPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const [form, setForm] = useState({
    nameAuthor: "",
    content: "",
    verse: "",
    imageUrl: "",
    referenceDay: 1,
    date: todayStr, // sempre string yyyy-MM-dd
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const { quoteId } = await params;
      const res = await fetch(`/api/writer/daily/quote/edit/${quoteId}`);
      if (!res.ok) throw new Error("Failed to fetch quote");
      const data = await res.json();

      // IMPORTANTE: derive a data como "yyyy-MM-dd" na TZ correta
      const dateStr = new Date(data.quote.createdAt).toLocaleDateString("en-CA", { timeZone: TZ });

      setForm({
        nameAuthor: data.quote.nameAuthor ?? "",
        content: data.quote.content ?? "",
        verse: data.quote.verse ?? "",
        imageUrl: data.quote.imageUrl ?? "",
        referenceDay: data.quote.referenceDay ?? 1,
        date: dateStr, // já pronto para <input type="date">
      });

      setLoadingData(false);
    })();
  }, [params]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { quoteId } = await params;
      const res = await fetch(`/api/writer/daily/quote/edit/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // form.date é "yyyy-MM-dd"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save quote");
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return <LoadingState variant="full" label="Carregando dados..." />;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
      <BackButton href="/writer/daily/quote" className="mb-6" />

      <h1 className="text-2xl font-bold mb-6 text-center">Editar Citação</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Autor */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nameAuthor">Autor</label>
          <input id="nameAuthor" name="nameAuthor" value={form.nameAuthor} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Citação */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="content">Citação</label>
          <textarea id="content" name="content" value={form.content} onChange={handleChange} required rows={4} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Versículo */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="verse">Versículo</label>
          <input id="verse" name="verse" value={form.verse} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="verse">Dia referência</label>
          <input
            type="number"
            id="referenceDay"
            name="referenceDay"
            min={0}
            value={form.referenceDay}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="1"
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}       
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Imagem (opcional) */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="image">Escolher imagem (opcional)</label>
          <select id="image" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-52 mb-2">
            <option value="">Selecione uma imagem</option>
            {Array(30).fill(0).map((_, i) => (
              <option key={i} value={`/background-images/${i + 1}.webp`}>{i + 1}.webp</option>
            ))}
          </select>
          {form.imageUrl && <img src={form.imageUrl} alt="Imagem selecionada" className="mt-2 rounded shadow w-40 h-40 object-cover" />}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL da Imagem (opcional)</label>
          <S3Uploader folder="quotes" onUploaded={(file) => setForm((p) => ({ ...p, imageUrl: file.publicUrl }))} />
        </div>

        <Button type="submit" disabled={loading} variant="glass-primary" className="w-full rounded-full">
          {loading && <ButtonSpinner />}
          {loading ? "Salvando..." : "Salvar Citação"}
        </Button>

        {success && <div className="text-green-600 text-center font-medium mt-2">Citação salva com sucesso!</div>}
      </form>
    </div>
  );
}

"use client";
import S3Uploader from "@/components/S3Uploader";
import S3UploaderPdf from "@/components/S3UploaderPdf";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { useRouter } from "next/navigation";
import { useState } from "react";

const publicationTypes = [
  { value: "EBOOK", label: "Ebook" },
];

const publicationStatuses = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "PUBLISHED", label: "Publicado" },
];

const visibilities = [
  { value: "FREE", label: "Grátis para leitores" },
  { value: "PAID", label: "Venda avulsa (defina preço)" },
  { value: "SUBSCRIPTION", label: "Somente assinantes" },
];

export default function WriterPublicationCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: "EBOOK",
    status: "DRAFT",
    visibility: "FREE",
    price: "",
    currency: "BRL",
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    coverUrl: "",
    body: "",
    tags: "",
    isPdf: false,
    pdfUrl: "",
    category: "Outros"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const hasPdf = Boolean(form.pdfUrl);

    try {
      const res = await fetch("/api/writer/publications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isPdf: hasPdf,
          pdfUrl: hasPdf ? form.pdfUrl : null,
          price:
            form.visibility === "PAID" ? Number(form.price) : undefined,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar publicação");

      setSuccess(true);
      setForm({
        type: "DEVOTIONAL",
        status: "DRAFT",
        visibility: "FREE",
        price: "",
        currency: "BRL",
        slug: "",
        title: "",
        subtitle: "",
        description: "",
        coverUrl: "",
        body: "",
        tags: "",
        isPdf: false,
        pdfUrl: "",
        category: "Outros"
      });

      router.push("/writer/publications");
    } catch (err) {
      setError("Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="max-w-3xl mx-auto mt-8" padding="lg">
      <BackButton href="/writer/publications" label="Voltar para Publicações" className="mb-4" />

      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">
        Nova Publicação
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tipo */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              {publicationTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              {publicationStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">Acesso do leitor</label>
            <select
              name="accessMode"
              value={
                form.visibility === "FREE"
                  ? "FREE"
                  : Number(form.price) === 0
                    ? "SUBSCRIPTION"
                    : "PAID"
              }
              onChange={(e) => {
                const mode = e.target.value;
                if (mode === "FREE") {
                  setForm((prev) => ({ ...prev, visibility: "FREE", price: "" }));
                } else if (mode === "SUBSCRIPTION") {
                  setForm((prev) => ({ ...prev, visibility: "PAID", price: "0" }));
                } else {
                  setForm((prev) => ({
                    ...prev,
                    visibility: "PAID",
                    price: prev.price === "0" ? "" : prev.price,
                  }));
                }
              }}
              className="w-full border rounded-lg p-2"
            >
              {visibilities.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {form.visibility === "PAID" && Number(form.price) > 0 && (
            <>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  Preço (centavos)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  min={0}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  Moeda
                </label>
                <input
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  maxLength={3}
                  required
                />
              </div>
            </>
          )}

          {/* PDF opcional — pode coexistir com a versão escrita (capítulos) */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              PDF (opcional)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Você pode enviar um PDF e também criar capítulos escritos no app.
            </p>
            <S3UploaderPdf
              folder="ebook"
              onUploaded={({ publicUrl }) =>
                setForm((prev) => ({ ...prev, pdfUrl: publicUrl, isPdf: true }))
              }
            />
            {form.pdfUrl && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-sm text-green-600">PDF enviado com sucesso.</p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, pdfUrl: "", isPdf: false }))
                  }
                  className="text-sm text-red-600 underline"
                >
                  Remover PDF
                </button>
              </div>
            )}
          </div>

          {/* Slug */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              Slug (URL)
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Título */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Título</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Subtítulo
            </label>
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Categoria
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Descrição */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              Descrição
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              rows={2}
            />
          </div>

          {/* Capa */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              Capa
            </label>
            <S3Uploader
              folder="cover-books-images"
              onUploaded={({ publicUrl }) =>
                setForm((prev) => ({ ...prev, coverUrl: publicUrl }))
              }
            />
            {form.coverUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  width={200}
                  height={128}
                  src={form.coverUrl}
                  alt="Capa"
                  className="h-32 object-cover rounded shadow"
                />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              Conteúdo
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-gray-700">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="oração, família"
            />
          </div>
        </div>

        {/* Botão */}
        <Button
          type="submit"
          variant="glass-primary"
          className="w-full rounded-full text-lg"
          disabled={loading}
        >
          {loading && <ButtonSpinner />}
          {loading ? "Salvando..." : "Criar Publicação"}
        </Button>

        {success && (
          <div className="text-green-600 font-semibold text-center">
            Publicação criada com sucesso!
          </div>
        )}
        {error && (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        )}
      </form>
    </GlassCard>
  );
}

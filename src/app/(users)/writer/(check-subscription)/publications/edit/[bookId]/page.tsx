"use client";
import S3Uploader from "@/components/S3Uploader";
import S3UploaderPdf from "@/components/S3UploaderPdf";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ButtonSpinner, LoadingState } from "@/components/ui/loading-state";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function WriterPublicationCreatePage({ params }: { params: Promise<{ bookId: string }> }) {
    const router = useRouter();
    const [form, setForm] = useState({
        type: "DEVOTIONAL",
        status: "DRAFT",
        visibility: "FREE",
        price: "",
        currency: "BRL",
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
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { bookId } = await params;
                const res = await fetch(`/api/writer/publications/edit/${bookId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Erro ao carregar publicação");
                setForm({
                    type: data.type ?? "EBOOK",
                    status: data.status ?? "DRAFT",
                    visibility: data.visibility ?? "FREE",
                    price: data.price != null ? String(data.price) : "",
                    currency: data.currency ?? "BRL",
                    title: data.title ?? "",
                    subtitle: data.subtitle ?? "",
                    description: data.description ?? "",
                    coverUrl: data.coverUrl ?? "",
                    body: data.body ?? "",
                    tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags ?? ""),
                    isPdf: data.isPdf === true || data.isPdf === "true",
                    pdfUrl: data.pdfUrl ?? "",
                    category: data.category ?? "Outros",
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar publicação");
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [params]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        const { bookId } = await params;
        const hasPdf = Boolean(form.pdfUrl);

        try {
            const res = await fetch(`/api/writer/publications/edit/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    subtitle: form.subtitle,
                    description: form.description,
                    coverUrl: form.coverUrl,
                    visibility: form.visibility,
                    status: form.status,
                    currency: form.currency,
                    category: form.category,
                    body: form.body,
                    tags: form.tags,
                    isPdf: hasPdf,
                    pdfUrl: hasPdf ? form.pdfUrl : null,
                    price:
                        form.visibility === "PAID"
                            ? form.price === ""
                                ? 0
                                : Number(form.price)
                            : null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Erro ao atualizar publicação");
            setSuccess(true);

            router.push("/writer/publications");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingState variant="full" label="Carregando dados..." />;
    }

    return (
        <section className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 mb-10 border border-gray-100">
            <BackButton href="/writer/publications" label="Voltar às Publicações" className="mb-4" />
            <h1 className="text-3xl font-extrabold mb-2 text-center text-blue-700">Atualizar Publicação</h1>
            <p className="mb-8 text-center text-gray-500">Edite os detalhes da sua publicação abaixo</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Tipo</label>
                        <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200">
                            {publicationTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200">
                            {publicationStatuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Acesso do leitor</label>
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
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                        >
                            {visibilities.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    {form.visibility === "PAID" && Number(form.price) > 0 && (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block font-semibold text-gray-700 mb-1">Preço (centavos)</label>
                                <input
                                    type="number"
                                    name="price"
                                    min={0}
                                    value={Number(form.price)}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                                    required={form.visibility === "PAID"}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Moeda</label>
                                <select name="currency" id="currency" value={form.currency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200" required={form.visibility === "PAID"}>
                                    <option value="BRL">BRL</option>
                                </select>
                            </div>
                        </div>
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
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                        <input
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                            placeholder="oração, família"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Título</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Subtítulo</label>
                        <input
                            type="text"
                            name="subtitle"
                            value={form.subtitle}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Descrição</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">URL da Capa</label>
                        <S3Uploader folder="cover-books-images" onUploaded={({ publicUrl }) => {
                            setForm(prev => ({ ...prev, coverUrl: publicUrl }));
                        }} />
                        {/* <input
                            type="text"
                            name="coverUrl"
                            value={form.coverUrl}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                        /> */}
                        {form.coverUrl && (
                            <img src={form.coverUrl} alt="Capa" className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200" />
                        )}
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
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Conteúdo</label>
                        <textarea
                            name="body"
                            value={form.body ?? ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                            rows={6}
                        />
                    </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                    <Button
                        type="submit"
                        variant="glass-primary"
                        className="w-full rounded-full text-lg"
                        disabled={loading}
                    >
                        {loading && <ButtonSpinner />}
                        {loading ? "Salvando..." : "Salvar Publicação"}
                    </Button>
                    {success && <div className="text-green-600 font-semibold text-center">Publicação atualizada com sucesso!</div>}
                    {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
                </div>
            </form>
        </section>
    );
}
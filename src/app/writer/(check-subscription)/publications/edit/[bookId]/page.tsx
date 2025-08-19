"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const publicationTypes = [
    { value: "DEVOTIONAL", label: "Devocional" },
    { value: "EBOOK", label: "Ebook" },
];

const publicationStatuses = [
    { value: "DRAFT", label: "Rascunho" },
    { value: "PUBLISHED", label: "Publicado" },
];

const visibilities = [
    { value: "FREE", label: "Grátis" },
    { value: "PAID", label: "Pago" },
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
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const { bookId } = await params;
            const res = await fetch(`/api/writer/publications/edit/${bookId}`);
            const data = await res.json();
            setForm(data);
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

        try {
            const res = await fetch(`/api/writer/publications/edit/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: form.visibility === "PAID" ? Number(form.price) : undefined,
                    tags: form.tags,
                }),
            });
            if (!res.ok) throw new Error("Erro ao criar publicação");
            setSuccess(true);

            router.push("/writer/publications");
        } catch (err) {
            setError("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 mb-10 border border-gray-100">
            <Link href={`/writer/publications`} className="text-blue-600 hover:underline mb-4 inline-block">
                Voltar às Publicações
            </Link>
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
                        <label className="block font-semibold text-gray-700 mb-1">Visibilidade</label>
                        <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200">
                            {visibilities.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    {form.visibility === "PAID" && (
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
                        <input
                            type="text"
                            name="coverUrl"
                            value={form.coverUrl}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
                        />
                        {form.coverUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.coverUrl} alt="Capa" className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200" />
                        )}
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
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-lg shadow"
                        disabled={loading}
                    >
                        {loading ? "Salvando..." : "Salvar Publicação"}
                    </button>
                    {success && <div className="text-green-600 font-semibold text-center">Publicação criada com sucesso!</div>}
                    {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
                </div>
            </form>
        </section>
    );
}
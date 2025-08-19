"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function WriterPublicationCreatePage() {
    const router = useRouter();
    const [form, setForm] = useState({
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
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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

        try {
            const res = await fetch("/api/writer/publications/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: form.visibility === "PAID" ? Number(form.price) : undefined,
                    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
            });

            router.push("/writer/publications");
        } catch (err) {
            setError("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-3xl mx-auto p-4 sm:p-8 bg-white rounded-xl shadow-lg mt-8">
            <Link href="/writer/publications">
                Voltar para Publicações
            </Link>
            <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">Nova Publicação</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Tipo</label>
                        <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                            {publicationTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                            {publicationStatuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Visibilidade</label>
                        <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                            {visibilities.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    {form.visibility === "PAID" && (
                        <>
                            <div>
                                <label className="block font-semibold mb-1 text-gray-700">Preço (centavos)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    min={0}
                                    required={form.visibility === "PAID"}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1 text-gray-700">Moeda</label>
                                <input
                                    type="text"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    maxLength={3}
                                    required={form.visibility === "PAID"}
                                />
                            </div>
                        </>
                    )}
                    <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-gray-700">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Título</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Subtítulo</label>
                        <input
                            type="text"
                            name="subtitle"
                            value={form.subtitle}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-gray-700">Descrição</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            rows={2}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-gray-700">URL da Capa</label>
                        <input
                            type="text"
                            name="coverUrl"
                            value={form.coverUrl}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                        />
                        {form.coverUrl && (
                            <div className="mt-2 flex justify-center">
                                <img width={200} height={128} src={form.coverUrl} alt="Capa" className="h-32 object-cover rounded shadow" />
                            </div>
                        )}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-gray-700">Conteúdo</label>
                        <textarea
                            name="body"
                            value={form.body}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            rows={6}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-gray-700">Tags (separadas por vírgula)</label>
                        <input
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            placeholder="oração, família"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-lg shadow"
                    disabled={loading}
                >
                    {loading ? "Salvando..." : "Criar Publicação"}
                </button>
                {success && <div className="text-green-600 font-semibold text-center">Publicação criada com sucesso!</div>}
                {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
            </form>
        </section>
    );
}
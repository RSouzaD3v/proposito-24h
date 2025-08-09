"use client";
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
            console.log(err);
            setError("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
            <h1 className="text-2xl font-bold mb-4">Atualizar Publicação</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Tipo</label>
                    <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded p-2">
                        {publicationTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2">
                        {publicationStatuses.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium">Visibilidade</label>
                    <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border rounded p-2">
                        {visibilities.map((v) => (
                            <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                    </select>
                </div>
                {form.visibility === "PAID" && (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block font-medium">Preço (centavos)</label>
                            <input
                                type="number"
                                name="price"
                                min={0}
                                value={Number(form.price)}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                required={form.visibility === "PAID"}
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Moeda</label>
                            <select name="currency" id="currency" value={form.currency} onChange={handleChange} className="w-full border rounded p-2" required={form.visibility === "PAID"}>
                                <option value="BRL">BRL</option>
                            </select>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block font-medium">Título</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium">Subtítulo</label>
                    <input
                        type="text"
                        name="subtitle"
                        value={form.subtitle}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Descrição</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        rows={2}
                    />
                </div>
                <div>
                    <label className="block font-medium">URL da Capa</label>
                    <input
                        type="text"
                        name="coverUrl"
                        value={form.coverUrl}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                    {/* {form.coverUrl && (
                        <Image width={200} height={128} src={form.coverUrl} alt="Capa" className="mt-2 h-32 object-cover rounded" />
                    )} */}
                </div>
                <div>
                    <label className="block font-medium">Conteúdo</label>
                    <textarea
                        name="body"
                        value={form.body}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        rows={6}
                    />
                </div>
                <div>
                    <label className="block font-medium">Tags (separadas por vírgula)</label>
                    <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        placeholder="oração, família"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? "Salvando..." : "Salvar Publicação"}
                </button>
                {success && <div className="text-green-600 font-medium">Publicação criada com sucesso!</div>}
                {error && <div className="text-red-600 font-medium">{error}</div>}
            </form>
        </section>
    );
}
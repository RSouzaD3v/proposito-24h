"use client";
import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";



export default function DevotionalEditPage({ params }: { params: Promise<{ devotionalId: string }> }) {
    const [form, setForm] = useState({
        title: "",
        content: "",
        verse: "",
        imageUrl: "",
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchDevotional = async () => {
            setLoadingData(true);
            const { devotionalId } = await params;
            const response = await fetch(`/api/writer/daily/devotional/edit/${devotionalId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch devotional");
            }
            const data = await response.json();
            setForm({
                title: data.devotional.title,
                content: data.devotional.content,
                verse: data.devotional.verse,
                imageUrl: data.devotional.imageUrl || "",
                date: data.devotional.date || new Date().toISOString().split("T")[0],
            });
            setLoadingData(false);
        };
        fetchDevotional();
    }, [params]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { devotionalId } = await params;
            const response = await fetch(`/api/writer/daily/devotional/edit/${devotionalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error("Failed to create quote");
            }

            const data = await response.json();
            console.log("Quote created successfully:", data);
            setSuccess(true);
        } catch (error) {
            console.error("Error creating quote:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <h1 className="text-lg font-semibold text-blue-700">Carregando dados...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <Link href="/writer/daily/devotional" className="flex items-center gap-2 mb-6 text-blue-600">
                <FaArrowLeft size={24} />
                Voltar
            </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Editar Citação</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="nameAuthor">
                        Título
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Título do Devocional"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="content">
                        Conteúdo
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Digite a citação"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="verse">
                        Versículo
                    </label>
                    <input
                        type="text"
                        id="verse"
                        name="verse"
                        value={form.verse}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Ex: João 3:16"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="date">
                        Data
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                        Escolher imagem (opcional)
                    </label>
                    <select
                        className="w-52 mb-2"
                        name="image"
                        id="image"
                        value={form.imageUrl}
                        onChange={e => setForm({ ...form, imageUrl: `/background-images/${e.target.value}` })}
                    >
                        <option value="">Selecione uma imagem</option>
                        {Array(30).fill(0).map((_, i) => (
                            <option key={i} value={`${i + 1}.webp`}>
                                {`${i + 1}.webp`}
                            </option>
                        ))}
                    </select>
                    {form.imageUrl && (
                        <img
                            src={form.imageUrl}
                            alt="Imagem selecionada"
                            className="mt-2 rounded shadow w-40 h-40 object-cover"
                        />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                        Imagem
                    </label>
                    <S3Uploader folder="devotional" onUploaded={(file) => setForm({ ...form, imageUrl: file.publicUrl })} />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Salvando..." : "Salvar Citação"}
                </button>
                {success && (
                    <div className="text-green-600 text-center font-medium mt-2">
                        Citação salva com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}
"use client";
import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { date } from "zod";

export default function DevotionalNewPage() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        verse: "",
        imageUrl: "",
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/writer/daily/devotional/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error("Failed to create devotional");
            }

            setSuccess(true);
            setForm({ title: "", content: "", verse: "", imageUrl: "", date: new Date().toISOString().split("T")[0] });
        } catch (error) {
            console.error("Error creating devotional:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <Link href="/writer/daily/devotional" className="flex items-center gap-2 mb-6 text-blue-600">
                <FaArrowLeft size={24} />
                Voltar
            </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Criar Novo Devocional</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="title">
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
                        placeholder="Título do devocional"
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
                        rows={6}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Digite o conteúdo do devocional"
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
                    {loading ? "Salvando..." : "Salvar Devocional"}
                </button>
                {success && (
                    <div className="text-green-600 text-center font-medium mt-2">
                        Devocional criado com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}

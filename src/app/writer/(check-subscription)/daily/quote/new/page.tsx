"use client";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";



export default function QuoteNewPage() {
    const [form, setForm] = useState({
        nameAuthor: "",
        content: "",
        verse: "",
        imageUrl: "",
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
            const response = await fetch("/api/writer/daily/quote/new", {
                method: "POST",
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
            setForm({ nameAuthor: "", content: "", verse: "", imageUrl: "" });
        } catch (error) {
            console.error("Error creating quote:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <Link href="/writer/daily/quote" className="flex items-center gap-2 mb-6 text-blue-600">
                <FaArrowLeft size={24} />
                Voltar
            </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Criar Nova Citação</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="nameAuthor">
                        Autor
                    </label>
                    <input
                        type="text"
                        id="nameAuthor"
                        name="nameAuthor"
                        value={form.nameAuthor}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nome do autor"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="content">
                        Citação
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
                    <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                        URL da Imagem (opcional)
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
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
                        Citação criada com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}
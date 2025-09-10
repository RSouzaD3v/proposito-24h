"use client";
import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";



export default function VerseNewPage() {
    const [form, setForm] = useState({
        content: "",
        reference: "",
        imageUrl: "",
        date: new Date().toISOString().split("T")[0],
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
            const response = await fetch("/api/writer/daily/verse/new", {
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
            setForm({ content: "", reference: "", imageUrl: "", date: new Date().toISOString().split("T")[0] });
        } catch (error) {
            console.error("Error creating quote:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <Link href="/writer/daily/verse" className="flex items-center gap-2 mb-6 text-blue-600">
                <FaArrowLeft size={24} />
                Voltar
            </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Criar Nova Passagem</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="content">
                        Passagem
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Digite a passagem"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="reference">
                        Referência - Versículo
                    </label>
                    <input
                        type="text"
                        id="reference"
                        name="reference"
                        value={form.reference}
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
                    <S3Uploader folder="verse" onUploaded={(file) => setForm({ ...form, imageUrl: file.publicUrl })} />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Salvando..." : "Salvar Passagem"}
                </button>
                {success && (
                    <div className="text-green-600 text-center font-medium mt-2">
                        Passagem criada com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}
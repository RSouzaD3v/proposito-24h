"use client";
import S3Uploader from "@/components/S3Uploader";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ButtonSpinner, LoadingState } from "@/components/ui/loading-state";
import { useEffect, useState } from "react";



export default function VerseEditPage({ params }: { params: Promise<{ verseId: string }> }) {
    const [form, setForm] = useState({
        content: "",
        reference: "",
        imageUrl: "",
        referenceDay: 1,
        date: new Date().toISOString().split("T")[0],
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchVerse = async () => {
            setLoadingData(true);
            const { verseId } = await params;
            const response = await fetch(`/api/writer/daily/verse/edit/${verseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch verse");
            }
            const data = await response.json();
            setForm({
                content: data.verse.content,
                reference: data.verse.reference,
                imageUrl: data.verse.imageUrl || "",
                referenceDay: data.verse.referenceDay || 1,
                date: data.verse.date ? new Date(data.verse.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            });
            setLoadingData(false);
        };
        fetchVerse();
    }, [params]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { verseId } = await params;
            const response = await fetch(`/api/writer/daily/verse/edit/${verseId}`, {
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
        return <LoadingState variant="full" label="Carregando dados..." />;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <BackButton href="/writer/daily/verse" className="mb-6" />
            <h1 className="text-2xl font-bold mb-6 text-center">Editar Passagem</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
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

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glass-primary"
                    className="w-full rounded-full"
                >
                    {loading && <ButtonSpinner />}
                    {loading ? "Salvando..." : "Salvar Citação"}
                </Button>
                {success && (
                    <div className="text-green-600 text-center font-medium mt-2">
                        Citação salva com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}
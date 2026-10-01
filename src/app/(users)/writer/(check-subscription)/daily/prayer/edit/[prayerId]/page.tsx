"use client";
import S3Uploader from "@/components/S3Uploader";
import S3AudioUploader from "@/components/S3UploaderAudio";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ButtonSpinner, LoadingState } from "@/components/ui/loading-state";
import { useEffect, useState } from "react";



export default function VerseEditPage({ params }: { params: Promise<{ prayerId: string }> }) {
    const [form, setForm] = useState({
        content: "",
        title: "",
        imageUrl: "",
        audioUrl: "",
        referenceDay: 1,
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPrayer = async () => {
            setLoadingData(true);
            const { prayerId } = await params;
            const response = await fetch(`/api/writer/daily/prayer/edit/${prayerId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch prayer");
            }
            const data = await response.json();
            setForm({
                content: data.prayer.content,
                title: data.prayer.title,
                imageUrl: data.prayer.imageUrl || "",
                referenceDay: data.prayer.referenceDay,
                date: new Date(data.prayer.createdAt).toISOString().split("T")[0],
                audioUrl: data.prayer.audioUrl || "",
            });
            setLoadingData(false);
        };
        fetchPrayer();
    }, [params]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { prayerId } = await params;
            const response = await fetch(`/api/writer/daily/prayer/edit/${prayerId}`, {
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
            <BackButton href="/writer/daily/prayer" className="mb-6" />
            <h1 className="text-2xl font-bold mb-6 text-center">Editar Oração</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="content">
                        Oração
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
                        placeholder="Título da Oração"
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
                    <S3Uploader folder="prayer" onUploaded={(file) => setForm({ ...form, imageUrl: file.publicUrl })} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="audioUrl">
                        Áudio
                    </label>
                    <S3AudioUploader folder="audios" onUploaded={(file) => setForm({ ...form, audioUrl: file.publicUrl })} />
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="glass-primary"
                    className="w-full rounded-full"
                >
                    {loading && <ButtonSpinner />}
                    {loading ? "Salvando..." : "Salvar Oração"}
                </Button>
                {success && (
                    <div className="text-green-600 text-center font-medium mt-2">
                        Oração salva com sucesso!
                    </div>
                )}
            </form>
        </div>
    );
}
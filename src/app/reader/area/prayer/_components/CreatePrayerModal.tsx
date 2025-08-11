"use client";
import { useState } from "react";

export const CreatePrayerModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("/api/reader/area/prayer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Erro ao criar oração");
            }

            setSuccess(true);
            setFormData({ title: "", content: "" });
            setIsOpen(false);
        } catch (e) {
            setError("Erro ao criar oração");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className="cursor-pointer bg-gradient-to-l from-blue-400 to-blue-600 text-white py-2 px-6 rounded-lg shadow hover:from-blue-500 hover:to-blue-700 transition-all duration-200 my-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "Fechar" : "Nova Oração"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setIsOpen(false)}
                            aria-label="Fechar"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-semibold mb-4 text-blue-700">Nova Oração</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Título"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                            <textarea
                                placeholder="Conteúdo"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="border border-gray-300 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? "Criando..." : "Criar"}
                            </button>
                            {error && <span className="text-red-500 text-sm">{error}</span>}
                            {success && <span className="text-green-600 text-sm">Oração criada com sucesso!</span>}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
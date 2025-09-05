'use client';

import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DataTypes {
    userWriter: {
        writer: {
            id: string;
            logoUrl: string | null;
            colorPrimary: string | null;
            colorSecondary: string | null;
            titleApp?: string | null;
            titleHeader?: string | null;
        } | null;
    }
}

export const FormProfile = (data: DataTypes) => {
    const router = useRouter();

    const { userWriter } = data;
    const [form, setForm] = useState({
        logoUrl: userWriter.writer?.logoUrl || '',
        colorPrimary: userWriter.writer?.colorPrimary || '#000000',
        colorSecondary: userWriter.writer?.colorSecondary || '#000000',
        titleApp: userWriter.writer?.titleApp || 'Deus seja sempre louvado!',
        titleHeader: userWriter.writer?.titleHeader || 'Vamos passar um tempo com Deus?',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/writer/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao registrar.");
                setLoading(false);
                return;
            }

            router.push("/writer/dashboard");
        } catch (err) {
            console.error(err);
            setError("Erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto p-6">
            <Link href="/writer/dashboard" className="bg-propositoBlue text-white p-2 rounded-xl font-bold mb-4 inline-block">
                Voltar ao Dashboard
            </Link>
            <h2 className="text-2xl font-bold mb-6">Configurações do Perfil</h2>
            <form>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="titleApp">
                        Título do App
                    </label>
                    <input
                        type="text"
                        id="titleApp"
                        name="titleApp"
                        value={form.titleApp}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Deus seja sempre louvado!"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="titleHeader">
                        Título do Cabecalho
                    </label>
                    <input
                        type="text"
                        id="titleHeader"
                        name="titleHeader"
                        value={form.titleHeader}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Vamos passar um tempo com Deus?"
                    />
                </div>

                <div className="mb-6">
                    <div>
                        {form.logoUrl && (
                            <img 
                                src={form.logoUrl} 
                                alt="Logo" 
                                className="mb-4 h-32 w-32 object-contain"
                            />
                        )}
                    </div>
                    <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="logoUrl">
                        Logo
                    </label>
                    <S3Uploader
                        folder="logos"
                        onUploaded={(url: any) => setForm({ ...form, logoUrl: url })}
                    />
                </div>

                <div  className="mb-6 flex items-center gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="colorPrimary">
                            Cor Primária
                        </label>
                        <input
                            type="color"
                            id="colorPrimary"
                            name="colorPrimary"
                            value={form.colorPrimary}
                            onChange={handleChange}
                            className="w-12 h-12 p-0 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="colorSecondary">
                            Cor Secundária
                        </label>
                        <input
                            type="color"
                            id="colorSecondary"
                            name="colorSecondary"
                            value={form.colorSecondary}
                            onChange={handleChange}
                            className="w-12 h-12 p-0 border border-gray-300 rounded-md"
                        />
                    </div>

                </div>

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                    {loading ? "Salvando..." : "Salvar Perfil"}
                </button>
            </form>
        </div>
    )
}
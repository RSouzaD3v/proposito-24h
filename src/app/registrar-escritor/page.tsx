'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarEscritorPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        writerName: "",
        slug: "",
        email: "",
        password: "",
        name: "",
        logoUrl: "",
        colorPrimary: "#000000",
        colorSecondary: "#ffffff",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register-writer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao registrar.");
                setLoading(false);
                return;
            }

            router.push("/login?success=1");
        } catch (err) {
            console.error(err);
            setError("Erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-5 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
            <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-lg">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-blue-700 mb-1">Registrar Escritor</h1>
                    <p className="text-gray-500 text-sm">Crie sua plataforma e comece agora!</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Plataforma</label>
                        <input name="writerName" placeholder="Nome da Plataforma" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input name="slug" placeholder="ex: igreja-vida" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email do Administrador</label>
                        <input name="email" type="email" placeholder="Email do administrador" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input name="password" type="password" placeholder="Senha" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Administrador</label>
                        <input name="name" placeholder="Nome do administrador" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL do logo <span className="text-gray-400">(opcional)</span></label>
                        <input name="logoUrl" placeholder="URL do logo" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cor primária</label>
                            <input type="color" name="colorPrimary" value={form.colorPrimary} onChange={handleChange} className="w-full h-10 rounded border border-gray-200" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cor secundária</label>
                            <input type="color" name="colorSecondary" value={form.colorSecondary} onChange={handleChange} className="w-full h-10 rounded border border-gray-200" />
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                Registrando...
                            </span>
                        ) : (
                            "Registrar Escritor"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

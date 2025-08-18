'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrarEscritorPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        writerName: "",
        slug: "",
        email: "",
        password: "",
        name: "",
        logoUrl: "",
        colorPrimary: "#2563eb",
        colorSecondary: "#f1f5f9",
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
        <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-400">
            <div className="w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl p-10 border border-blue-200 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <Link className="text-blue-600 hover:text-blue-800 font-medium transition" href="/">
                        ← Início
                    </Link>
                    <Link className="text-blue-600 hover:text-blue-800 font-medium transition" href="/login">
                        Login
                    </Link>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 shadow-xl border-4 border-white">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-blue-700 mb-2 drop-shadow">Registrar Escritor</h1>
                    <p className="text-gray-500 text-base">Crie sua plataforma e comece agora!</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Plataforma</label>
                        <input
                            name="writerName"
                            placeholder="Nome da Plataforma"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                        <input
                            name="slug"
                            placeholder="ex: igreja-vida"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email do Administrador</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email do administrador"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Senha"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Administrador</label>
                        <input
                            name="name"
                            placeholder="Nome do administrador"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            URL do logo <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            name="logoUrl"
                            placeholder="URL do logo"
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cor primária</label>
                            <input
                                type="color"
                                name="colorPrimary"
                                value={form.colorPrimary}
                                onChange={handleChange}
                                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cor secundária</label>
                            <input
                                type="color"
                                name="colorSecondary"
                                value={form.colorSecondary}
                                onChange={handleChange}
                                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-600 text-sm text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function ReaderRegisterPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/reader/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Erro ao registrar.");
                setLoading(false);
                return;
            }
            // router.push("/reader/login");
        } catch (err) {
            setError("Erro de conexão.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
            <div className="bg-white/80 shadow-lg rounded-xl p-8 w-full max-w-sm border border-blue-100 backdrop-blur-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 tracking-tight">
                    Criar Conta
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                        <input
                            type="text"
                            placeholder="Nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 transition placeholder:text-blue-300"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 transition placeholder:text-blue-300"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 transition placeholder:text-blue-300"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-xs text-center">{error}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </form>
                <p className="mt-5 text-center text-xs text-gray-500">
                    Já tem uma conta?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Entrar
                    </a>
                </p>
            </div>
        </div>
    );
}

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-blue-100">
                <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight drop-shadow">
                    Criar Conta
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <FaUser className="absolute left-3 top-3 text-blue-400" />
                        <input
                            type="text"
                            placeholder="Nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 transition"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 transition"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-blue-400" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 transition"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Entrar
                    </a>
                </p>
            </div>
        </div>
    );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import S3Uploader from "@/components/S3Uploader";
import { WhatIsSlug } from "./_components/WhatIsSlug";

export default function RegistrarEscritorPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        writerName: "",
        slug: "",
        email: "",
        password: "",
        name: "",
        logoUrl: "",
        colorPrimary: "#0dcaf0",
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
        <div className="min-h-screen flex">
            {/* Lado esquerdo: Formulário */}
            <div className="flex-1 flex items-center justify-center md:px-0 px-3 ">
                <div className="w-full p-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link className="text-propositoBlue hover:text-propositoBlue font-medium transition" href="/">
                            ← Início
                        </Link>
                        <Link className="text-propositoBlue hover:text-propositoBlue font-medium transition" href="/login">
                            Login
                        </Link>
                    </div>
                    <div className="flex flex-col items-center mb-8">
                        <h1 className="md:text-4xl text-2xl font-extrabold text-propositoBlue my-2 drop-shadow">Registrar Escritor</h1>
                        <p className="text-gray-500 text-base">Crie sua plataforma e comece agora!</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ... (restante dos campos do formulário) ... */}
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
                            <div className="relative flex items-center justify-between w-16">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                                <WhatIsSlug />
                            </div>
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
                                Logo <span className="text-gray-400 font-normal">(opcional)</span>
                            </label>
                            <S3Uploader
                              folder="logos"
                              onUploaded={({ publicUrl }) =>
                                setForm((prev) => ({ ...prev, logoUrl: publicUrl }))
                              }
                            />
                            {/* <input
                                name="logoUrl"
                                placeholder="URL do logo"
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-gray-50 transition"
                            /> */}
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
                            className="w-full bg-gradient-to-r from-propositoBlue to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:from-blue-500 hover:to-propositoBlue transition disabled:opacity-60"
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
            {/* Lado direito: Gradiente */}
            <div className="hidden overflow-hidden md:block flex-1 min-h-screen bg-gradient-to-br from-propositoBlue via-blue-400 to-blue-200">
                <Image src={"/writer.jpg"} alt="Escritor" width={1000} height={1000} className="w-full h-full object-cover" />
            </div>
        </div>
    );
}

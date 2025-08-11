'use client';

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FiMail, FiLock } from "react-icons/fi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const params = useSearchParams();
  const success = params.get("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/redirector",
    });

    if (result?.error) {
      setError("Credenciais inválidas.");
    }

    if (result?.ok) {
      router.push("/redirector");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
        <h1 className="text-3xl font-extrabold text-center text-black dark:text-white mb-6">Entrar</h1>

        {success && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-200 rounded px-4 py-2 text-center text-sm">
            Cadastro realizado com sucesso! Faça login abaixo.
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-700 bg-red-100 border border-red-200 rounded px-4 py-2 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white dark:bg-black text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white dark:bg-black text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <Link href="/forgot-password" className="text-black dark:text-white hover:underline">
              Esqueceu a senha?
            </Link>
            <span className="text-black dark:text-white">
              Não tem conta?{" "}
              <Link href="/registrar-escritor" className="text-black dark:text-white underline hover:opacity-70">
                Criar conta
              </Link>
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

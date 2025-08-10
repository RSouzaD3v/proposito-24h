'use client';

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FiMail, FiLock } from "react-icons/fi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

  const params = useSearchParams();
  const success = params.get("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/redirector",
    });

    if (result?.error) {
      setError("Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">Entrar</h1>

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
            <FiMail className="absolute left-3 top-3 text-blue-400" />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-blue-400" />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Esqueceu a senha?
            </Link>
            <span>
              Não tem conta?{" "}
              <Link href="/registrar-escritor" className="text-blue-600 hover:underline">
                Criar conta
              </Link>
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

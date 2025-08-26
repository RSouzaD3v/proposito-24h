'use client';

import { Suspense, useEffect } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FiMail, FiLock } from "react-icons/fi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";

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

  useEffect(() => {
    const getSessionFunc = async () => {
      const session = await getSession();
      if (session) {
        router.push("/redirector");
      }
    };
    getSessionFunc();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/redirector",
    });
    if (result?.error) setError("Credenciais inválidas.");
    if (result?.ok) router.push("/redirector");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo: Imagem com gradiente */}
      <div className="hidden md:flex flex-1 items-center justify-center  bg-propositoBlue relative">
        {/* Substitua a imagem abaixo pela sua imagem desejada */}
        {/* <img
          src="/login-illustration.png"
          alt="Login Illustration"
          className="max-w-[70%] max-h-[70%] object-contain drop-shadow-2xl"
        /> */}
        {/* Gradiente extra opcional */}
        {/* <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-gray-800/60 to-gray-700/70 pointer-events-none" /> */}
      </div>
      {/* Lado direito: Formulário */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-10  relative">
          {/* <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-black via-gray-800 to-gray-700 rounded-full p-3 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#fff" fillOpacity="0.1"/>
              <path d="M20 12v16M12 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div> */}
          <h1 className="text-4xl font-black text-center text-propositoBlue dark:text-white mb-8 tracking-tight">
            Entrar
          </h1>

          {success && (
            <div className="mb-4 text-green-800 bg-green-100 border border-green-300 rounded-lg px-4 py-2 text-center text-sm font-medium shadow">
              Cadastro realizado com sucesso! Faça login abaixo.
            </div>
          )}
          {error && (
            <div className="mb-4 text-red-800 bg-red-100 border border-red-300 rounded-lg px-4 py-2 text-center text-sm font-medium shadow">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-3 py-3 border border-gray-300 dark:border-blue-700 bg-white dark:bg-blue-900 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-white transition text-base shadow-sm"
                required
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-3 py-3 border border-gray-300 dark:border-blue-700 bg-white dark:bg-blue-900 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-white transition text-base shadow-sm"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <Link href="/forgot-password" className="text-blue-700 dark:text-gray-200 hover:underline transition">
                Esqueceu a senha?
              </Link>
              <span className="text-gray-700 dark:text-gray-200">
                Não tem conta?{" "}
                <Link href="/register-writer" className="text-blue-700 dark:text-white underline hover:opacity-80 font-semibold">
                  Criar conta
                </Link>
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-propositoBlue via-blue-800 to-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:from-blue-800 hover:to-propositoBlue transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

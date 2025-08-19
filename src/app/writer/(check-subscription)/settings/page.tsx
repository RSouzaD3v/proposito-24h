import Link from "next/link";
import React from "react";
import StripePortalButton from "../_components/PortalStripeButton";

export default function SettingsPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 p-6">
            <section className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center gap-6 border border-indigo-100">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-md mb-2">
                    <svg
                        className="w-10 h-10 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 15v2m0 4a9 9 0 100-18 9 9 0 000 18zm0-6a3 3 0 100-6 3 3 0 000 6z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 tracking-tight">Configurações</h1>
                <p className="text-indigo-500 text-center mb-2 text-sm">
                    Gerencie sua assinatura e preferências da conta.
                </p>
                <div className="w-full flex flex-col items-center gap-3 mb-4">
                    <StripePortalButton />
                    <a
                        href="/api/stripe/dashboard"
                        target="_blank"
                        className="text-indigo-600 hover:underline text-sm transition"
                    >
                        Gerenciar minha conta no Stripe
                    </a>
                </div>
                <Link href={"/writer/dashboard"}>
                    <span className="inline-block px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-base font-semibold shadow">
                        Ir para o Painel
                    </span>
                </Link>
            </section>
        </main>
    );
}

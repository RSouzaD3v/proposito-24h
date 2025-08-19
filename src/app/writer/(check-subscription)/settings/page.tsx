import Link from "next/link";
import React from "react";
import StripePortalButton from "../_components/PortalStripeButton";

export default function SettingsPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <section className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-indigo-100">
                    <svg
                        className="w-8 h-8 text-indigo-500"
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
                <h1 className="text-2xl font-bold text-indigo-700 mb-2">Configurações</h1>
                <div className="w-full flex justify-center mb-5">
                    <StripePortalButton />
                </div>
                <Link href={"/writer/dashboard"}>
                    <span className="inline-block px-4 py-2 bg-indigo-500 text-indigo-50 rounded-full text-sm font-medium">
                        Ir para o Painel
                    </span>
                </Link>
            </section>
        </main>
    );
}

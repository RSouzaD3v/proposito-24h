"use client";

import { useState } from "react";

export default function WriterOnboarding() {
    const [loading, setLoading] = useState(false);

    async function handleConnect() {
        setLoading(true);

        const res = await fetch("/api/stripe/create-writer-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        setLoading(false);

        if (data.url) {
            window.location.href = data.url;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#635bff] hover:bg-[#7a6fff] transition text-white font-semibold rounded-md shadow-md disabled:opacity-60"
            >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="white"/>
                    <path d="M23.5 13.5C23.5 11.0147 21.4853 9 19 9H13C10.5147 9 8.5 11.0147 8.5 13.5V18.5C8.5 20.9853 10.5147 23 13 23H19C21.4853 23 23.5 20.9853 23.5 18.5V13.5Z" fill="#635bff"/>
                    <text x="16" y="21" textAnchor="middle" fontSize="10" fill="white" fontFamily="Arial" fontWeight="bold">S</text>
                </svg>
                {loading ? "Conectando..." : "Conectar com Stripe"}
            </button>
        </div>
    );
}

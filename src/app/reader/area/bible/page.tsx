import React from "react";

export default function BiblePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-8 px-4">
            <section className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col gap-6">
                <header className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">
                        Bíblia Online
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">
                        Em breve você poderá ler e estudar a Bíblia diretamente por aqui.
                    </p>
                </header>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6l4 2M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                            />
                        </svg>
                    </div>
                    <span className="text-indigo-600 font-medium">
                        Página em desenvolvimento
                    </span>
                </div>
            </section>
        </main>
    );
}
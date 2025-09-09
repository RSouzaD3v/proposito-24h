import Link from "next/link";
import { ReactNode } from "react";

export default function BibleLayout({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link href="/" className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                        ← Ir para início
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mt-2">Bíblia (ACF)</h1>
                <p className="text-sm text-muted-foreground">
                    Navegue por livros, capítulos e versículos.
                </p>
            </header>
            {children}
        </main>
    );
}
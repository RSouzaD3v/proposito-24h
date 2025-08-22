import Link from "next/link";
import { ReactNode } from "react";

export default function BibleLayout({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <Link href="/reader/area/" className="text-sm underline text-blue-500 hover:text-blue-600">
                    ← Ir para início
                </Link>
                <h1 className="text-3xl font-bold mt-2">Bíblia (ACF)</h1>
                <p className="text-sm text-muted-foreground">
                    Navegue por livros, capítulos e versículos.
                </p>
            </header>
            {children}
        </main>
    );
}
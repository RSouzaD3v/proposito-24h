import { ReactNode } from "react";

export default function BibleLayout({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Bíblia (ACF)</h1>
                <p className="text-sm text-muted-foreground">
                    Navegue por livros, capítulos e versículos.
                </p>
            </header>
            {children}
        </main>
    );
}
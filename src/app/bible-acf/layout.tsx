// bible/layout.tsx
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ReactNode } from "react";

export default function BibleLayout({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <BackButton href="/" label="Ir para início" />
                </div>
                <h1 className="text-3xl font-bold mt-2">Bíblia (ACF)</h1>
                <p className="text-sm text-muted-foreground">
                    Navegue por livros, capítulos e versículos.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                    <Link href="/bible-nvi">
                        <ArrowLeftRight />
                        Ir para Bíblia (NVI)
                    </Link>
                </Button>
            </header>
            {children}
        </main>
    );
}
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function BibleLayout({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8 pb-28">
            <PageHeader
                title="Bíblia (NVI)"
                description="Navegue por livros, capítulos e versículos."
                backHref="/reader/area"
                backLabel="Ir para início"
                actions={
                    <>
                        <Button asChild variant="glass" className="rounded-full">
                            <Link href="/reader/area/reading/plan/365">
                                Ver meu progresso
                            </Link>
                        </Button>
                        <Button asChild variant="glass-primary" className="rounded-full">
                            <Link href="/reader/area/bible-acf">Bíblia ACF</Link>
                        </Button>
                    </>
                }
            />
            {children}
        </main>
    );
}

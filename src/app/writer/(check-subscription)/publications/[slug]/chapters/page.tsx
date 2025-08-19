"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Chapter {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    coverUrl: string;
    order: number;
    publicationId: string;
    createdAt: string;
    updatedAt: string;
}

function truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

export default function WriterPublicationChapterPage({ params }: { params: Promise<{ slug: string }> }) {
    const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState("");
    const [chapters, setChapters] = useState<Chapter[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { slug } = await params;
            setSlug(slug);
            try {
                const res = await fetch(`/api/writer/publications/${slug}/chapters`);
                const data = await res.json();
                setChapters(data.chapters);
            } catch (e) {
                console.log(e);
            }
        };
        fetchData();
    }, [params]);

    const handleDelete = (chapterId: string) => async (e: React.MouseEvent) => {
        e.preventDefault();
        const confirmed = confirm("Tem certeza que deseja apagar este capítulo?");
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/writer/publications/${slug}/chapters/${chapterId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Erro ao apagar capítulo");
            setChapters((prev) => prev?.filter((chapter) => chapter.id !== chapterId) || null);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <section className="max-w-3xl mx-auto py-8">
            <Link href={`/writer/publications`} className="text-blue-600 hover:underline mb-4 inline-block">
                Voltar às Publicações
            </Link>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Capítulos</h1>
                    <p className="text-gray-600">Gerencie os capítulos da sua publicação.</p>
                </div>
                <Link
                    href={`/writer/publications/${slug}/chapters/new`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    + Novo capítulo
                </Link>
            </div>

            {chapters && chapters.length > 0 ? (
                <div className="grid gap-6">
                    {chapters.map((chapter) => (
                            <Card key={chapter.id} className="shadow hover:shadow-lg transition">
                                <div className="flex items-center justify-between p-5">
                                    <div>
                                        <CardHeader>
                                            <h2
                                                className="text-xl font-semibold text-blue-700 hover:underline"
                                            >
                                                {chapter.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm mt-1">{chapter.subtitle}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700">
                                                {truncate(chapter.content, 120)}
                                            </p>
                                        </CardContent>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link key={chapter.id} href={`/writer/publications/${slug}/chapters/${chapter.id}`}>Editar</Link>
                                        <Button variant="destructive" onClick={handleDelete(chapter.id)}>Apagar</Button>
                                    </div>
                                </div>
                            </Card>
                    ))}
                </div>
            ) : (
                <p className="mt-8 text-gray-600 text-center">Nenhum capítulo encontrado.</p>
            )}
        </section>
    );
}

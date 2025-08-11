"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Chapter {
    id: string;
    publicationId: string;
    order: number;
    title: string;
    subtitle: string;
    content: string;
    coverUrl: string;
    createdAt: string;
    updatedAt: string;
}

export default function ChapterPage({ params }: { params: Promise<{ slug: string; chapterId: string }> }) {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [order, setOrder] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const { slug, chapterId } = await params;
            setSlug(slug);
            try {
                const res = await fetch(`/api/writer/publications/${slug}/chapters/${chapterId}`);
                if (!res.ok) return;
                const data = await res.json();
                setChapter(data.chapter);
                setTitle(data.chapter.title);
                setSubtitle(data.chapter.subtitle);
                setContent(data.chapter.content);
                setCoverUrl(data.chapter.coverUrl);
                setOrder(data.chapter.order);
            } catch (e) {
                console.log(e);
            }
        };
        fetchData();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { slug, chapterId } = await params;
        try {
            const res = await fetch(`/api/writer/publications/${slug}/chapters/${chapterId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    subtitle,
                    content,
                    coverUrl,
                    order: typeof order === "number" ? order : 1,
                }),
            });
            if (!res.ok) return;
            const data = await res.json();
            setChapter(data.chapter);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <section className="max-w-4xl mx-auto py-10 px-4 md:px-8">
            <Link className="text-blue-600 hover:underline" href={`/writer/publications/${slug}/chapters`}>
                Voltar aos Capítulos
            </Link>
            <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-12 flex flex-col md:flex-row gap-8">
                {coverUrl && (
                    <div className="flex-shrink-0 flex justify-center items-start md:w-1/3">
                        <img
                            src={coverUrl}
                            alt="Capa"
                            className="max-h-72 w-auto rounded-xl shadow-lg object-cover border border-gray-200"
                        />
                    </div>
                )}
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-gray-800 tracking-tight">
                        Editar Capítulo
                    </h1>
                    <p className="text-blue-600 font-semibold mb-6 text-lg">
                        {chapter?.order ? `Capítulo ${chapter.order}` : ""}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Título</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Título"
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Subtítulo</label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="Subtítulo"
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Ordem</label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.valueAsNumber)}
                                    placeholder="Ordem"
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">URL da Capa</label>
                                <input
                                    type="text"
                                    value={coverUrl}
                                    onChange={(e) => setCoverUrl(e.target.value)}
                                    placeholder="URL da Capa"
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Conteúdo</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Conteúdo"
                                rows={10}
                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-y"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 px-8 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

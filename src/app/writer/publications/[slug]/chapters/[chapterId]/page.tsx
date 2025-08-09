"use client";
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

    useEffect(() => {
        const fetchData = async () => {
            const { slug, chapterId } = await params;
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
        <section className="max-w-3xl mx-auto py-10 px-4">
            <div className="bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-800">Editar Capítulo</h1>
                <p className="text-gray-500 mb-6">{chapter?.order ? `Capítulo ${chapter.order}` : ""}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título"
                            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Subtítulo</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Subtítulo"
                            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Ordem</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(e.target.valueAsNumber)}
                            placeholder="Ordem"
                            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">URL da Capa</label>
                        <input
                            type="text"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="URL da Capa"
                            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Conteúdo</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Conteúdo"
                            rows={8}
                            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                        />
                    </div>
                    {coverUrl && (
                        <div className="flex justify-center mb-4">
                            <img src={coverUrl} alt="Capa" className="max-h-48 rounded shadow" />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 rounded-md shadow"
                    >
                        Salvar
                    </button>
                </form>
            </div>
        </section>
    );
}

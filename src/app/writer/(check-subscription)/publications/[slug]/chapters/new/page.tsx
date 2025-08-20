"use client";
import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WriterPublicationChapterNewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const [slug, setSlug] = useState("");
    const router = useRouter();
    const [form, setForm] = useState<{ coverUrl?: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            const { slug } = await params;
            setSlug(slug);
        };
        fetchData();
    }, [params]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData);
        const payload = {
            ...data,
            coverUrl: form.coverUrl,
        }

        try {
            const response = await fetch(
                `/api/writer/publications/${slug}/chapters`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error creating chapter:", errorData);
                return;
            }

            router.push(`/writer/publications/${slug}/chapters`);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen bg-gray-50">
            <Link
                href={`/writer/publications/${slug}/chapters`}
                className="absolute top-4 left-4 text-blue-600 hover:underline"
            >
                Voltar á Página Anterior
            </Link>
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-blue-700 mb-2">
                        Criar Novo Capítulo
                    </h1>
                    <p className="text-gray-500">
                        Preencha os campos abaixo para adicionar um novo capítulo à sua publicação.
                    </p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Digite o título do capítulo"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-1">
                            Ordem
                        </label>
                        <input
                            type="number"
                            name="order"
                            min={1}
                            id="order"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Digite a ordem do capítulo"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="subtitle" className="block text-sm font-semibold text-gray-700 mb-1">
                            Subtítulo
                        </label>
                        <input
                            type="text"
                            name="subtitle"
                            id="subtitle"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Digite o subtítulo do capítulo"
                        />
                    </div>
                    <div>
                        <label htmlFor="coverUrl" className="block text-sm font-semibold text-gray-700 mb-1">
                            Imagem de Capa (URL)
                        </label>
                        <S3Uploader folder="cover-chapters" onUploaded={({ publicUrl }) => {
                            setForm(prev => ({ ...prev, coverUrl: publicUrl }));
                        }} />
                        {/* <input
                            type="text"
                            name="coverUrl"
                            id="coverUrl"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Digite a URL da imagem de capa"
                        /> */}
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1">
                            Conteúdo
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            rows={6}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none resize-y"
                            placeholder="Digite o conteúdo do capítulo"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Criar Capítulo
                    </button>
                </form>
            </div>
        </section>
    );
}

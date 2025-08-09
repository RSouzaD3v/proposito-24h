"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WriterPublicationChapterNewPage({ params }: { params: Promise<{ slug: string }> }) {
    const [slug, setSlug] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { slug } = await params;
            setSlug(slug);
        };
        fetchData();
    }, [params]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(event.target)
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData);
        console.log(data);

        try {
            const response = await fetch(`/api/writer/publications/${slug}/chapters`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error creating chapter:", errorData);
                return;
            }

            const responseData = await response.json();
            console.log("Chapter created successfully:", responseData);
            router.push(`/writer/publications/${slug}/chapters`);
        } catch (e) {
            console.log(e);
        }
        // Aqui você pode enviar os dados para a API ou fazer o que precisar
    };

    return (
        <section>
            <div>
                <div>
                    <h1 className="text-2xl font-bold mb-4">Criar Novo Capítulo</h1>
                    <p className="text-gray-600">Aqui você pode criar um novo capítulo para sua publicação.</p>
                </div>

                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Título
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Digite o título do capítulo"
                            />
                        </div>
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                                Ordem
                            </label>
                            <input
                                type="number"
                                name="order"
                                min={1}
                                id="order"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Digite a ordem do capítulo"
                            />
                        </div>
                        <div>
                            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                                Subtítulo
                            </label>
                            <input
                                type="text"
                                name="subtitle"
                                id="subtitle"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Digite o subtítulo do capítulo"
                            />
                        </div>
                        <div>
                            <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700">
                                Imagem
                            </label>
                            <input
                                type="text"
                                name="coverUrl"
                                id="coverUrl"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Digite a URL da imagem de capa"
                            />
                        </div>
                        <div>
                            <label htmlFor="content">
                                Conteúdo
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Digite o conteúdo do capítulo"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                            Criar Capítulo
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

"use client";

import S3Uploader from "@/components/S3Uploader";
import WriterAiButton from "@/components/WriterAi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// em vez de: import RichEditor from "../_components/RichEditor";
const RichEditor = dynamic(() => import("../_components/RichEditor"), {
  ssr: false,
  // opcional: componente enquanto carrega
  loading: () => (
    <div className="rounded-lg border bg-white p-4 shadow-sm min-h-[260px] animate-pulse" />
  ),
});

export default function WriterPublicationChapterNewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const router = useRouter();
  const [form, setForm] = useState<{ coverUrl?: string; content?: string }>({});

  // pega o slug vindo do route segment
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
      content: form.content, // HTML rico do editor
    };

    try {
      const response = await fetch(`/api/writer/publications/${slug}/chapters`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

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

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2">
            Criar Novo Capítulo
          </h1>
          <p className="text-gray-500">
            Preencha os campos abaixo para adicionar um novo capítulo à sua
            publicação.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
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

          {/* Ordem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="order"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
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

            {/* Subtítulo */}
            <div>
              <label
                htmlFor="subtitle"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
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
          </div>

          {/* Capa */}
          <div>
            <label
              htmlFor="coverUrl"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Imagem de Capa (upload)
            </label>
            <S3Uploader
              folder="cover-chapters"
              onUploaded={({ publicUrl }) => {
                setForm((prev) => ({ ...prev, coverUrl: publicUrl }));
              }}
            />
            {/* Se quiser permitir colar URL diretamente, descomente: */}
            {/* <input
              type="text"
              name="coverUrl"
              id="coverUrl"
              className="mt-2 w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="...ou cole a URL da capa"
              onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
            /> */}
          </div>

          {/* Conteúdo (Rich Editor) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Conteúdo
              </label>

              {/* Insere texto vindo da IA como um parágrafo no HTML */}
              <WriterAiButton
                onInsert={(text) =>
                  setForm((f) => ({
                    ...f,
                    content:
                      (f.content || "") +
                      `<p>${text.replace(/\n/g, "<br/>")}</p>`,
                  }))
                }
              />
            </div>

            {/* Editor rico controlado (salva HTML) */}
            <RichEditor
              value={form.content || ""}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
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

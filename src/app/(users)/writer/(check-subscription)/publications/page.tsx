import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function WriterPublicationPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user.writerId) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 text-center">
                <p className="text-red-500 text-lg font-medium">
                    Acesso negado. Por favor, faça login.
                </p>
            </div>
        );
    }

    const pubs = await db.publication.findMany({
        where: {
            writerId: session?.user?.writerId,
        }
    });

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <Link
                href="/writer/dashboard"
                className="bg-blue-600 text-white mb-6 px-2 rounded-sm inline-block text-sm font-medium"
            >
                ← Voltar ao Painel
            </Link>

            <div className="flex items-center flex-wrap gap-4 justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
                        Painel de Publicações
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Gerencie suas publicações de forma fácil e rápida.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <Link href={"/writer/publications/my-vitrine"}>
                        <span className="bg-blue-600 py-2 px-4 text-white rounded-sm">
                            Minha Vitrine
                        </span>
                    </Link>
                    <Link
                        href="/writer/publications/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-sm shadow hover:bg-blue-700 transition"
                    >
                        + Nova Publicação
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                {pubs.map(pub => (
                    <div
                        key={pub.id}
                        className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {pub.title}
                        </h2>
                        <p className="text-gray-700 mt-2">{pub.description}</p>
                        <div className="flex items-center gap-4 mt-4">
                            <Link
                                href={`/writer/publications/edit/${pub.id}`}
                                className="bg-blue-600 text-white p-2 rounded-sm"
                            >
                                Editar
                            </Link>
                            <Link
                                href={`/writer/publications/${pub.slug}/chapters`}
                                className="bg-blue-100 text-black p-2 rounded-sm"
                            >
                                Ver Capítulos
                            </Link>
                        </div>
                    </div>
                ))}
                {pubs.length === 0 && (
                    <div className="text-gray-500 text-center py-12">
                        <p className="text-lg">Nenhuma publicação encontrada.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
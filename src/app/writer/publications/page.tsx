import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function WriterPublicationPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user.writerId) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 text-center">
                <p className="text-red-500">Acesso negado. Por favor, faça login.</p>
            </div>
        );
    }

    const pubs = await db.publication.findMany({
        where: {
            writerId: session?.user?.writerId,
        }
    });

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bem-vindo ao painel de publicações</h1>
                    <p className="mb-8 text-gray-600">Aqui você pode gerenciar suas publicações.</p>
                </div>
                <div>
                    <Link href="/writer/publications/create" className="inline-block text-blue-600 hover:underline font-medium">
                        Criar nova publicação
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                {pubs.map(pub => (
                    <div
                        key={pub.id}
                        className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold">{pub.title}</h2>
                        <p className="text-gray-700">{pub.description}</p>
                        <div className="flex items-center gap-2">
                            <Link href={`/writer/publications/edit/${pub.id}`} className="inline-block mt-2 text-blue-600 hover:underline font-medium">
                                Editar
                            </Link>
                            <Link href={`/writer/publications/${pub.slug}/chapters`} className="inline-block mt-2 text-blue-600 hover:underline font-medium">
                                Ver Capítulos
                            </Link>
                        </div>
                    </div>
                ))}
                {pubs.length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                        Nenhuma publicação encontrada.
                    </div>
                )}
            </div>
        </div>
    );
}
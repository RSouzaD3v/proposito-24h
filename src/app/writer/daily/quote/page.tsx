import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default async function QuotePage() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.writerId) return null;

    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const quote = await db.quote.findFirst({
        where: {
            writerId: user.writerId,
            createdAt: { gte: start, lt: end }
        }
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-10">
            <Link href="/writer/daily" className="mb-8 flex items-center gap-2 absolute top-5 left-5 text-indigo-700 font-bold text-lg">
                <FiArrowLeft size={24}/>
                Voltar
            </Link>

            <div className="w-full max-w-xl mx-auto mb-8 flex items-center justify-between bg-white/90 rounded-xl shadow p-6">
                <span className="text-lg font-semibold text-indigo-700">Citação do Dia</span>
                <Link
                    href={`/writer/daily/quote/${quote?.id ? `edit/${quote.id}` : "new"}`}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                    {quote ? "Editar" : "Nova"}
                </Link>
            </div>

            {quote ? (
                <div className="bg-white/90 shadow rounded-xl px-8 py-10 w-full max-w-xl text-center">
                    <h2 className="mb-4 text-indigo-400 text-xs font-semibold tracking-widest">PROPÓSITO 24H</h2>
                    <blockquote className="mb-6">
                        <p className="text-2xl font-light text-gray-800 italic">“{quote.content}”</p>
                    </blockquote>
                    <span className="text-indigo-500 text-sm font-semibold">{quote.nameAuthor}</span>
                </div>
            ) : (
                <div className="w-full max-w-xl mx-auto text-center p-8 bg-white/80 rounded-xl shadow">
                    <p className="mb-4 text-gray-600">Nenhuma citação criada hoje.</p>
                    <Link
                        href="/writer/daily/quote/new"
                        className="inline-block px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                    >
                        Criar Nova Citação
                    </Link>
                </div>
            )}
        </div>
    );
}

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { SectionsDaily } from "./_components/SectionsDaily";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function DailyManagementPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div>
                <h1>Você não está autenticado</h1>
            </div>
        );
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id
        }
    });

    if (!userWriter || !userWriter.writerId) {
        return (
            <div>
                <h1>Usuário não encontrado</h1>
            </div>
        );
    }

    const quotes = await db.quote.findMany({
        where: {
            writerId: userWriter.writerId
        }
    });
    const verses = await db.verse.findMany({
        where: {
            writerId: userWriter.writerId
        }
    });
    const devotionals = await db.devotional.findMany({
        where: {
            writerId: userWriter.writerId
        }
    });

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <Link href={"/writer/daily"} className="flex items-center gap-2 mb-4 text-blue-600 hover:underline">
                <FaArrowLeft size={24}/>
                <h2 className="text-lg font-semibold">Voltar para daily page</h2>
            </Link>
            <h1 className="my-5 text-xl font-bold">Gerenciamento Daily</h1>

            <SectionsDaily quotes={quotes} verses={verses} devotionals={devotionals} />
        </div>
    );
}
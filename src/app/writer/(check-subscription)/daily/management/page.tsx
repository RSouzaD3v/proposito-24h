import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { SectionsDaily } from "./_components/SectionsDaily";

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
            <h1 className="my-5 text-xl font-bold">Gerenciamento Daily</h1>

            <SectionsDaily quotes={quotes} verses={verses} devotionals={devotionals} />
        </div>
    );
}
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { SectionsDaily } from "./_components/SectionsDaily";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";

export default async function DailyManagementPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <WriterShell maxWidth="4xl">
                <h1>Você não está autenticado</h1>
            </WriterShell>
        );
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id
        }
    });

    if (!userWriter || !userWriter.writerId) {
        return (
            <WriterShell maxWidth="4xl">
                <h1>Usuário não encontrado</h1>
            </WriterShell>
        );
    }

    const quotes = await db.quote.findMany({
        where: {
            writerId: userWriter.writerId
        },
        orderBy: { createdAt: 'desc' }
    });
    const verses = await db.verse.findMany({
        where: {
            writerId: userWriter.writerId
        },
        orderBy: { createdAt: 'desc' }
    });
    const devotionals = await db.devotional.findMany({
        where: {
            writerId: userWriter.writerId
        },
        orderBy: { createdAt: 'desc' }
    });
    const prayers = await db.prayer.findMany({
        where: {
            writerId: userWriter.writerId
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <WriterShell maxWidth="4xl">
            <PageHeader
                title="Gerenciamento Daily"
                description="Gerencie todo o conteúdo do diário."
                backHref="/writer/daily"
            />
            <SectionsDaily quotes={quotes} verses={verses} devotionals={devotionals} prayers={prayers} />
        </WriterShell>
    );
}

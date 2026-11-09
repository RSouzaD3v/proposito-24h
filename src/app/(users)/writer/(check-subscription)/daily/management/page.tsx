import { apiGet } from "@/lib/api/server";
import { SectionsDaily } from "./_components/SectionsDaily";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";

export default async function DailyManagementPage() {
    const list = (kind: string) => apiGet<any[]>(`/writer/daily/${kind}`);
    const [quotes, verses, devotionals, prayers] = await Promise.all([
        list("quote"),
        list("verse"),
        list("devotional"),
        list("prayer"),
    ]);

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

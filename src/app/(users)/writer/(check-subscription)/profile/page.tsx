import { apiGetOrNull } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { FormProfile } from "./_components/FormProfile";
import { WriterShell } from "@/components/ui/writer-shell";
import { GlassCard } from "@/components/ui/glass-card";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <WriterShell maxWidth="md">
                <GlassCard className="text-center">Acesso negado</GlassCard>
            </WriterShell>
        );
    }

    const userWriter = { writer: await apiGetOrNull<any>("/writer/profile") };

    if (!userWriter?.writer) {
        return (
            <WriterShell maxWidth="md">
                <GlassCard className="text-center">
                    Perfil de escritor não encontrado.
                </GlassCard>
            </WriterShell>
        );
    }

    return (
        <WriterShell maxWidth="md">
            <FormProfile userWriter={userWriter}/>
        </WriterShell>
    )
}

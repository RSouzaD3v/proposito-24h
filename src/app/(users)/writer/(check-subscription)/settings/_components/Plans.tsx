import { apiGetOrNull } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Plans() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null
    }

    const writer = await apiGetOrNull<{ id: string }>("/writer/profile");

    return (
        <Button asChild variant="glass-primary" className="rounded-full px-5 font-bold">
            <Link href={`/writer/${writer?.id}/plans`}>Ver meus planos</Link>
        </Button>
    );
}

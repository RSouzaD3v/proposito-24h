import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Plans() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session?.user.id
        },
        select: {
            writer: {
                select: {
                    id: true,
                    slug: true
                }
            }
        }
    });
    

    return (
        <Button asChild variant="glass-primary" className="rounded-full px-5 font-bold">
            <Link href={`/writer/${userWriter?.writer?.id}/plans`}>Ver meus planos</Link>
        </Button>
    );
}

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";

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
    

    return <><Link className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl" href={`/writer/${userWriter?.writer?.id}/plans`}>Ver meus planos</Link></>
}
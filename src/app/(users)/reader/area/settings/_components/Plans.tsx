import { apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";

export async function Plans() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <Link href="/reader/area" className="text-blue-600 hover:underline">
                Fazer login para ver planos e assinaturas
            </Link>
        )
    }

    const userReader = await apiGetOrNull<ReaderProfile>("/reader/profile");

    return (
        <Link href={`/reader/area/w/${userReader?.writer?.slug}`}className="text-blue-600 hover:underline">
            Ver planos e assinaturas
        </Link>
    )
}
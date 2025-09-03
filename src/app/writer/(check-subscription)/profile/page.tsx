import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { FormProfile } from "./_components/FormProfile";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <div>Acesso negado</div>;
    }

    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id
        },
        select: {
            writer: {
                select: {
                    colorPrimary: true,
                    colorSecondary: true,
                    id: true,
                    logoUrl: true,
                    titleApp: true,
                    titleHeader: true,
                }
            }
        }
    });

    if (!userWriter?.writer) {
        return <div>Perfil de escritor não encontrado.</div>;
    }

    return (
        <section>
            <FormProfile userWriter={userWriter}/>
        </section>
    )
}
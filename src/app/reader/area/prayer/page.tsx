'use server';
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { CreatePrayerModal } from "./_components/CreatePrayerModal";
import { DeletePrayerBtn } from "./_components/DeletePrayerBtn";

export default async function PrayerPage() {
    const session = await getServerSession(authOptions);

    const prayers = await db.prayer.findMany({
        where: {
            userId: session?.user?.id
        }
    });

    return (
        <section className="container mx-auto max-w-2xl py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-extrabold text-indigo-800 drop-shadow-sm">Minhas Orações</h2>
                <CreatePrayerModal />
            </div>
            {prayers.length === 0 ? (
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-10 shadow-md text-gray-500 text-center">
                    <span className="block text-2xl mb-2">🙏</span>
                    Nenhuma oração encontrada.
                </div>
            ) : (
                <div className="space-y-8">
                    {prayers.map(prayer => (
                        <div
                            key={prayer.id}
                            className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 hover:shadow-xl transition-shadow relative"
                        >
                            <h3 className="text-2xl font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                <span className="inline-block">🕊️</span>
                                {prayer.title}
                            </h3>
                            <p className="text-gray-700 mb-4 whitespace-pre-line">{prayer.content}</p>
                            <div className="absolute top-4 right-4">
                                <DeletePrayerBtn prayerId={prayer.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
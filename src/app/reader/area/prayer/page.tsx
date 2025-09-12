'use server';
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { CreatePrayerModal } from "./_components/CreatePrayerModal";
import { DeletePrayerBtn } from "./_components/DeletePrayerBtn";
import { MenuPainel } from "../_components/MenuPainel";
import { FaCheck } from "react-icons/fa";
import { CompletePrayer } from "./_components/CompletePrayer";
import Link from "next/link";
import { ScreenSubscription } from "../_components/ScreenSubscription";

export default async function PrayerPage() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.writerId) return null;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);


    const prayer = await db.prayer.findFirst({
        where: {
            writerId: user.writerId,
            createdAt: {
                gte: startOfToday,
                lte: endOfToday
            }
        },
        include: {
            writer: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            }
        }
    });

    let userCompletionPrayer;
    if (prayer) {
        userCompletionPrayer = await db.userCompletationPrayer.findFirst({
            where: {
                userId: user.id,
                prayerId: prayer.id
            }
        });
    };

        const verifyAccess = await db.writerReaderAccess.findFirst({
        where: {
            writerId: prayer?.writer.id
        }
    });

    const subscription = await db.readerSubscription.findFirst({
        where: {
            writerId: prayer?.writer.id,
            readerId: session.user.id
        }
    });

            const isFree = verifyAccess?.verse === true;
    const hasSubscription = !!subscription;

    if (!isFree && !hasSubscription) {
        <ScreenSubscription slug={prayer?.writer.slug || ""} />
    }


    return (
        <section style={{ backgroundImage: prayer?.imageUrl ? `url(${prayer?.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} 
        className="w-screen flex items-center justify-center py-10 px-4 min-h-screen">
            {/* <div className="flex items-center justify-between mb-8 w-fit bg-white/75 p-4 rounded-xl shadow-md">
                <h2 className="text-4xl font-extrabold drop-shadow-sm">Minha Oração</h2>
            </div> */}
            {!prayer ? (
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-10 shadow-md text-gray-500 text-center">
                    <span className="block text-2xl mb-2">🙏</span>
                    Nenhuma oração encontrada.
                </div>
            ) : (
                <div className="space-y-8">
                    <div
                        className="bg-white/75 w-full px-5 md:w-[500px] flex items-center justify-center flex-col gap-4 rounded-2xl shadow-lg p-8 border border-indigo-100 hover:shadow-xl transition-shadow relative"
                    >
                        <h3 className="text-2xl font-bold text-black mb-3 flex items-center gap-2">
                                <span className="inline-block">🕊️</span>
                                {prayer.title}
                            </h3>
                            <p className="text-gray-700 mb-4 whitespace-pre-line">{prayer.content}</p>
                            <div className="absolute top-4 right-4">
                                {userCompletionPrayer ? (
                                    <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg">
                                    <FaCheck />
                                    </div>
                                ) : null}                               
                            </div>

                            <div>
                                <CompletePrayer prayerId={prayer.id} />
                            </div>
                        </div>
                </div>
            )}

            <MenuPainel />
        </section>
    );
}
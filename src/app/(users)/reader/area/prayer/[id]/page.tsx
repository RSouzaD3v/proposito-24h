'use server';
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { CreatePrayerModal } from "./_components/CreatePrayerModal";
import { DeletePrayerBtn } from "./_components/DeletePrayerBtn";
import { FaCheck } from "react-icons/fa";
import { CompletePrayer } from "./_components/CompletePrayer";
import { startOfDay, addDays } from "date-fns";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import clientPromise from "@/lib/mongodb";
import { ScreenSubscription } from "../../_components/ScreenSubscription";
import { getReaderContentGate } from "@/lib/readerAccessForWriter";
const TZ = "America/Sao_Paulo";

function brasiliaDayRange(now = new Date()) {
  const localNow = toZonedTime(now, TZ);
  const start = startOfDay(localNow);
  const next = startOfDay(addDays(start, 1));
  return {
    gte: fromZonedTime(start, TZ),
    lt: fromZonedTime(next, TZ), // use lt para evitar borda de 23:59:59.999
  };
}

export default async function PrayerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.writerId) return null;

    const { gte, lt } = brasiliaDayRange();

    const startOfToday = gte;
    const endOfToday = lt;

    const prayer = await db.prayer.findFirst({
        where: {
            writerId: user.writerId,
            id: (await params).id
        },
            orderBy: { createdAt: "asc" },
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

      const client = await clientPromise;
  const mongoDb = client.db(process.env.MONGODB_DB || "railway");
  const personalization = await mongoDb
    .collection("personalizations")
    .findOne({ writerId: user.writerId });

      const colors = {
    primary: personalization?.primaryColor || "#202020",
    secondary: personalization?.secondaryColor || "#404040",
    background: personalization?.backgroundColor || "#ffffff",
    buttonBg: personalization?.bgButtonColor || "#22c55e",
    buttonText: personalization?.buttonTextColor || "#ffffff",
    text: personalization?.textColor || "#000000",
  };

    let userCompletionPrayer;
    if (prayer) {
        userCompletionPrayer = await db.userCompletationPrayer.findFirst({
            where: {
                userId: user.id,
                prayerId: prayer.id
            }
        });
    };

  // Usuário (precisamos do writer atual p/ regra de acesso)
  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      writer: { select: { id: true, name: true, slug: true } },
    },
  });

  // Se sua regra exige que o usuário seja "writer" para ver o plano, mantenha:
  if (!userReader || !userReader.writerId) {
    return (
      <div>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser um escritor para acessar este plano de leitura.</p>
      </div>
    );
  }

  const gate = await getReaderContentGate(userReader.writerId, session.user.id, "prayer");
  if (!gate.allowed) {
    return <ScreenSubscription slug={userReader.writer?.slug || ""} />;
  }


    return (
        <section style={{ backgroundImage: prayer?.imageUrl ? `url(${prayer?.imageUrl}), linear-gradient(to bottom right, #f9fafb, #e5e7eb)` : undefined, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }} 
        className="w-screen flex flex-col items-center justify-center py-10 px-4 min-h-screen">
            <div className="flex w-full max-w-xl flex-col gap-4">
            <BackButton href="/reader/area/daily" className="self-start" />
            {!prayer ? (
                <GlassCard strong className="text-center text-gray-500">
                    <span className="block text-2xl mb-2">🙏</span>
                    Nenhuma oração encontrada.
                </GlassCard>
            ) : (
                <div className="space-y-8">
                    <GlassCard
                        strong
                        className="relative flex w-full flex-col items-center justify-center gap-4 md:max-w-[31.25rem]"
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

                                {prayer.audioUrl && (
                                    <div className="mt-4 w-full">
                                        <audio controls className="w-full">
                                            <source src={prayer.audioUrl as string} type="audio/mpeg" />
                                            Seu navegador não suporta o elemento de áudio.
                                        </audio>
                                    </div>
                                )}

                            <div>
                                <CompletePrayer prayerId={prayer.id} />
                            </div>
                        </GlassCard>
                </div>
            )}
            </div>

        </section>
    );
}
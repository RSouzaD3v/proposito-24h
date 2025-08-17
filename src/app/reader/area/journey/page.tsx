import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { FaMedal, FaQuoteRight, FaBible } from "react-icons/fa";

export default async function JourneyPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return;
    }

    const userCompetetionsDevotional = await db.userCompletationDevotional.findMany({
        where: {
            userId: session.user.id
        }
    });

    const completedVerses = await db.userCompletationVerse.count({
        where: { userId: session.user.id }
    });

    const completedQuotes = await db.userCompletationQuote.count({
        where: { userId: session.user.id }
    });

    const totalSteps = 10;
    const completed = userCompetetionsDevotional.length;

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href={"/reader/area"}>
                        <FiArrowLeft className="text-3xl text-amber-700 hover:text-amber-900 transition" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-amber-900 flex-1 text-center drop-shadow">Minha Jornada</h2>
                </div>

                <div className="flex justify-center my-8">
                    <img
                        className="w-[140px] drop-shadow-2xl rounded-full border-4 border-amber-200 bg-white"
                        src="/gifs/seed.gif"
                        alt="Semente crescendo"
                    />
                </div>

                <Card className="shadow-xl border-amber-200 bg-white/80 backdrop-blur">
                    <CardHeader className="flex flex-col items-center gap-2 rounded-t-lg">
                        <h3 className="text-xl font-bold text-amber-800 tracking-wide drop-shadow">PROGRESSO DA ÁRVORE</h3>
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-1 rounded-full text-white font-bold shadow-lg text-lg">
                            {completed} / {totalSteps}
                        </span>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center py-8">
                        <div className="flex gap-3 mb-4">
                            {Array.from({ length: totalSteps }, (_, i) => (
                                <div
                                    key={i}
                                    className={`w-9 h-4 rounded-full transition-all duration-300 ${
                                        i < completed
                                            ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg scale-110"
                                            : "bg-gray-200"
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-base text-amber-800 font-medium">
                            {completed === totalSteps
                                ? "🌳 Parabéns! Você completou sua jornada!"
                                : "Continue avançando para completar sua árvore!"}
                        </span>
                    </CardContent>
                </Card>

                {/* Card de Estatísticas */}
                <Card className="shadow-xl mt-10 bg-white/80 backdrop-blur">
                    <CardHeader className="flex flex-col items-center gap-2 rounded-t-lg">
                        <h3 className="text-xl font-bold text-amber-800 tracking-wide drop-shadow">SUAS CONQUISTAS</h3>
                    </CardHeader>
                    <CardContent className="flex flex-row justify-around py-8 gap-6">
                        <div className="flex flex-col items-center">
                            <FaMedal className="text-3xl text-amber-500 mb-1 drop-shadow" />
                            <span className="text-amber-700 font-extrabold text-2xl">{userCompetetionsDevotional.length}</span>
                            <span className="text-gray-700 text-sm font-medium">Devocionais</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaBible className="text-3xl text-amber-400 mb-1 drop-shadow" />
                            <span className="text-amber-700 font-extrabold text-2xl">{completedVerses}</span>
                            <span className="text-gray-700 text-sm font-medium">Versículos</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaQuoteRight className="text-3xl text-amber-300 mb-1 drop-shadow" />
                            <span className="text-amber-700 font-extrabold text-2xl">{completedQuotes}</span>
                            <span className="text-gray-700 text-sm font-medium">Citações</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

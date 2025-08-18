import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { FaMedal, FaQuoteRight, FaBible } from "react-icons/fa";

export default async function JourneyPage() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    const userCompetetionsDevotional = await db.userCompletationDevotional.findMany({
        where: { userId: session.user.id }
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-6 px-2 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/reader/area" className="p-2 rounded-full hover:bg-amber-100 transition">
                        <FiArrowLeft className="text-2xl text-amber-700" />
                    </Link>
                    <h2 className="flex-1 text-center text-2xl md:text-3xl font-bold text-amber-900 tracking-tight">
                        Minha Jornada
                    </h2>
                </div>

                <div className="flex justify-center">
                    <img
                        className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-amber-100 bg-white shadow-md object-cover"
                        src="/gifs/seed.gif"
                        alt="Semente crescendo"
                    />
                </div>

                <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-col items-center gap-1">
                        <h3 className="text-lg md:text-xl font-semibold text-amber-800">Progresso da Árvore</h3>
                        <span className="bg-amber-400/90 px-4 py-0.5 rounded-full text-white font-semibold text-base shadow">
                            {completed} / {totalSteps}
                        </span>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                        <div className="flex gap-1 md:gap-2 mb-3">
                            {Array.from({ length: totalSteps }, (_, i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-2 md:w-8 md:h-3 rounded-full transition-all duration-300 ${
                                        i < completed
                                            ? "bg-gradient-to-r from-amber-300 to-amber-500 shadow scale-105"
                                            : "bg-gray-200"
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm md:text-base text-amber-800 font-medium text-center">
                            {completed === totalSteps
                                ? "🌳 Parabéns! Você completou sua jornada!"
                                : "Continue avançando para completar sua árvore!"}
                        </span>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-col items-center gap-1">
                        <h3 className="text-lg md:text-xl font-semibold text-amber-800">Suas Conquistas</h3>
                    </CardHeader>
                    <CardContent className="flex flex-row justify-between md:justify-around py-6 gap-2 md:gap-6">
                        <div className="flex flex-col items-center min-w-[70px]">
                            <FaMedal className="text-2xl md:text-3xl text-amber-500 mb-1" />
                            <span className="text-amber-700 font-bold text-lg md:text-2xl">{userCompetetionsDevotional.length}</span>
                            <span className="text-gray-600 text-xs md:text-sm font-medium">Devocionais</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[70px]">
                            <FaBible className="text-2xl md:text-3xl text-amber-400 mb-1" />
                            <span className="text-amber-700 font-bold text-lg md:text-2xl">{completedVerses}</span>
                            <span className="text-gray-600 text-xs md:text-sm font-medium">Versículos</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[70px]">
                            <FaQuoteRight className="text-2xl md:text-3xl text-amber-300 mb-1" />
                            <span className="text-amber-700 font-bold text-lg md:text-2xl">{completedQuotes}</span>
                            <span className="text-gray-600 text-xs md:text-sm font-medium">Citações</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

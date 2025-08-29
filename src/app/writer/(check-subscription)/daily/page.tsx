import { FaBook, FaFileExcel, FaQuoteLeft, FaDailymotion, FaPray } from "react-icons/fa";
import Link from "next/link";
import { FiArrowLeft, FiBook } from "react-icons/fi";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function DailyPage() {
    const itemsNav = [
        {
            id: 1,
            title: "Minha Citação (Hoje)",
            href: "/writer/daily/quote",
            icon: <FaQuoteLeft size={32} />
        },
        {
            id: 2,
            title: "Meu Devocional (Hoje)",
            href: "/writer/daily/devotional",
            icon: <FiBook size={32} />
        },
        {
            id: 3,
            title: "Minha passagem (Hoje)",
            href: "/writer/daily/verse",
            icon: <FaBook size={32} />
        },
        {
            id: 4,
            title: "Minha oração (Hoje)",
            href: "/writer/daily/prayer",
            icon: <FaPray size={32} />
        },
        {
            id: 5,
            title: "Postagem em massa",
            href: "/writer/imports",
            icon: <FaFileExcel size={32} />
        },
        {
            id: 6,
            title: "Gerenciamento Diário",
            href: "/writer/daily/management",
            icon: <FaDailymotion size={32} />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center py-10 px-5">
            <Link
                href="/writer/dashboard"
                className="mb-8 flex items-center gap-2 absolute top-5 left-5 text-indigo-700 font-bold text-lg hover:text-indigo-900 transition-colors"
            >
                <FiArrowLeft size={24} />
                Voltar
            </Link>
            <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">
                Painel Diário
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                {itemsNav.map((item) => (
                    <Link key={item.id} href={item.href} className="group">
                        <Card className="cursor-pointer transition-transform transform group-hover:-translate-y-2 group-hover:shadow-xl flex flex-col items-center bg-white border border-gray-200 rounded-lg">
                            <CardContent className="flex flex-col items-center p-6">
                                <div className="mb-4 text-indigo-600 group-hover:text-indigo-800 transition-colors">
                                    {item.icon}
                                </div>
                                <CardTitle className="text-lg font-semibold text-gray-700 text-center group-hover:text-gray-900 transition-colors">
                                    {item.title}
                                </CardTitle>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
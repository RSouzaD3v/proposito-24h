import { FaBook, FaFileExcel, FaQuoteLeft, FaDailymotion, FaPray } from "react-icons/fa";
import Link from "next/link";
import { FiArrowLeft, FiBook } from "react-icons/fi";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-5xl flex items-center mb-10">
                <Link href="/writer/dashboard">
                    <Button variant="ghost" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900">
                        <FiArrowLeft size={22} />
                        Voltar
                    </Button>
                </Link>
                <h1 className="flex-1 text-4xl font-extrabold text-center text-indigo-900 tracking-tight">
                    Painel Diário
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                {itemsNav.map((item) => (
                    <Link key={item.id} href={item.href} className="group">
                        <Card className="transition-all duration-200 hover:scale-105 hover:shadow-2xl border-0 bg-gradient-to-br from-white via-indigo-50 to-indigo-100">
                            <CardHeader className="flex flex-col items-center pt-8 pb-2">
                                <span className="rounded-full bg-indigo-100 group-hover:bg-indigo-200 p-4 mb-4 text-indigo-700 group-hover:text-indigo-900 shadow-md transition-colors">
                                    {item.icon}
                                </span>
                                <CardTitle className="text-lg font-semibold text-center text-indigo-900 group-hover:text-indigo-700 transition-colors">
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent />
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
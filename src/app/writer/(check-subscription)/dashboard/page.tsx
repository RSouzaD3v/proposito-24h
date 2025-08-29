import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Logout from "../_components/Logout";
import { ClipboardLink } from "./_components/ClipboardLink";

export default async function WriterDashboardPage() {
  const session = await getServerSession(authOptions);

  const itemsNav = [
    { id: 2, title: "Diário", href: "/writer/daily" },
    { id: 1, title: "Minhas Publicações", href: "/writer/publications" },
    { id: 3, title: "Configurações", href: "/writer/settings" },
  ];

  if (!session?.user || session.user.role !== "WRITER_ADMIN") {
    redirect("/login");
  }

  const writerId = session.user.writerId!;
  const writer = await db.writer.findUnique({
    where: { id: writerId },
  });

  return (
    <div className={`max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-12`}>
      {/* Navigation */}
      <nav className="mb-10 flex flex-wrap gap-6 items-center border-b pb-4">
        {itemsNav.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
          >
            {item.title}
          </Link>
        ))}
        <Logout />
      </nav>

      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {session.user.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-1">
            Bem-vindo, {session.user.name} 👋
          </h1>
          <p className="text-gray-500 text-sm">Painel do escritor</p>
        </div>
      </div>

      {/* Writer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-blue-50 flex items-center gap-2 rounded-lg p-6 border border-blue-200 shadow-sm">
          <span className="text-gray-500 text-xs uppercase">Plataforma</span>
          <span className="font-bold text-xl text-gray-800">{writer?.name}</span>
        </div>
        <div className="bg-blue-50 flex items-center gap-2 rounded-lg p-6 border border-blue-200 shadow-sm">
          <span className="text-gray-500 text-xs uppercase">Subdomínio</span>
          <span className="font-bold text-xl text-gray-800">{writer?.slug}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-sm flex items-center gap-4">
          <span className="text-gray-500 text-xs uppercase">Cor primária</span>
          <span
            className="inline-block w-8 h-8 rounded-full border"
            style={{ backgroundColor: writer?.colorPrimary ?? "#e5e7eb" }}
          />
          <span className="text-sm text-gray-700">{writer?.colorPrimary}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-sm flex items-center gap-4">
          <span className="text-gray-500 text-xs uppercase">Cor secundária</span>
          <span
            className="inline-block w-8 h-8 rounded-full border"
            style={{ backgroundColor: writer?.colorSecondary ?? "#e5e7eb" }}
          />
          <span className="text-sm text-gray-700">{writer?.colorSecondary}</span>
        </div>
      </div>

      {/* Clipboard Link */}
      {writer?.slug && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-lg shadow-inner flex items-center gap-4">
          <ClipboardLink slug={writer?.slug} />
        </div>
      )}
    </div>
  );
}

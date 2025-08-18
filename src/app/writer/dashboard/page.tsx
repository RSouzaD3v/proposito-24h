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
    {
      id: 2,
      title: "Diário",
      href: "/writer/daily",
    },
    {
      id: 1,
      title: "Minhas Publicações",
      href: "/writer/publications",
    },
    {
      id: 3,
      title: "Configurações",
      href: "/writer/settings",
    },
  ];

  if (!session?.user || session.user.role !== "WRITER_ADMIN") {
    redirect("/login");
  }

  const writerId = session.user.writerId!;
  const writer = await db.writer.findUnique({
    where: { id: writerId },
  });

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      {/* Navigation */}
      <nav className="mb-8 flex flex-wrap gap-4 items-center border-b pb-4">
        {itemsNav.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="text-blue-600 hover:underline font-medium"
          >
            {item.title}
          </Link>
        ))}

        <Logout />
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow">
          {session.user.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Bem-vindo, {session.user.name} 👋</h1>
          <p className="text-gray-500 text-sm">Painel do escritor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col gap-2">
          <span className="text-gray-500 text-xs">Plataforma</span>
          <span className="font-semibold text-lg">{writer?.name}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col gap-2">
          <span className="text-gray-500 text-xs">Subdomínio</span>
          <span className="font-semibold text-lg">{writer?.slug}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center gap-3">
          <span className="text-gray-500 text-xs">Cor primária</span>
          <span
            className="inline-block w-6 h-6 rounded-full border"
            style={{ backgroundColor: writer?.colorPrimary ?? "#e5e7eb" }}
          />
          <span className="text-xs text-gray-700">{writer?.colorPrimary}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center gap-3">
          <span className="text-gray-500 text-xs">Cor secundária</span>
          <span
            className="inline-block w-6 h-6 rounded-full border"
            style={{ backgroundColor: writer?.colorSecondary ?? "#e5e7eb" }}
          />
          <span className="text-xs text-gray-700">{writer?.colorSecondary}</span>
        </div>
      </div>

        {writer?.slug && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-200 rounded-lg shadow-inner flex items-center gap-3">
            <ClipboardLink slug={writer?.slug} />
          </div>
        )}
    </div>
  );
}
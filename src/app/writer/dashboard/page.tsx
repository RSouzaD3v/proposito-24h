import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function WriterDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "WRITER_ADMIN") {
    redirect("/login");
  }

  const writerId = session.user.writerId!;
  const writer = await db.writer.findUnique({
    where: { id: writerId },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Bem-vindo, {session.user.name} 👋</h1>
      <p className="text-gray-600">Plataforma: <strong>{writer?.name}</strong></p>
      <p className="text-gray-600">Subdomínio: <strong>{writer?.slug}.seudominio.com</strong></p>
      <p className="text-gray-600">Cor primária: <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: writer?.colorPrimary ?? undefined }} /></p>
      <p className="text-gray-600">Cor secundária: <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: writer?.colorSecondary ?? undefined }} /></p>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800 text-sm">
          Em breve você verá aqui suas publicações, vendas e relatórios personalizados!
        </p>
      </div>
    </div>
  );
}

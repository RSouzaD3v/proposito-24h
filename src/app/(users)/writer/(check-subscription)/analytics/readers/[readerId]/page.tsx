import { apiGetOrNull } from "@/lib/api/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { notFound, redirect } from "next/navigation";
import ReaderDashboard from "./_components/ReaderDashboard";

export default async function ReaderAnalyticsPage({
  params,
}: {
  params: Promise<{ readerId: string }>; // Next.js 15 (streaming params)
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in?next=/writer/analytics");

  const { readerId } = await params;

  // Permissões: WRITER_ADMIN pode gerenciar somente seus leitores.
  // ADMIN master pode ver qualquer leitor (opcional – mantenho por compatibilidade).
  const role = (session.user as any).role as "ADMIN" | "WRITER_ADMIN" | "CLIENT" | undefined;
  const sessionWriterId = (session.user as any).writerId as string | undefined;

  if (role !== "WRITER_ADMIN" && role !== "ADMIN") {
    redirect("/reader/area");
  }

  const details = await apiGetOrNull<any>(`/writer/analytics/readers/${readerId}`);
  if (!details) notFound();
  const { reader, writer } = details;

  return (
    <ReaderDashboard
      initialData={{
        sessionUser: { id: session.user.id, role, writerId: sessionWriterId },
        writer,
        reader,
      }}
    />
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
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

  // Busca leitor + relações principais
  const reader = await db.user.findUnique({
    where: { id: readerId },
    include: {
      readerSubscriptions: {
        orderBy: { createdAt: "desc" },
      },
      purchases: {
        orderBy: { createdAt: "desc" },
        include: {
          publication: {
            select: { id: true, title: true, type: true, slug: true },
          },
        },
      },
      _count: {
        select: {
          purchases: true,
          readerSubscriptions: true,
          userCompletationQuote: true,
          userCompletationDevotional: true,
          userCompletationVerse: true,
          userCompletationPrayer: true,
        },
      },
    },
  });

  if (!reader) notFound();

  // Se WRITER_ADMIN, garantir que o leitor pertence ao mesmo writer
  if (role === "WRITER_ADMIN") {
    if (!sessionWriterId || reader.writerId !== sessionWriterId) notFound();
  }

  // Carregar dados do writer (cores, nome) para header/contexto
  const writer = reader.writerId
    ? await db.writer.findUnique({ where: { id: reader.writerId } })
    : null;

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

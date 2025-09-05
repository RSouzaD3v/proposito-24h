// app/(reader)/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { AuthReaderProvider } from "./_contexts/AuthContext";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { redirect } from "next/navigation";

import PushBootstrap from "@/components/PushBootstrap";
import { PainelControl } from "./_components/PainelControl";

export default async function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in?from=/reader/area");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, writer: { select: { id: true } } },
  });

  if (!user?.writer?.id) {
    // Fallback simples (sem <html>/<body>)
    return (
      <section className="p-8">
        <h1 className="text-xl font-bold mb-2">Conta sem escritor vinculado</h1>
        <p className="opacity-80">
          Vincule sua conta a um escritor para acessar a área do leitor.
        </p>
      </section>
    );
  }

  return (
    <AuthReaderProvider>
      <ThemeWriterProvider>
        <PushBootstrap writerId={user.writer.id} userId={user.id} />
        <PainelControl />
        <section>{children}</section>
      </ThemeWriterProvider>
    </AuthReaderProvider>
  );
}

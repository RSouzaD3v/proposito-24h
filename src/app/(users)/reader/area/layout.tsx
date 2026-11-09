import { apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
// app/(reader)/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { AuthReaderProvider } from "./_contexts/AuthContext";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { redirect } from "next/navigation";

import PushBootstrap from "@/components/PushBootstrap";
import { PainelControl } from "./_components/PainelControl";
import { MenuPainel } from "./_components/MenuPainel";
import TeacherBibleAI from "@/components/TeacherBibleAi";
import { TrackAccess } from "@/components/TrackAccess";
import { WriterShell } from "@/components/ui/writer-shell";

export default async function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in?from=/reader/area");
  }

  const user = await apiGetOrNull<ReaderProfile>("/reader/profile");

  if (!user?.writer?.id) {
    return (
      <section className="p-8">
        <h1 className="mb-2 text-xl font-bold">
          Conta sem escritor vinculado
        </h1>
        <p className="opacity-80">
          Vincule sua conta a um escritor para acessar a área do leitor.
        </p>
      </section>
    );
  }

  return (
    <AuthReaderProvider>
      <ThemeWriterProvider>
        <WriterShell contained={false} background="plain" className="reader-premium bg-[var(--reader-bg)] pb-28 dark:bg-[var(--reader-bg)]">
          <PushBootstrap writerId={user.writer.id} userId={user.id} />
          <PainelControl />
          <section className="relative z-0 w-full">
            {children}
          </section>
          <MenuPainel />
          <div data-reader-chrome>
            <TeacherBibleAI />
          </div>
          <TrackAccess />
        </WriterShell>
      </ThemeWriterProvider>
    </AuthReaderProvider>
  );
}

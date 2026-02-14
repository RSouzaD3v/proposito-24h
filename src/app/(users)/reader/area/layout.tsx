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
import TeacherBibleAI from "@/components/TeacherBibleAi";
import { TrackAccess } from "@/components/TrackAccess";
// import { GroupingPickerGate } from "./_components/GroupingPickerGate";
// import { GroupingCompletionGate } from "./_components/GroupingCompletionGate";


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
    select: {
      id: true,
      writer: { select: { id: true } },
    },
  });

  if (!user?.writer?.id) {
    return (
      <section className="p-8">
        <h1 className="text-xl font-bold mb-2">
          Conta sem escritor vinculado
        </h1>
        <p className="opacity-80">
          Vincule sua conta a um escritor para acessar a área do leitor.
        </p>
      </section>
    );
  }

  // 🔹 Busca grouping ativo do usuário
  // const userGrouping = await db.userGroupingDaily.findFirst({
  //   where: {
  //     userId: user.id,
  //     status: "ACTIVE",
  //   },
  //   select: {
  //     id: true,
  //     status: true,
  //   },
  // });

  // 🔹 Busca todos os groupings disponíveis do writer
  // const groupings = await db.groupingDaily.findMany({
  //   where: {
  //     writerId: user.writer.id,
  //     active: true,
  //   },
  //   select: {
  //     id: true,
  //     title: true,
  //     description: true,
  //     imageUrl: true,
  //   },
  // });

  // 🔹 Decide se deve forçar escolha
  // const shouldShowGroupingPicker =
  //   !userGrouping || userGrouping.status === "COMPLETED";

  return (
    <AuthReaderProvider>
      <ThemeWriterProvider>
        <PushBootstrap writerId={user.writer.id} userId={user.id} />

        {/* <GroupingCompletionGate /> */}

        {/* 🔥 Modal FULLSCREEN se precisar */}
        {/* <GroupingPickerGate
          shouldShow={shouldShowGroupingPicker}
          groupings={groupings}
        /> */}

        <PainelControl />

        <section>{children}</section>

        <TeacherBibleAI />
        <TrackAccess />
      </ThemeWriterProvider>
    </AuthReaderProvider>
  );
}

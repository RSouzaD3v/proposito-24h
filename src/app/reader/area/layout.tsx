// app/(reader)/layout.tsx  ← ajuste o caminho conforme seu projeto
import { AuthReaderProvider } from "./_contexts/AuthContext";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";

// 🔽 novos imports (server side)
import { headers } from "next/headers";
import { db } from "@/lib/db";

// (opcional) se tiver NextAuth no reader:
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

// 🔽 componente client que já criamos antes
import PushBootstrap from "@/components/PushBootstrap";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // --- SERVER: resolve writerId pelo subdomínio ---
  const host = (await headers()).get("host") ?? "";
  const sub = host.split(":")[0].split(".")[0]; // ex.: rafael.proposito24h.com
  let writerId: string | undefined;

  if (sub && !["www", "app", "localhost"].includes(sub)) {
    const writer = await db.writer.findFirst({
      where: { slug: sub },
      select: { id: true },
    });
    writerId = writer?.id;
  }

  // (opcional) pegar o userId autenticado
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <AuthReaderProvider>
      <ThemeWriterProvider>
        {/* Bootstrap automático:
            - registra /sw.js
            - pergunta permissão 1x (marca em localStorage)
            - se "granted", assina e salva via /api/push/subscribe
            - topics: ["new-book"] (padrão para novo livro do writer) */}
        <PushBootstrap writerId={writerId} userId={userId} />

        <section>
          {/* <HeaderReader /> */}
          <div>{children}</div>
          {/* <MenuPainel /> */}
        </section>
      </ThemeWriterProvider>
    </AuthReaderProvider>
  );
}

import Link from "next/link";
import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { LastRead, LibraryBook, ReaderProfile } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { LibraryView } from "./_components/LibraryView";

export default async function CoursesPage() {
  const userLogged = await apiGetOrNull<ReaderProfile>("/reader/profile");

  if (!userLogged || !userLogged.writerId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <GlassCard strong className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl">Acesso negado</h2>
          <p className="text-[var(--liquid-muted)]">Você precisa estar logado para acessar esta página.</p>
          <Button asChild variant="glass-primary" className="rounded-full">
            <Link href="/login">Fazer login</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  const { books, myBooks, lastRead } = await apiGet<{ books: LibraryBook[]; myBooks: LibraryBook[]; lastRead: LastRead | null }>("/reader/library");

  return <LibraryView books={books} myBooks={myBooks} lastRead={lastRead} />;
}

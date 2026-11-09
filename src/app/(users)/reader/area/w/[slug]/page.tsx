import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { BackButton } from "@/components/ui/back-button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import { apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { authOptions } from "@/lib/authOption";

export default async function WriterPlansPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { slug } = await params;
  const profile = await apiGetOrNull<ReaderProfile>("/reader/profile");
  const writer = profile?.writer?.slug === slug ? profile.writer : null;

  if (!writer) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl text-[var(--liquid-ink)]">Escritor não encontrado</h1>
        <p className="mt-2 text-sm text-[var(--liquid-muted)]">Você só pode assinar o escritor vinculado à sua conta.</p>
        <Link href="/reader/area" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const name = writer.name.trim();
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <BackButton href="/reader/area" className="mb-6" />
      <header className="mb-8 flex items-center gap-4">
        {writer.logoUrl ? (
          <OptimizedImage src={writer.logoUrl} alt="" width={64} height={64} className="size-16 shrink-0 rounded-2xl object-contain" />
        ) : (
          <span className="reader-serif grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-2xl">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="reader-eyebrow">Assinatura</p>
          <h1 className="mt-1 text-[1.75rem] leading-tight text-[var(--liquid-ink)]">Assine {name}</h1>
          <p className="mt-1 text-sm text-[var(--liquid-muted)]">Libere todos os conteúdos exclusivos deste escritor.</p>
        </div>
      </header>
      <SubscribeWidget writerId={writer.id} />
    </div>
  );
}

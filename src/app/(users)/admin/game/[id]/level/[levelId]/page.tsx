// app/admin/game/[id]/level/[levelId]/page.tsx
import { notFound } from "next/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import { BackButton } from "@/components/ui/back-button";
import { requireAdmin } from "../../../../_lib/auth";
import { LevelEditor, type LevelData } from "./_components/LevelEditor";

export default async function AdminGameLevelPage({ params }: { params: Promise<{ id: string; levelId: string }> }) {
  await requireAdmin();
  const { id, levelId } = await params;
  const level = await apiGetOrNull<LevelData>(`/admin/levels/${levelId}`);
  if (!level || level.gameTemplate.id !== id) notFound();

  return (
    <section className="space-y-6">
      <BackButton href={`/admin/game/${id}`} label={level.gameTemplate.title} />
      <header className="animate-glass-in">
        <p className="text-sm font-medium text-[var(--liquid-accent)]">{level.gameTemplate.title}</p>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Nível {level.order}</h1>
        <p className="text-sm text-[var(--liquid-muted)]">Monte a roda de letras e as palavras que o leitor precisa encontrar.</p>
      </header>
      <LevelEditor level={level} />
    </section>
  );
}

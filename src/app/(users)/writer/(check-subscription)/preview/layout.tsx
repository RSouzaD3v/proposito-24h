import TeacherBibleAI from "@/components/TeacherBibleAi";
import { WriterShell } from "@/components/ui/writer-shell";
import { apiGetOrNull } from "@/lib/api/server";
import { MenuPainel } from "@/app/(users)/reader/area/_components/MenuPainel";
import { PainelControl } from "@/app/(users)/reader/area/_components/PainelControl";
import { ThemeWriterProvider } from "@/app/(users)/reader/area/_contexts/ThemeWriterContext";

/** Mesma moldura da área do leitor, com o menu visível porém inativo. Carregada dentro do iframe da prévia. */
export default async function WriterPreviewLayout({ children }: { children: React.ReactNode }) {
  const writer = await apiGetOrNull<{ logoUrl: string | null; colorPrimary: string | null; colorSecondary: string | null }>(
    "/writer/profile",
  );

  return (
    <ThemeWriterProvider
      preview={{
        logoUrl: writer?.logoUrl ?? "",
        colorPrimary: writer?.colorPrimary ?? "",
        colorSecondary: writer?.colorSecondary ?? "",
      }}
    >
      <WriterShell contained={false} background="plain" className="reader-premium bg-[var(--reader-bg)] pb-28 dark:bg-[var(--reader-bg)]">
        <div inert>
          <PainelControl />
        </div>
        <section className="relative z-0 w-full">{children}</section>
        <div inert>
          <MenuPainel />
          <div data-reader-chrome>
            <TeacherBibleAI />
          </div>
        </div>
      </WriterShell>
    </ThemeWriterProvider>
  );
}

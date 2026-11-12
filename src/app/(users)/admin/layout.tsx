// app/admin/layout.tsx
import { requireAdmin } from "./_lib/auth";
import Sidebar from "./_components/Sidebar";
import { WriterShell } from "@/components/ui/writer-shell";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireAdmin();

  return (
    <WriterShell contained={false} className="admin-shell">
      <div className="min-h-screen w-full md:grid md:grid-cols-[264px_1fr]">
        <Sidebar userName={session.user.name ?? "Administrador"} userEmail={session.user.email ?? ""} />
        <main className="min-w-0 px-4 pb-10 pt-4 md:px-8 md:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
            <footer className="mt-12 border-t border-white/50 pt-6 text-xs text-[var(--liquid-muted)]">
              © {new Date().getFullYear()} Proposito24h — Painel administrativo
            </footer>
          </div>
        </main>
      </div>
    </WriterShell>
  );
}

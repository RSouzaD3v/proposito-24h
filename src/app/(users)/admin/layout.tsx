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
      <div className="min-h-screen w-full md:grid md:grid-cols-[248px_1fr]">
        <Sidebar userName={session.user.name ?? "Administrador"} userEmail={session.user.email ?? ""} />
        <main className="min-w-0 px-4 pb-12 pt-5 md:px-10 md:pt-9">
          <div className="mx-auto w-full max-w-7xl">
            {children}
            <footer className="mt-14 border-t border-[var(--admin-line)] pt-5 text-xs text-[var(--liquid-muted)]">
              Propósito24h · administração · {new Date().getFullYear()}
            </footer>
          </div>
        </main>
      </div>
    </WriterShell>
  );
}

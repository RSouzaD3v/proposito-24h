// app/admin/layout.tsx
import { requireAdmin } from "./_lib/auth";
import Sidebar from "../admin/_components/Sidebar";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="px-4 md:px-8 py-6">
        {children}
        <Separator className="my-8" />
        <footer className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Proposito24h — Admin
        </footer>
      </main>
    </div>
  );
}

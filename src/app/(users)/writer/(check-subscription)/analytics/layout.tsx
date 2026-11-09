import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/server";
import Sidebar from "./_components/Sidebar";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Analytics — Escritor" };

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const access = await apiFetch<unknown>("/writer/profile");
  if (!access.ok) redirect(access.status === 401 ? "/login" : "/");

  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="px-4 py-6 md:px-8">
        {children}
        <Separator className="my-8 bg-white/40" />
        <footer className="text-xs text-[var(--liquid-muted)]">
          © {new Date().getFullYear()} — Analytics do Escritor
        </footer>
      </main>
    </div>
  );
}

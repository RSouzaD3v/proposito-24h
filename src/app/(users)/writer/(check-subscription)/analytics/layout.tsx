import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/server";

export const metadata = { title: "Insights — Escritor" };

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const access = await apiFetch<unknown>("/writer/profile");
  if (!access.ok) redirect(access.status === 401 ? "/login" : "/");

  return <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-5 md:px-10 md:pt-9">{children}</div>;
}

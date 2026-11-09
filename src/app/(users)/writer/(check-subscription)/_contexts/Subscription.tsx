import { apiFetch } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ReactNode } from "react";
import GateSignOut from "../_components/GateSignOut";

export default async function SubscriptionWriter({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const status = await apiFetch<{ active: boolean }>("/writer/subscription-status");
  // Leitor não entra na área do escritor.
  if (status.status === 403) redirect("/reader/area");
  const subscription = status.ok && status.data.active;

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 rounded-lg shadow-md p-8">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          className="mb-4"
        >
          <circle cx="12" cy="12" r="10" fill="#e0e7ff" />
          <path
            d="M12 8v4m0 4h.01"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-lg text-gray-700 mb-2">Você precisa se cadastrar</p>
        <span className="text-gray-500 text-base">
          Para acessar este conteúdo, faça seu cadastro como escritor.
        </span>
        <Link
          className="bg-blue-600 text-white rounded-md px-4 py-2 my-5"
          href={"/writer/subscription"}
        >
          Assinar Agora
        </Link>
        <GateSignOut />
      </div>
    );
  }

  return <>{children}</>;
}

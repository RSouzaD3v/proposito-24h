import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LockKeyhole } from "lucide-react";
import { StatusScreen, statusPrimaryButton } from "@/components/subscriptions/StatusScreen";
import { apiFetch } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
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
      <StatusScreen
        icon={<LockKeyhole className="size-5" aria-hidden />}
        title="Sua assinatura não está ativa"
        text="Ative a assinatura da plataforma para publicar conteúdo e manter seu espaço no ar para os leitores."
      >
        <Link href="/writer/subscription" className={statusPrimaryButton}>
          Ativar assinatura
        </Link>
        <GateSignOut />
      </StatusScreen>
    );
  }

  return <>{children}</>;
}

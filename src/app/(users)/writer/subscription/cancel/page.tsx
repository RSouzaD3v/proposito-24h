import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { StatusScreen, statusPrimaryButton } from "@/components/subscriptions/StatusScreen";

export default function SubscriptionCancelPage() {
  return (
    <StatusScreen
      icon={<CircleAlert className="size-5" aria-hidden />}
      tone="warning"
      title="Pagamento não concluído"
      text="Sua assinatura ainda não foi ativada. Você pode tentar de novo quando quiser."
    >
      <Link href="/writer/subscription" className={statusPrimaryButton}>
        Tentar novamente
      </Link>
    </StatusScreen>
  );
}

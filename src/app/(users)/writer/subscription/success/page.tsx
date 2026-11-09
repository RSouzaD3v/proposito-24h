import Link from "next/link";
import { Check } from "lucide-react";
import { StatusScreen, statusPrimaryButton } from "@/components/subscriptions/StatusScreen";

export default function SubscriptionSuccessPage() {
  return (
    <StatusScreen
      icon={<Check className="size-5" aria-hidden />}
      tone="success"
      title="Assinatura iniciada"
      text="Se o pagamento ainda estiver em processamento, sua plataforma é liberada automaticamente assim que o Asaas confirmar."
    >
      <Link href="/writer/dashboard" className={statusPrimaryButton}>
        Ir para o painel
      </Link>
    </StatusScreen>
  );
}

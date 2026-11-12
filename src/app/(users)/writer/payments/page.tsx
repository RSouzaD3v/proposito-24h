import { apiGetOrNull } from "@/lib/api/server";
import { WriterPayments } from "./_components/WriterPayments";

/**
 * Fora do grupo (check-subscription): conectar a conta de recebimento não exige a assinatura ativa.
 * O retorno do cadastro do Stripe chega aqui com ?provider=STRIPE&done=1 (ou &retry=1).
 */
export default async function WriterPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; done?: string; retry?: string }>;
}) {
  const { provider, done, retry } = await searchParams;
  const profile = await apiGetOrNull<{ id: string }>("/writer/profile").catch(() => null);

  return (
    <WriterPayments
      returnProvider={provider ?? null}
      returnDone={done === "1"}
      returnRetry={retry === "1"}
      plansHref={profile ? `/writer/${profile.id}/plans` : null}
    />
  );
}

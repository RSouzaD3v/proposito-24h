import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import MySubscriptions from "@/components/subscriptions/MySubscriptions";
import { BackButton } from "@/components/ui/back-button";
import { apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { authOptions } from "@/lib/authOption";

export default async function ReaderSubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await apiGetOrNull<ReaderProfile>("/reader/profile");

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <BackButton href="/reader/area/settings" className="mb-6" />
      <h1 className="text-[1.75rem] leading-tight text-[var(--liquid-ink)]">Minha assinatura</h1>
      <p className="mt-1 mb-8 text-sm text-[var(--liquid-muted)]">Veja a renovação e cancele quando quiser.</p>
      <MySubscriptions writerSlug={user?.writer?.slug} writerName={user?.writer?.name} />
    </div>
  );
}

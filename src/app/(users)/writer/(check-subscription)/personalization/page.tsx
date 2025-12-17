import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOption";
import PersonalizationForm from "./_components/PersonalizationForm";
import Link from "next/link";

export default async function WriterPersonalizationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const writerId = (session.user as any)?.writerId;

  if (!writerId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Writer não identificado.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={"/writer/dashboard"} className="bg-black text-white p-2 rounded-sm">
            Voltar para dashboard
        </Link>
      <PersonalizationForm writerId={writerId} />
    </div>
  );
}

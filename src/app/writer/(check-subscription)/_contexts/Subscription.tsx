import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ReactNode } from "react";

export default async function SubscriptionWriter({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userWriter || !userWriter.writerId) {
    return null;
  }

  const now = new Date();
  const subscription = await db.writerSubscription.findFirst({
    where: {
      writerId: userWriter.writerId, // ✅ usa o writerId, não o id do usuário
      endedAt: {
        gte: now,
      },
    },
  });

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
      </div>
    );
  }

  return <>{children}</>;
}

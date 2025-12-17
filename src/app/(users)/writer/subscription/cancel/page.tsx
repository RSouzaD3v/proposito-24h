import Link from "next/link";

export default function SubscriptionCancelPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">⚠️ Assinatura não concluída</h1>
      <p className="mt-4 text-gray-700">Você cancelou o processo de pagamento.</p>
      <Link
        href="/writer/subscription"
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Tentar novamente
      </Link>
    </main>
  );
}

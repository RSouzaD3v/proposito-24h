import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">🎉 Assinatura Ativada!</h1>
      <p className="mt-4 text-gray-700">Bem-vindo à plataforma! Agora sua plataforma está ativa.</p>
      <Link
        href="/writer/dashboard"
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Ir para o Dashboard
      </Link>
    </main>
  );
}
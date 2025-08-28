import Link from "next/link";

export default function OnboardingRefreshPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">⚠️ Onboarding não finalizado</h1>
      <p className="mt-4 text-gray-700 max-w-md">
        Parece que você cancelou ou não finalizou o cadastro no Stripe.  
        Sem essa etapa, não é possível receber pagamentos.
      </p>
      <Link
        href="/writer/stripe"
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Tentar novamente
      </Link>
    </main>
  );
}

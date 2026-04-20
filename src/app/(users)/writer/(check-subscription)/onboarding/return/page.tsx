import Link from "next/link";

export default function OnboardingReturnPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">Tudo certo</h1>
      <p className="mt-4 text-gray-700 max-w-md">
        Pagamentos de leitores e vendas são processados pela plataforma via Asaas. Você pode publicar conteúdos pagos
        definindo preço em centavos.
      </p>
      <Link href="/writer/dashboard" className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Ir para o Dashboard
      </Link>
    </main>
  );
}

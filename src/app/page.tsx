import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23272f] flex flex-col font-sans">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4">
        <span className="text-lg font-bold text-blue-700 dark:text-white">p24h</span>
        <Link
          href="/registrar-escritor"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-5 py-2 text-sm shadow transition-colors"
        >
          Seja escritor
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Sua página de escritor, pronta para vender 24h
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
          Crie sua vitrine personalizada, compartilhe seu trabalho e receba pedidos diretamente dos seus clientes. Simples, rápido e com sua marca.
        </p>
        <Link
          href="/registrar-escritor"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-3 text-base shadow transition-colors"
        >
          Comece agora
        </Link>
      </section>

      {/* Benefícios Section */}
      <section className="w-full flex flex-col sm:flex-row justify-center items-center gap-6 py-10">
        <BenefitCard
          title="Personalização total"
          description="Monte sua página do seu jeito, com sua identidade visual."
        />
        <BenefitCard
          title="Venda direta"
          description="Receba pedidos e pagamentos sem intermediários."
        />
        <BenefitCard
          title="Suporte 24h"
          description="Conte com nosso suporte sempre que precisar."
        />
      </section>

      {/* Footer */}
      <footer className="w-full py-6 flex flex-col items-center text-gray-400 text-xs">
        © {new Date().getFullYear()} Propósito 24h
      </footer>
    </div>
  );
}

function BenefitCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-[#23272f] rounded-xl shadow p-6 flex flex-col items-center max-w-xs text-center border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
}

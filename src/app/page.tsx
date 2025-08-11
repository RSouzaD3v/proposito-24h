'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <span className="text-lg font-bold">p24h</span>
        <Link
          href="/registrar-escritor"
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-5 py-2 text-sm font-medium"
        >
          Seja escritor
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-5xl font-bold max-w-2xl mb-4">
          Sua página de escritor, pronta para vender <span className="text-sky-600">24h</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-8">
          Crie sua vitrine personalizada, compartilhe seu trabalho e receba pedidos diretamente dos seus clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/registrar-escritor"
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-full px-6 py-3 text-base"
          >
            Comece agora
          </Link>
          <a
            href="#beneficios"
            className="border border-slate-300 dark:border-slate-600 rounded-full px-6 py-3 text-base hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Saiba mais
          </a>
        </div>
      </main>

      {/* Benefícios */}
      <section id="beneficios" className="grid gap-6 sm:grid-cols-3 px-6 py-10 max-w-5xl mx-auto">
        <BenefitCard title="Personalização total" desc="Monte sua página com sua identidade visual." />
        <BenefitCard title="Venda direta" desc="Receba pagamentos sem intermediários." />
        <BenefitCard title="Suporte 24h" desc="Conte com nosso suporte sempre que precisar." />
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-700">
        © {new Date().getFullYear()} Propósito 24h
      </footer>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center border border-slate-100 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-600 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

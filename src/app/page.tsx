'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-lg font-bold tracking-tight">p24h</span>
        <Link
          href="/register-writer"
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-4 py-2 text-sm transition"
        >
          Seja escritor
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3">
          Sua página de escritor, pronta <span className="text-sky-600">24h</span>
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-300 mb-7 max-w-md">
          Crie sua vitrine personalizada e receba pedidos diretamente dos seus clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/register-writer"
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-5 py-2 text-base transition"
          >
            Comece agora
          </Link>
          <a
            href="#beneficios"
            className="border border-slate-200 dark:border-slate-700 rounded-full px-5 py-2 text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Saiba mais
          </a>
        </div>
      </main>

      {/* Benefícios */}
      <section id="beneficios" className="grid gap-4 sm:grid-cols-3 px-6 py-8 max-w-4xl mx-auto">
        <BenefitCard title="Devocionais" desc="Compartilhe devocionais com seus leitores." />
        <BenefitCard title="Ebooks" desc="Venda e distribua seus ebooks facilmente." />
        <BenefitCard title="Suporte" desc="Conte com nosso suporte sempre." />
      </section>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800">
        © {new Date().getFullYear()} Propósito 24h
      </footer>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-5 text-center border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-medium text-sky-600 mb-1">{title}</h3>
      <p className="text-slate-500 dark:text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

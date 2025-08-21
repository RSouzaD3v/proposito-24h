'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="text-lg font-bold tracking-tight text-sky-600 dark:text-sky-400">
          p24h
        </span>
        <Link
          href="/register-writer"
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-4 py-2 text-sm transition shadow-md"
        >
          Seja escritor
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Sua página de escritor, pronta{' '}
          <span className="text-sky-600 dark:text-sky-400">24h</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-300 mb-8 max-w-lg">
          Crie sua vitrine personalizada e receba pedidos diretamente dos seus clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register-writer"
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-6 py-3 text-lg transition shadow-lg"
          >
            Comece agora
          </Link>
          <a
            href="#beneficios"
            className="border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-md"
          >
            Saiba mais
          </a>
        </div>
      </main>

      {/* Benefícios */}
      <section
        id="beneficios"
        className="grid gap-6 sm:grid-cols-3 px-6 py-12 max-w-5xl mx-auto"
      >
        <BenefitCard
          title="Devocionais"
          desc="Compartilhe devocionais com seus leitores."
        />
        <BenefitCard
          title="Ebooks"
          desc="Venda e distribua seus ebooks facilmente."
        />
        <BenefitCard
          title="Suporte"
          desc="Conte com nosso suporte sempre."
        />
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 text-sm border-t border-slate-100 dark:border-slate-800">
        © {new Date().getFullYear()} Propósito 24h. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-center border border-slate-100 dark:border-slate-700 hover:shadow-xl transition">
      <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

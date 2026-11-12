import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, BookOpen, Check, HandHeart, Palette, Sunrise, UsersRound } from "lucide-react";
import { Header } from "@/components/Header";
import { HeroVideo } from "./_components/HeroVideo";
import { readableOn } from "@/lib/readable-on";
import { getWriterFromHost, type HostWriter } from "@/lib/writer-host";

const primaryCta =
  "inline-flex h-12 items-center justify-center rounded-xl bg-[var(--liquid-accent)] px-7 text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95";
const ghostCta =
  "inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-7 text-[15px] font-bold text-white transition-colors hover:bg-white/10";

const STEPS = [
  { title: "Crie sua plataforma", text: "Escolha o nome, o endereço, a logo e as cores do seu espaço." },
  { title: "Publique seu conteúdo", text: "Organize devocionais, orações, versículos, frases e e-books." },
  { title: "Convide seus leitores", text: "Compartilhe seu link para que cada leitor crie a própria conta." },
];

const WRITER_FEATURES = [
  { icon: Sunrise, title: "Conteúdo diário", text: "Devocionais, orações, versículos e frases para cada dia." },
  { icon: BookOpen, title: "Publicações", text: "Seus livros e e-books reunidos em um só lugar." },
  { icon: UsersRound, title: "Grupos de devocional", text: "Séries e grupos para caminhar junto com seus leitores." },
  { icon: Palette, title: "Sua identidade", text: "Endereço próprio, com sua logo e suas cores." },
  { icon: BarChart3, title: "Acompanhamento", text: "Veja como seus leitores se envolvem com o conteúdo." },
  { icon: HandHeart, title: "Experiência do leitor", text: "Bíblia, diário de oração, jornadas e quizzes." },
];

const READER_FEATURES = [
  { icon: Sunrise, title: "Palavra diária", text: "Devocional, oração e versículo para cada dia." },
  { icon: BookOpen, title: "Leituras", text: "Publicações e a Bíblia sempre à mão." },
  { icon: HandHeart, title: "Vida de oração", text: "Um diário para registrar sua caminhada." },
];

function Hero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="reader-scene reader-scene-night flex min-h-[92svh] items-end">
      <Image src="/bible3d.webp" alt="" fill priority sizes="100vw" />
      <HeroVideo />
      <div className="animate-glass-in mx-auto w-full max-w-6xl px-5 pt-32 pb-16 sm:px-8 sm:pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[2.75rem] leading-[1.08] sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85 sm:text-lg">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
      </div>
    </section>
  );
}

function FeatureGrid({ items }: { items: typeof READER_FEATURES }) {
  return (
    <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <Icon className="size-6 text-[var(--reader-gold)]" aria-hidden />
          <h3 className="mt-3 text-xl">{title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--liquid-muted)]">{text}</p>
        </div>
      ))}
    </div>
  );
}

function Footer({ name, showDocs }: { name: string; showDocs?: boolean }) {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-[var(--liquid-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>{name}</span>
        <nav className="flex gap-6" aria-label="Rodapé">
          {showDocs && (
            <Link href="/docs" className="hover:text-[var(--liquid-ink)]">
              Documentação
            </Link>
          )}
          <Link href="/bible-nvi" className="hover:text-[var(--liquid-ink)]">
            Bíblia
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function PlatformHome() {
  return (
    <>
      <Header logo="/AppImages/ios/192.png" name="DevotionalApp" showPlatformLinks />
      <Hero
        eyebrow="Plataforma para escritores cristãos"
        title="Sua mensagem na rotina de quem lê você."
        text="Publique devocionais, orações e livros em um espaço com o seu nome, e leve conexão com Deus para todos os dias."
      >
        <Link href="/register-writer" className={primaryCta}>
          Criar minha plataforma
        </Link>
        <a href="#como-funciona" className={ghostCta}>
          Como funciona
        </a>
      </Hero>

      <section className="bg-[var(--reader-surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-[15px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-[var(--liquid-muted)]">Quer apenas ler? Crie sua conta pelo link do escritor que você acompanha.</p>
          <Link href="/docs/leitor#criar-conta" className="font-bold underline decoration-[var(--reader-gold)] underline-offset-4">
            Como criar minha conta
          </Link>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="reader-eyebrow">Como funciona</p>
        <h2 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">Do primeiro texto ao primeiro leitor.</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-[var(--border)] pt-5">
              <span className="reader-serif text-3xl text-[var(--reader-gold)]">{index + 1}</span>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--liquid-muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[var(--reader-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="reader-eyebrow">Tudo em um só lugar</p>
          <h2 className="mt-3 mb-12 max-w-2xl text-4xl leading-tight sm:text-5xl">Você escreve. A plataforma cuida do resto.</h2>
          <FeatureGrid items={WRITER_FEATURES} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/writer.jpg" alt="Escritor trabalhando em sua mesa, cercado de livros" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="text-4xl leading-tight sm:text-5xl">Comece hoje a construir o seu espaço.</h2>
          <ul className="mt-6 grid gap-3 text-[15px] text-[var(--liquid-muted)]">
            {["Endereço exclusivo para seus leitores", "Sua logo e suas cores desde o início", "Tudo pode ser ajustado depois"].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--reader-gold)]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/register-writer" className={`${primaryCta} mt-8`}>
            Criar minha plataforma
          </Link>
        </div>
      </section>

      <Footer name="DevotionalApp" showDocs />
    </>
  );
}

function WriterHome({ writer }: { writer: HostWriter }) {
  return (
    <>
      <Header logo={writer.logoUrl} name={writer.name} />
      <Hero
        eyebrow={writer.name}
        title="Uma palavra para começar cada dia."
        text={`Mensagens, devocionais e leituras de ${writer.name} para acompanhar sua caminhada com Deus.`}
      >
        <Link href="/reader/register" className={primaryCta}>
          Criar minha conta
        </Link>
        <Link href="/login" className={ghostCta}>
          Já tenho conta
        </Link>
      </Hero>
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <FeatureGrid items={READER_FEATURES} />
      </section>
      <Footer name={writer.name} />
    </>
  );
}

export default async function Home() {
  const { subdomain, writer } = await getWriterFromHost();
  if (subdomain && !writer) notFound();

  const accent = writer?.colorPrimary;
  const accentStyle = accent
    ? ({ "--reader-writer-accent": accent, "--reader-writer-on-accent": readableOn(accent) } as CSSProperties)
    : undefined;

  return (
    <div className="reader-premium relative min-h-screen bg-[var(--reader-bg)] text-[var(--liquid-ink)]" style={accentStyle}>
      {writer ? <WriterHome writer={writer} /> : <PlatformHome />}
    </div>
  );
}

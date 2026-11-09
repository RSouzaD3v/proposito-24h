import Link from "next/link";
import { Brain, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const GAMES = [
  { title: "Quiz Bíblico", text: "Perguntas e respostas para testar seus conhecimentos.", href: "/reader/area/quiz", scene: "reader-scene-night", icon: Brain },
  { title: "Conectar Palavras", text: "Forme palavras e exercite sua memória e atenção.", href: "/reader/area/word-connect", scene: "reader-scene-dusk", icon: Link2 },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-8 pt-20 md:pt-10">
      <PageHeader title="Jogos Bíblicos" description="Aprenda e se divirta enquanto aprofunda seu conhecimento." />

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map(({ title, text, href, scene, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`reader-scene ${scene} flex h-64 flex-col justify-between rounded-3xl p-5 transition-transform motion-safe:hover:-translate-y-0.5`}
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Icon className="size-6" />
            </span>
            <span>
              <span className="reader-serif block text-2xl">{title}</span>
              <span className="mt-1 block text-sm text-white/85">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

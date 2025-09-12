"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

type Day = { id: string; dayNumber: number; passages: string };

// Base da rota de leitura por livro
const BIBLE_BASE = "/reader/area/bible-nvi"; // mude para "/reader/area/bible" se for o seu caso

// Remove acentos
function stripDiacritics(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// Map de padrões (sem acento, minúsculo) -> slug
const BOOK_PATTERNS: Record<string, string[]> = {
  gn: ["genesis", "gn", "gen"],
  ex: ["exodo", "ex"],
  lv: ["levitico", "lv"],
  nm: ["numeros", "nm", "num"],
  dt: ["deuteronomio", "dt", "deut"],
  js: ["josue", "js"],
  jz: ["juizes", "jz"],
  rt: ["rute", "rt"],
  "1sm": ["1 samuel", "i samuel", "1sm", "1 sam"],
  "2sm": ["2 samuel", "ii samuel", "2sm", "2 sam"],
  "1rs": ["1 reis", "i reis", "1rs"],
  "2rs": ["2 reis", "ii reis", "2rs"],
  "1cr": ["1 cronicas", "i cronicas", "1cr", "1 cr"],
  "2cr": ["2 cronicas", "ii cronicas", "2cr", "2 cr"],
  ed: ["esdras", "ed"],
  ne: ["neemias", "ne"],
  et: ["ester", "et"],
  job: ["job"], // evitar "jo" para não conflitar com João
  sl: ["salmos", "salmo", "sl", "ps"],
  pv: ["proverbios", "pv"],
  ec: ["eclesiastes", "ec"],
  ct: ["cantares", "cantico dos canticos", "canticos", "ct"],
  is: ["isaias", "is"],
  jr: ["jeremias", "jr"],
  lm: ["lamentacoes", "lm"],
  ez: ["ezequiel", "ez"],
  dn: ["daniel", "dn"],
  os: ["oseias", "os"],
  jl: ["joel", "jl"],
  am: ["amos", "am"],
  ob: ["obadias", "ob"],
  jn: ["jonas", "jn"],
  mq: ["miqueias", "miqueias", "mq", "miq"],
  na: ["naum", "na"],
  hc: ["habacuque", "hc", "hab"],
  sf: ["sofonias", "sf"],
  ag: ["ageu", "ag"],
  zc: ["zacarias", "zc", "zac"],
  ml: ["malaquias", "ml"],

  mt: ["mateus", "mt"],
  mc: ["marcos", "mc"],
  lc: ["lucas", "lc"],
  jo: ["joao", "evangelho de joao", "jo"], // João
  at: ["atos", "atos dos apostolos", "at"],
  rm: ["romanos", "rm", "rom"],
  "1co": ["1 corintios", "i corintios", "1co", "1 cor"],
  "2co": ["2 corintios", "ii corintios", "2co", "2 cor"],
  gl: ["galatas", "gl", "gal"],
  ef: ["efesios", "ef"],
  fp: ["filipenses", "fp", "fl"],
  cl: ["colossenses", "cl", "col"],
  "1ts": ["1 tessalonicenses", "1ts", "1 tes"],
  "2ts": ["2 tessalonicenses", "2ts", "2 tes"],
  "1tm": ["1 timoteo", "1tm"],
  "2tm": ["2 timoteo", "2tm"],
  tt: ["tito", "tt"],
  fm: ["filemom", "fm", "flm"],
  hb: ["hebreus", "hb"],
  tg: ["tiago", "tg"],
  "1pe": ["1 pedro", "1pe"],
  "2pe": ["2 pedro", "2pe"],
  "1jo": ["1 joao", "1jo"],
  "2jo": ["2 joao", "2jo"],
  "3jo": ["3 joao", "3jo"],
  jd: ["judas", "jd"],
  ap: ["apocalipse", "ap", "apc"],
};

// Captura o primeiro livro citado em uma string de passagens e retorna o slug
function resolveBookSlug(passages: string): string | null {
  const raw = passages.toLowerCase();
  // caso especial para "Jó" (com acento), antes de remover acentos
  if (raw.includes("jó")) return "job";

  const text = stripDiacritics(raw); // sem acentos
  // Se houver múltiplos livros (separados por vírgula, ponto e vírgula, " / ", etc.), tanto faz: achamos o primeiro que aparecer
  for (const [slug, patterns] of Object.entries(BOOK_PATTERNS)) {
    for (const p of patterns) {
      if (text.includes(p)) return slug;
    }
  }
  return null;
}

export default function PlanClient({
  planId,
  planName,
  days,
  completedInitial,
}: {
  planId: string;
  planName: string;
  days: Day[];
  completedInitial: string[]; // dayIds
}) {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedInitial)
  );

  const total = days.length;
  const done = completed.size;
  const pct = useMemo(() => Math.round((done / total) * 100), [done, total]);

  async function toggle(dayId: string, next: boolean) {
    setCompleted((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(dayId);
      else copy.delete(dayId);
      return copy;
    });

    startTransition(async () => {
      const res = await fetch("/api/reader/area/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, dayId, completed: next }),
      });

      if (!res.ok) {
        setCompleted((prev) => {
          const copy = new Set(prev);
          if (next) copy.delete(dayId);
          else copy.add(dayId);
          return copy;
        });
      }
    });
  }

  return (
    <section className="mx-auto max-w-3xl p-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-1">
        <Link
          href="/reader/area"
          className="bg-blue-600 text-white hover:bg-blue-800 p-2 rounded-sm flex items-center mb-4"
        >
          Voltar para área do leitor
        </Link>
        <Link
          href="/reader/area/bible-nvi"
          className="bg-blue-600 text-white hover:bg-blue-800 p-2 rounded-sm flex items-center mb-4"
        >
          Vamos ler a Bíblia 📖
        </Link>
      </div>

      <header className="mb-4">
        <h1 className="text-2xl font-bold">{planName}</h1>
        <div className="mt-2">
          <div className="h-3 w-full bg-gray-200 rounded">
            <div
              className="h-3 rounded bg-green-500 transition-all"
              style={{ width: `${pct}%` }}
              aria-label="Progresso"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {done}/{total} dias • {pct}% {isPending ? " (sincronizando…)" : ""}
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        {days.map((d) => {
          const checked = completed.has(d.id);
          const slug = resolveBookSlug(d.passages);
          const href = slug ? `${BIBLE_BASE}/${slug}` : `${BIBLE_BASE}`;
          const disabled = !slug;

          return (
            <li
              key={d.id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">Dia {d.dayNumber}</p>
                <p className="text-sm text-gray-700">{d.passages}</p>

                <Link
                  href={href}
                  className={`bg-blue-600 text-white p-1 my-1 text-sm rounded-sm inline-block ${
                    disabled ? "pointer-events-none opacity-50" : "hover:bg-blue-800"
                  }`}
                >
                  Ir para o capítulo
                </Link>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={checked}
                  onChange={(e) => toggle(d.id, e.currentTarget.checked)}
                />
                <span className="text-sm">
                  {checked ? "Concluído" : "Marcar"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// scripts/importBible.ts
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Prisma client recriável (para reconectar em caso de queda)
let prisma = new PrismaClient();

type JsonBook = {
  abbrev: string;         // ex: "gn"
  name?: string;          // ex: "Gênesis" (opcional, mas comum)
  chapters: string[][];   // capítulos com array de versículos
};

// Aliases opcionais para normalizar abreviações que venham diferentes no JSON
const ABBREV_ALIASES: Record<string, string> = {
  // Exemplos (ajuste/conserte conforme necessário):
  "1sam": "1sm",
  "2sam": "2sm",
  "song": "ct",
  "songofsongs": "ct",
  "songs": "ct",
};

function normalizeAbbrev(abbrev: string) {
  const a = (abbrev || "").toLowerCase();
  return ABBREV_ALIASES[a] ?? a;
}

// Normaliza espaços (inclusive quebras estranhas) sem perder pontuação
function normalizeSpaces(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

// insere um chunk com retry exponencial e reconexão do Prisma
async function insertWithRetry(
  chunk: {
    versionId: string;
    bookId: number;
    chapter: number;
    verse: number;
    text: string;
  }[],
  tries = 0
): Promise<void> {
  const maxRetries = 5;
  const backoffMs = 500 * Math.pow(2, tries); // 0.5s, 1s, 2s, 4s, 8s

  try {
    if (chunk.length === 0) return;
    await prisma.bibleVerse.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  } catch (err: any) {
    const code = err?.code;
    const transient =
      code === "P1017" || // Server closed the connection
      code === "P1001" || // Can't reach database server
      code === "P1008";   // Operation timed out

    if (transient && tries < maxRetries) {
      console.warn(
        `\n[retry] ${code} — tentando novamente em ${backoffMs}ms... (tentativa ${
          tries + 1
        }/${maxRetries})`
      );
      try {
        await prisma.$disconnect();
      } catch {}
      prisma = new PrismaClient();
      await new Promise((r) => setTimeout(r, backoffMs));
      return insertWithRetry(chunk, tries + 1);
    }

    // Erro definitivo
    throw err;
  }
}

async function main() {
  // === Parâmetros ===
  const fileArg = process.argv[2] ?? "./acf.json";
  const versionCode = process.env.BIBLE_VERSION_CODE ?? "NVI";
  const versionName = process.env.BIBLE_VERSION_NAME ?? "Nova Versão Internacional";
  const versionLang = process.env.BIBLE_VERSION_LANG ?? "pt-BR";
  const chunkSize = Number(process.env.IMPORT_CHUNK_SIZE ?? 1000);

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  // lê e remove BOM antes de parsear
  let raw = fs.readFileSync(filePath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const data: JsonBook[] = JSON.parse(raw);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("JSON inválido: esperado array não-vazio de livros.");
  }

  console.log(`Importando ${versionCode} de ${data.length} livros...`);

  // 1) Versão
  const version = await prisma.bibleVersion.upsert({
    where: { code: versionCode },
    update: { name: versionName, language: versionLang },
    create: { code: versionCode, name: versionName, language: versionLang },
  });

  // 2) Garantir livros (abbrev única; id 1..66 por ordem do JSON)
  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const order = i + 1;
    const abbrev = normalizeAbbrev(b.abbrev);

    if (!abbrev) {
      console.warn(`Livro na posição ${order} sem abbrev — ignorando.`);
      continue;
    }

    const existing = await prisma.bibleBook.findUnique({
      where: { abbrev },
      select: { id: true },
    });

    // Mantemos um nome canônico único; se já existir, apenas atualiza order/nome
    if (existing) {
      await prisma.bibleBook.update({
        where: { abbrev },
        data: { name: b.name ?? abbrev.toUpperCase(), order },
      });
    } else {
      await prisma.bibleBook.create({
        data: {
          id: order, // define 1..66 ao criar a primeira vez
          abbrev,
          name: b.name ?? abbrev.toUpperCase(),
          order,
        },
      });
    }
  }

  // 3) Mapa abbrev -> id
  const books = await prisma.bibleBook.findMany({
    select: { id: true, abbrev: true },
    orderBy: { order: "asc" },
  });
  const bookIdByAbbrev = new Map(books.map((b) => [b.abbrev, b.id]));

  // 4) Flatten + insert em chunks com retry
  console.time("import");

  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const abbrev = normalizeAbbrev(b.abbrev);
    const bookId = bookIdByAbbrev.get(abbrev);
    if (!bookId) {
      throw new Error(`Book não encontrado após seed: ${abbrev}`);
    }

    const chapters = Array.isArray(b.chapters) ? b.chapters : [];
    const rows: {
      versionId: string;
      bookId: number;
      chapter: number;
      verse: number;
      text: string;
    }[] = [];

    for (let c = 0; c < chapters.length; c++) {
      const verses = Array.isArray(chapters[c]) ? chapters[c] : [];
      for (let v = 0; v < verses.length; v++) {
        const text = normalizeSpaces(verses[v] ?? "");
        if (!text) continue; // evita inserir vazios
        rows.push({
          versionId: version.id,
          bookId,
          chapter: c + 1,
          verse: v + 1,
          text,
        });
      }
    }

    for (let j = 0; j < rows.length; j += chunkSize) {
      const chunk = rows.slice(j, j + chunkSize);
      await insertWithRetry(chunk);
      process.stdout.write(
        `\r${versionCode} — Livro ${i + 1}/${data.length} — ${Math.min(
          j + chunkSize,
          rows.length
        )}/${rows.length} versos`
      );
    }
    process.stdout.write("\n");
  }

  console.timeEnd("import");
  console.log("Import finalizado com sucesso.");
}

// encerra conexões ao sair
process.on("SIGINT", async () => {
  try { await prisma.$disconnect(); } catch {}
  process.exit(0);
});
process.on("SIGTERM", async () => {
  try { await prisma.$disconnect(); } catch {}
  process.exit(0);
});

main()
  .catch(async (e) => {
    console.error(e);
    try { await prisma.$disconnect(); } catch {}
    process.exit(1);
  })
  .finally(async () => {
    try { await prisma.$disconnect(); } catch {}
  });

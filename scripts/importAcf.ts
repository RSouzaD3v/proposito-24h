// scripts/importAcf.ts
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Prisma client recriável (para reconectar em caso de queda)
let prisma = new PrismaClient();

type JsonBook = {
  abbrev: string;
  name: string;
  chapters: string[][];
};

// normaliza espaços e quebra de linha estranha
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
  const fileArg = process.argv[2] ?? "./acf.json";
  const versionCode = process.env.BIBLE_VERSION_CODE ?? "ACF";
  const versionName = process.env.BIBLE_VERSION_NAME ?? "Almeida Corrigida Fiel";
  const versionLang = process.env.BIBLE_VERSION_LANG ?? "pt-BR";
  const chunkSize = Number(process.env.IMPORT_CHUNK_SIZE ?? 1000);

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  // lê e remove BOM antes de parsear
  const raw = fs.readFileSync(filePath, "utf8");
  const sanitized = raw.replace(/^\uFEFF/, "");
  const data: JsonBook[] = JSON.parse(sanitized);

  console.log(`Importando ${versionCode} de ${data.length} livros...`);

  // 1) Versão
  const version = await prisma.bibleVersion.upsert({
    where: { code: versionCode },
    update: { name: versionName, language: versionLang },
    create: { code: versionCode, name: versionName, language: versionLang },
  });

  // 2) Garantir livros (caso alguém pule o seed)
  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const order = i + 1;
    const existing = await prisma.bibleBook.findUnique({
      where: { abbrev: b.abbrev },
      select: { id: true },
    });

    if (existing) {
      await prisma.bibleBook.update({
        where: { abbrev: b.abbrev },
        data: { name: b.name, order },
      });
    } else {
      await prisma.bibleBook.create({
        data: {
          id: order,
          abbrev: b.abbrev,
          name: b.name,
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

  // 4) Flatten e insert em chunks com retry
  console.time("import");

  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const bookId = bookIdByAbbrev.get(b.abbrev);
    if (!bookId) {
      throw new Error(`Book não encontrado após seed: ${b.abbrev}`);
    }

    const rows: {
      versionId: string;
      bookId: number;
      chapter: number;
      verse: number;
      text: string;
    }[] = [];

    for (let c = 0; c < b.chapters.length; c++) {
      const verses = b.chapters[c] ?? [];
      for (let v = 0; v < verses.length; v++) {
        rows.push({
          versionId: version.id,
          bookId,
          chapter: c + 1,
          verse: v + 1,
          text: normalizeSpaces(verses[v]),
        });
      }
    }

    for (let j = 0; j < rows.length; j += chunkSize) {
      const chunk = rows.slice(j, j + chunkSize);
      await insertWithRetry(chunk);
      process.stdout.write(
        `\rLivro ${i + 1}/${data.length} — ${Math.min(
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

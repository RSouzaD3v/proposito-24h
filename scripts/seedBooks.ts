// scripts/seedBooks.ts
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type JsonBook = {
  abbrev: string;
  name: string;
  chapters: string[][];
};

async function main() {
  const fileArg = process.argv[2] ?? "./acf.json";
  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

// por estas:
const raw = fs.readFileSync(filePath, "utf8");
const sanitized = raw.replace(/^\uFEFF/, ""); // remove BOM se existir
const data: JsonBook[] = JSON.parse(sanitized);


  console.log(`Lidos ${data.length} livros do JSON.`);

  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const order = i + 1;

    // tenta achar existente por abbrev
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
          id: order, // define 1..66 ao criar a primeira vez
          abbrev: b.abbrev,
          name: b.name,
          order,
        },
      });
    }
  }

  console.log("Books seeded/atualizados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

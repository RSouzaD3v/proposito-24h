import { PrismaClient, GameType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Layout circular simples (valores relativos 0–1)
 */
function circleLayout(count: number) {
  const radius = 0.35;
  const centerX = 0.5;
  const centerY = 0.6;

  return Array.from({ length: count }).map((_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;

    return {
      x: Number((centerX + radius * Math.cos(angle)).toFixed(4)),
      y: Number((centerY + radius * Math.sin(angle)).toFixed(4)),
    };
  });
}

async function seedGameWordConnect() {
  console.log("🎮 Seeding GameTemplate WORD_CONNECT...");

  /**
   * 1️⃣ GameTemplate (único por slug)
   */
  let game = await prisma.gameTemplate.findUnique({
    where: { slug: "palavras-biblicas" },
  });

  if (!game) {
    game = await prisma.gameTemplate.create({
      data: {
        slug: "palavras-biblicas",
        title: "Palavras Bíblicas",
        description: "Forme palavras e avance nos níveis",
        type: GameType.WORD_CONNECT,
        active: true,
      },
    });
  }

  /**
   * 2️⃣ Definição dos níveis
   */
  const levels = [
    {
      order: 1,
      letters: ["D", "I", "A"],
      words: [
        { word: "DIA", bonus: false },
        { word: "IDA", bonus: false },
        { word: "AID", bonus: true },
      ],
    },
    {
      order: 2,
      letters: ["D", "E", "U", "S"],
      words: [
        { word: "DEUS", bonus: false },
        { word: "SEU", bonus: false },
        { word: "USE", bonus: true },
      ],
    },
    {
      order: 3,
      letters: ["A", "M", "O", "R"],
      words: [
        { word: "AMOR", bonus: false },
        { word: "ROMA", bonus: false },
        { word: "RAMO", bonus: true },
      ],
    },
  ];

  /**
   * 3️⃣ Criação / atualização dos níveis
   */
  for (const level of levels) {
    const existingLevel = await prisma.gameLevel.findFirst({
      where: {
        gameTemplateId: game.id,
        order: level.order,
      },
    });

    const gameLevel = existingLevel
      ? await prisma.gameLevel.update({
          where: { id: existingLevel.id },
          data: {
            letters: level.letters,
            layout: circleLayout(level.letters.length),
          },
        })
      : await prisma.gameLevel.create({
          data: {
            gameTemplateId: game.id,
            order: level.order,
            letters: level.letters,
            layout: circleLayout(level.letters.length),
          },
        });

    /**
     * 4️⃣ Palavras (limpa e recria)
     */
    await prisma.gameWord.deleteMany({
      where: { levelId: gameLevel.id },
    });

    await prisma.gameWord.createMany({
      data: level.words.map((w) => ({
        levelId: gameLevel.id,
        word: w.word,
        bonus: w.bonus,
      })),
    });

    console.log(`✅ Level ${level.order} seedado`);
  }

  console.log("🎉 Game WORD_CONNECT seedado com sucesso!");
}

/**
 * Execução direta
 */
seedGameWordConnect()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

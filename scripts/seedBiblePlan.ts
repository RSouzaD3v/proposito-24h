import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // Caminho para a planilha dentro da pasta /scripts
  const filePath = path.join(__dirname, "plano_leitura_biblica_365_dias_com_marcadores.xlsx");

  // Lê a planilha
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = xlsx.utils.sheet_to_json(sheet);

  // Cria o plano principal
  const plan = await prisma.bibleReadingPlan.create({
    data: {
      name: "Plano Bíblia em 365 Dias",
    },
  });

  // Importa os dias
  for (const row of rows) {
    await prisma.readingDay.create({
      data: {
        dayNumber: Number(row["Dia"]),
        passages: String(row["Leitura"]),
        planId: plan.id,
      },
    });
  }

  console.log("Plano de leitura importado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao importar plano:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

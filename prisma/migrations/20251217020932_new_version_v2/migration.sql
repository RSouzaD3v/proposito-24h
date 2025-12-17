-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('WORD_CONNECT');

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'ASAAS';

-- AlterTable
ALTER TABLE "Devotional" ADD COLUMN     "referenceDay" INTEGER;

-- AlterTable
ALTER TABLE "Prayer" ADD COLUMN     "referenceDay" INTEGER;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "referenceDay" INTEGER;

-- AlterTable
ALTER TABLE "ReaderSubscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Verse" ADD COLUMN     "referenceDay" INTEGER;

-- AlterTable
ALTER TABLE "WriterSubscriptionPlan" ALTER COLUMN "stripeProductId" DROP NOT NULL,
ALTER COLUMN "stripePriceId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PersonalizationWriter" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "backgroundColor" TEXT,
    "bgButtonColor" TEXT,
    "buttonTextColor" TEXT,
    "independenteColor1" TEXT,
    "independenteColor2" TEXT,
    "textColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizationWriter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupingDaily" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupingDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GameType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLevel" (
    "id" TEXT NOT NULL,
    "gameTemplateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "letters" TEXT[],
    "layout" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameWord" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "bonus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GameWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameTemplateId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLevelProgress" (
    "id" TEXT NOT NULL,
    "playerGameId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "foundWords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerLevelProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DevotionalToGroupingDaily" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DevotionalToGroupingDaily_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GroupingDailyToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupingDailyToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GroupingDailyToPrayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupingDailyToPrayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GroupingDailyToVerse" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupingDailyToVerse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizationWriter_writerId_key" ON "PersonalizationWriter"("writerId");

-- CreateIndex
CREATE UNIQUE INDEX "GameTemplate_slug_key" ON "GameTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGame_userId_gameTemplateId_key" ON "PlayerGame"("userId", "gameTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLevelProgress_playerGameId_levelId_key" ON "PlayerLevelProgress"("playerGameId", "levelId");

-- CreateIndex
CREATE INDEX "_DevotionalToGroupingDaily_B_index" ON "_DevotionalToGroupingDaily"("B");

-- CreateIndex
CREATE INDEX "_GroupingDailyToQuote_B_index" ON "_GroupingDailyToQuote"("B");

-- CreateIndex
CREATE INDEX "_GroupingDailyToPrayer_B_index" ON "_GroupingDailyToPrayer"("B");

-- CreateIndex
CREATE INDEX "_GroupingDailyToVerse_B_index" ON "_GroupingDailyToVerse"("B");

-- AddForeignKey
ALTER TABLE "PersonalizationWriter" ADD CONSTRAINT "PersonalizationWriter_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupingDaily" ADD CONSTRAINT "GroupingDaily_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLevel" ADD CONSTRAINT "GameLevel_gameTemplateId_fkey" FOREIGN KEY ("gameTemplateId") REFERENCES "GameTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameWord" ADD CONSTRAINT "GameWord_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGame" ADD CONSTRAINT "PlayerGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGame" ADD CONSTRAINT "PlayerGame_gameTemplateId_fkey" FOREIGN KEY ("gameTemplateId") REFERENCES "GameTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLevelProgress" ADD CONSTRAINT "PlayerLevelProgress_playerGameId_fkey" FOREIGN KEY ("playerGameId") REFERENCES "PlayerGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLevelProgress" ADD CONSTRAINT "PlayerLevelProgress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "GameLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DevotionalToGroupingDaily" ADD CONSTRAINT "_DevotionalToGroupingDaily_A_fkey" FOREIGN KEY ("A") REFERENCES "Devotional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DevotionalToGroupingDaily" ADD CONSTRAINT "_DevotionalToGroupingDaily_B_fkey" FOREIGN KEY ("B") REFERENCES "GroupingDaily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToQuote" ADD CONSTRAINT "_GroupingDailyToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "GroupingDaily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToQuote" ADD CONSTRAINT "_GroupingDailyToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToPrayer" ADD CONSTRAINT "_GroupingDailyToPrayer_A_fkey" FOREIGN KEY ("A") REFERENCES "GroupingDaily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToPrayer" ADD CONSTRAINT "_GroupingDailyToPrayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Prayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToVerse" ADD CONSTRAINT "_GroupingDailyToVerse_A_fkey" FOREIGN KEY ("A") REFERENCES "GroupingDaily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupingDailyToVerse" ADD CONSTRAINT "_GroupingDailyToVerse_B_fkey" FOREIGN KEY ("B") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

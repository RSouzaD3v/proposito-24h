/*
  Warnings:

  - The `quote` column on the `WriterReaderAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `devotional` column on the `WriterReaderAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verse` column on the `WriterReaderAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `prayer` column on the `WriterReaderAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `biblePlan` column on the `WriterReaderAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReaderAccessTier" AS ENUM ('FREE', 'SUBSCRIPTION', 'PAID_PATRON');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cpfCnpj" TEXT;

-- AlterTable
ALTER TABLE "WriterReaderAccess" DROP COLUMN "quote",
ADD COLUMN     "quote" "ReaderAccessTier" NOT NULL DEFAULT 'FREE',
DROP COLUMN "devotional",
ADD COLUMN     "devotional" "ReaderAccessTier" NOT NULL DEFAULT 'FREE',
DROP COLUMN "verse",
ADD COLUMN     "verse" "ReaderAccessTier" NOT NULL DEFAULT 'FREE',
DROP COLUMN "prayer",
ADD COLUMN     "prayer" "ReaderAccessTier" NOT NULL DEFAULT 'FREE',
DROP COLUMN "biblePlan",
ADD COLUMN     "biblePlan" "ReaderAccessTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "WriterSubscriptionPlan" ALTER COLUMN "trialDays" SET DEFAULT 7;

-- CreateIndex
CREATE INDEX "WriterReaderAccess_quote_devotional_verse_prayer_biblePlan_idx" ON "WriterReaderAccess"("quote", "devotional", "verse", "prayer", "biblePlan");

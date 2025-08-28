/*
  Warnings:

  - You are about to alter the column `amount` on the `WriterSubscription` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `ClientSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionInterval" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

-- DropForeignKey
ALTER TABLE "public"."ClientSubscription" DROP CONSTRAINT "ClientSubscription_clientId_fkey";

-- AlterTable
ALTER TABLE "public"."Domain" ALTER COLUMN "subdomain" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."WriterSubscription" ALTER COLUMN "endedAt" DROP NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "public"."ClientSubscription";

-- CreateTable
CREATE TABLE "public"."WriterSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "interval" "public"."SubscriptionInterval" NOT NULL DEFAULT 'MONTH',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "applicationFeePct" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReaderSubscription" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "priceId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "latestInvoiceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WriterSubscriptionPlan_writerId_idx" ON "public"."WriterSubscriptionPlan"("writerId");

-- CreateIndex
CREATE INDEX "WriterSubscriptionPlan_writerId_isActive_idx" ON "public"."WriterSubscriptionPlan"("writerId", "isActive");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_idx" ON "public"."ReaderSubscription"("writerId");

-- CreateIndex
CREATE INDEX "ReaderSubscription_readerId_idx" ON "public"."ReaderSubscription"("readerId");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_status_idx" ON "public"."ReaderSubscription"("writerId", "status");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_createdAt_idx" ON "public"."ReaderSubscription"("writerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderSubscription_readerId_writerId_key" ON "public"."ReaderSubscription"("readerId", "writerId");

-- AddForeignKey
ALTER TABLE "public"."WriterSubscriptionPlan" ADD CONSTRAINT "WriterSubscriptionPlan_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReaderSubscription" ADD CONSTRAINT "ReaderSubscription_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReaderSubscription" ADD CONSTRAINT "ReaderSubscription_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

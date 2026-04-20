/*
  Warnings:

  - A unique constraint covering the columns `[asaasSubscriptionId]` on the table `ReaderSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[asaasCustomerId]` on the table `Writer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[asaasSubscriptionId]` on the table `WriterSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "provider" SET DEFAULT 'ASAAS';

-- AlterTable
ALTER TABLE "ReaderSubscription" ADD COLUMN     "asaasSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Writer" ADD COLUMN     "asaasCustomerId" TEXT;

-- AlterTable
ALTER TABLE "WriterSubscription" ADD COLUMN     "asaas" JSONB,
ADD COLUMN     "asaasSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "AsaasWebhookEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AsaasWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReaderSubscription_asaasSubscriptionId_key" ON "ReaderSubscription"("asaasSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Writer_asaasCustomerId_key" ON "Writer"("asaasCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "WriterSubscription_asaasSubscriptionId_key" ON "WriterSubscription"("asaasSubscriptionId");

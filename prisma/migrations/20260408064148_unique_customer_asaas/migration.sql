/*
  Warnings:

  - A unique constraint covering the columns `[asaasPaymentId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[asaasCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Purchase_asaasPaymentId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_asaasPaymentId_key" ON "Purchase"("asaasPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_asaasCustomerId_key" ON "User"("asaasCustomerId");

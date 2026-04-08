-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "asaasPaymentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "asaasCustomerId" TEXT;

-- CreateIndex
CREATE INDEX "Purchase_asaasPaymentId_idx" ON "Purchase"("asaasPaymentId");

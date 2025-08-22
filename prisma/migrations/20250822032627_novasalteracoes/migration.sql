/*
  Warnings:

  - You are about to drop the column `userId` on the `Prayer` table. All the data in the column will be lost.
  - Added the required column `writerId` to the `Prayer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Prayer" DROP CONSTRAINT "Prayer_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Prayer" DROP COLUMN "userId",
ADD COLUMN     "writerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."ClientSubscription" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeId" TEXT,
    "stripe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletationPrayer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prayerId" TEXT NOT NULL,

    CONSTRAINT "UserCompletationPrayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSubscription_stripeCustomerId_key" ON "public"."ClientSubscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSubscription_stripeSubscriptionId_key" ON "public"."ClientSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSubscription_stripeId_key" ON "public"."ClientSubscription"("stripeId");

-- AddForeignKey
ALTER TABLE "public"."ClientSubscription" ADD CONSTRAINT "ClientSubscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prayer" ADD CONSTRAINT "Prayer_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationPrayer" ADD CONSTRAINT "UserCompletationPrayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationPrayer" ADD CONSTRAINT "UserCompletationPrayer_prayerId_fkey" FOREIGN KEY ("prayerId") REFERENCES "public"."Prayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

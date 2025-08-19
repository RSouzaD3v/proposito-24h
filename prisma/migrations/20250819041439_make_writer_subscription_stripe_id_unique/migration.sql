/*
  Warnings:

  - A unique constraint covering the columns `[stripeId]` on the table `WriterSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WriterSubscription_stripeId_key" ON "public"."WriterSubscription"("stripeId");

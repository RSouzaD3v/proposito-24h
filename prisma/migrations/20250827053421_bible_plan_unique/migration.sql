/*
  Warnings:

  - A unique constraint covering the columns `[userId,planId,dayId]` on the table `UserReadingProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserReadingProgress_userId_planId_dayId_key" ON "public"."UserReadingProgress"("userId", "planId", "dayId");

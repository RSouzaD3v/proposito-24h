-- CreateEnum
CREATE TYPE "StatusUserGroupingDaily" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "freePlan" SET DEFAULT false;

-- CreateTable
CREATE TABLE "UserGroupingDaily" (
    "id" TEXT NOT NULL,
    "groupingDailyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StatusUserGroupingDaily" NOT NULL DEFAULT 'ACTIVE',
    "startAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGroupingDaily_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserGroupingDaily" ADD CONSTRAINT "UserGroupingDaily_groupingDailyId_fkey" FOREIGN KEY ("groupingDailyId") REFERENCES "GroupingDaily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupingDaily" ADD CONSTRAINT "UserGroupingDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

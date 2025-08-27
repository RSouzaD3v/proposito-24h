-- CreateTable
CREATE TABLE "public"."BibleReadingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BibleReadingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingDay" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "passages" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "ReadingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserReadingProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReadingDay" ADD CONSTRAINT "ReadingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."BibleReadingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."BibleReadingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."ReadingDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `title` to the `GroupingDaily` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupingDaily" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

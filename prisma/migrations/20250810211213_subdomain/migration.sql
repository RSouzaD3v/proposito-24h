/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subdomain` to the `Domain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Domain" ADD COLUMN     "subdomain" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Domain_subdomain_key" ON "public"."Domain"("subdomain");

-- AlterTable
ALTER TABLE "public"."Publication" ADD COLUMN     "isPdf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdfUrl" TEXT;

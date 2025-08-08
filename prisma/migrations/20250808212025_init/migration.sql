-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'WRITER_ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."PublicationType" AS ENUM ('DEVOTIONAL', 'EBOOK');

-- CreateEnum
CREATE TYPE "public"."PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PurchaseStatus" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Writer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "colorPrimary" TEXT,
    "colorSecondary" TEXT,
    "branding" JSONB,
    "socials" JSONB,
    "storagePrefix" TEXT,
    "emailFrom" TEXT,
    "featureFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'CLIENT',
    "writerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Publication" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "type" "public"."PublicationType" NOT NULL,
    "status" "public"."PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'FREE',
    "price" INTEGER,
    "currency" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverUrl" TEXT,
    "body" TEXT,
    "tags" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "coverUrl" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "fees" INTEGER,
    "netAmount" INTEGER,
    "status" "public"."PurchaseStatus" NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeChargeId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeCustomerId" TEXT,
    "receiptUrl" TEXT,
    "rawProviderPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WriterPayout" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "fees" INTEGER,
    "netAmount" INTEGER NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Writer_slug_key" ON "public"."Writer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "public"."Domain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_writerId_slug_key" ON "public"."Publication"("writerId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_publicationId_order_key" ON "public"."Chapter"("publicationId", "order");

-- CreateIndex
CREATE INDEX "Purchase_writerId_createdAt_idx" ON "public"."Purchase"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Purchase_publicationId_createdAt_idx" ON "public"."Purchase"("publicationId", "createdAt");

-- CreateIndex
CREATE INDEX "WriterPayout_writerId_periodStart_periodEnd_idx" ON "public"."WriterPayout"("writerId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Publication" ADD CONSTRAINT "Publication_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WriterPayout" ADD CONSTRAINT "WriterPayout_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

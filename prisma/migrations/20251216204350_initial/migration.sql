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

-- CreateEnum
CREATE TYPE "public"."SubscriptionInterval" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR', 'LIFETIME');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

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
    "stripeAccountId" TEXT,
    "stripeCustomerId" TEXT,
    "titleApp" TEXT DEFAULT 'Deus seja sempre louvado!',
    "titleHeader" TEXT DEFAULT 'Vamos passar um tempo com Deus?',

    CONSTRAINT "Writer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WriterSubscription" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "stripeId" TEXT,
    "stripe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "subdomain" TEXT,

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
    "stripeCustomerId" TEXT,
    "freePlan" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completed" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WriterSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "interval" "public"."SubscriptionInterval" NOT NULL DEFAULT 'MONTH',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "applicationFeePct" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isReaderVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WriterSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReaderSubscription" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "priceId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "latestInvoiceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lifetime" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReaderSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WriterReaderAccess" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "quote" BOOLEAN NOT NULL DEFAULT true,
    "devotional" BOOLEAN NOT NULL DEFAULT true,
    "verse" BOOLEAN NOT NULL DEFAULT true,
    "prayer" BOOLEAN NOT NULL DEFAULT true,
    "biblePlan" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterReaderAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prayer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "writerId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "audioUrl" TEXT,

    CONSTRAINT "Prayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletationPrayer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prayerId" TEXT NOT NULL,

    CONSTRAINT "UserCompletationPrayer_pkey" PRIMARY KEY ("id")
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
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "category" TEXT DEFAULT 'Religioso',
    "isPdf" BOOLEAN NOT NULL DEFAULT false,
    "pdfUrl" TEXT,

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

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" TEXT NOT NULL,
    "nameAuthor" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verse" TEXT NOT NULL,
    "imageUrl" TEXT,
    "writerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletationQuote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompletationQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Devotional" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verse" TEXT NOT NULL,
    "imageUrl" TEXT,
    "writerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "audioUrl" TEXT,

    CONSTRAINT "Devotional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletationDevotional" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "devotionalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompletationDevotional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Verse" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletationVerse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompletationVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BibleVersion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BibleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BibleBook" (
    "id" INTEGER NOT NULL,
    "abbrev" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BibleBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BibleVerse" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BibleVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "expirationTime" TIMESTAMP(3),
    "userId" TEXT,
    "writerId" TEXT,
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Writer_slug_key" ON "public"."Writer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WriterSubscription_stripeId_key" ON "public"."WriterSubscription"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "public"."Domain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_subdomain_key" ON "public"."Domain"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "WriterSubscriptionPlan_writerId_idx" ON "public"."WriterSubscriptionPlan"("writerId");

-- CreateIndex
CREATE INDEX "WriterSubscriptionPlan_writerId_isActive_idx" ON "public"."WriterSubscriptionPlan"("writerId", "isActive");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_idx" ON "public"."ReaderSubscription"("writerId");

-- CreateIndex
CREATE INDEX "ReaderSubscription_readerId_idx" ON "public"."ReaderSubscription"("readerId");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_status_idx" ON "public"."ReaderSubscription"("writerId", "status");

-- CreateIndex
CREATE INDEX "ReaderSubscription_writerId_createdAt_idx" ON "public"."ReaderSubscription"("writerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderSubscription_readerId_writerId_key" ON "public"."ReaderSubscription"("readerId", "writerId");

-- CreateIndex
CREATE UNIQUE INDEX "WriterReaderAccess_writerId_key" ON "public"."WriterReaderAccess"("writerId");

-- CreateIndex
CREATE INDEX "WriterReaderAccess_quote_devotional_verse_prayer_biblePlan_idx" ON "public"."WriterReaderAccess"("quote", "devotional", "verse", "prayer", "biblePlan");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_writerId_slug_key" ON "public"."Publication"("writerId", "slug");

-- CreateIndex
CREATE INDEX "Purchase_writerId_createdAt_idx" ON "public"."Purchase"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Purchase_publicationId_createdAt_idx" ON "public"."Purchase"("publicationId", "createdAt");

-- CreateIndex
CREATE INDEX "WriterPayout_writerId_periodStart_periodEnd_idx" ON "public"."WriterPayout"("writerId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "Quote_writerId_createdAt_idx" ON "public"."Quote"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Devotional_writerId_createdAt_idx" ON "public"."Devotional"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Verse_writerId_createdAt_idx" ON "public"."Verse"("writerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BibleVersion_code_key" ON "public"."BibleVersion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BibleBook_abbrev_key" ON "public"."BibleBook"("abbrev");

-- CreateIndex
CREATE UNIQUE INDEX "BibleBook_order_key" ON "public"."BibleBook"("order");

-- CreateIndex
CREATE INDEX "BibleBook_order_idx" ON "public"."BibleBook"("order");

-- CreateIndex
CREATE INDEX "BibleVerse_bookId_chapter_verse_idx" ON "public"."BibleVerse"("bookId", "chapter", "verse");

-- CreateIndex
CREATE INDEX "BibleVerse_versionId_idx" ON "public"."BibleVerse"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "BibleVerse_versionId_bookId_chapter_verse_key" ON "public"."BibleVerse"("versionId", "bookId", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "public"."PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_writerId_idx" ON "public"."PushSubscription"("writerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReadingProgress_userId_planId_dayId_key" ON "public"."UserReadingProgress"("userId", "planId", "dayId");

-- AddForeignKey
ALTER TABLE "public"."WriterSubscription" ADD CONSTRAINT "WriterSubscription_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievements" ADD CONSTRAINT "Achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WriterSubscriptionPlan" ADD CONSTRAINT "WriterSubscriptionPlan_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReaderSubscription" ADD CONSTRAINT "ReaderSubscription_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReaderSubscription" ADD CONSTRAINT "ReaderSubscription_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WriterReaderAccess" ADD CONSTRAINT "WriterReaderAccess_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prayer" ADD CONSTRAINT "Prayer_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationPrayer" ADD CONSTRAINT "UserCompletationPrayer_prayerId_fkey" FOREIGN KEY ("prayerId") REFERENCES "public"."Prayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationPrayer" ADD CONSTRAINT "UserCompletationPrayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Publication" ADD CONSTRAINT "Publication_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WriterPayout" ADD CONSTRAINT "WriterPayout_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationQuote" ADD CONSTRAINT "UserCompletationQuote_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationQuote" ADD CONSTRAINT "UserCompletationQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Devotional" ADD CONSTRAINT "Devotional_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationDevotional" ADD CONSTRAINT "UserCompletationDevotional_devotionalId_fkey" FOREIGN KEY ("devotionalId") REFERENCES "public"."Devotional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationDevotional" ADD CONSTRAINT "UserCompletationDevotional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Verse" ADD CONSTRAINT "Verse_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationVerse" ADD CONSTRAINT "UserCompletationVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationVerse" ADD CONSTRAINT "UserCompletationVerse_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "public"."Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BibleVerse" ADD CONSTRAINT "BibleVerse_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BibleVerse" ADD CONSTRAINT "BibleVerse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."BibleVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingDay" ADD CONSTRAINT "ReadingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."BibleReadingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."ReadingDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."BibleReadingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReadingProgress" ADD CONSTRAINT "UserReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

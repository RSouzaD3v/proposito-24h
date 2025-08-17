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

-- CreateIndex
CREATE INDEX "Quote_writerId_createdAt_idx" ON "public"."Quote"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Devotional_writerId_createdAt_idx" ON "public"."Devotional"("writerId", "createdAt");

-- CreateIndex
CREATE INDEX "Verse_writerId_createdAt_idx" ON "public"."Verse"("writerId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationQuote" ADD CONSTRAINT "UserCompletationQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationQuote" ADD CONSTRAINT "UserCompletationQuote_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Devotional" ADD CONSTRAINT "Devotional_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationDevotional" ADD CONSTRAINT "UserCompletationDevotional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationDevotional" ADD CONSTRAINT "UserCompletationDevotional_devotionalId_fkey" FOREIGN KEY ("devotionalId") REFERENCES "public"."Devotional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Verse" ADD CONSTRAINT "Verse_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationVerse" ADD CONSTRAINT "UserCompletationVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletationVerse" ADD CONSTRAINT "UserCompletationVerse_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "public"."Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

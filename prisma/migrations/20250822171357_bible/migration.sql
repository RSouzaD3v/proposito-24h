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

-- AddForeignKey
ALTER TABLE "public"."BibleVerse" ADD CONSTRAINT "BibleVerse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."BibleVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BibleVerse" ADD CONSTRAINT "BibleVerse_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- CreateIndex
CREATE INDEX "WriterReaderAccess_quote_devotional_verse_prayer_biblePlan_idx" ON "public"."WriterReaderAccess"("quote", "devotional", "verse", "prayer", "biblePlan");

-- CreateIndex
CREATE UNIQUE INDEX "WriterReaderAccess_writerId_key" ON "public"."WriterReaderAccess"("writerId");

-- AddForeignKey
ALTER TABLE "public"."WriterReaderAccess" ADD CONSTRAINT "WriterReaderAccess_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

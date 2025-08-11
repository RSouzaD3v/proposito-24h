-- CreateTable
CREATE TABLE "public"."WriterSubscription" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "stripeId" TEXT,
    "stripe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterSubscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WriterSubscription" ADD CONSTRAINT "WriterSubscription_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "public"."Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

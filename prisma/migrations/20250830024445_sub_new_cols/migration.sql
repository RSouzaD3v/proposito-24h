-- AlterTable
ALTER TABLE "public"."ReaderSubscription" ADD COLUMN     "lifetime" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."WriterSubscriptionPlan" ADD COLUMN     "isReaderVisible" BOOLEAN NOT NULL DEFAULT true;

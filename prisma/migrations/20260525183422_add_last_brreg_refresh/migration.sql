-- AlterTable
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lastBrregRefreshAt" TIMESTAMP(3);

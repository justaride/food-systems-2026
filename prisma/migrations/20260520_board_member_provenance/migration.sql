-- Board member provenance columns.
--
-- BoardMember.source / sourceUrl / verifiedAt were added to schema.prisma
-- (commit 205a126) and applied to the local database via `prisma db push`,
-- but no migration file was ever committed — so production never received
-- them and `prisma.boardMember.findMany()` fails with P2022 ColumnNotFound.
--
-- Idempotent so it is safe to apply via psql on any database state.

ALTER TABLE "BoardMember" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "BoardMember" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "BoardMember" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

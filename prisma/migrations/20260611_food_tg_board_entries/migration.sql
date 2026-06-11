-- Food TG mandate board DB backing.
--
-- The claim-board and opportunity-radar rows were previously rendered only
-- from src/lib/data/food-tg-mandate.ts. These tables keep the same locked
-- content in data rows with timestamps, source path, and an idempotent content
-- ledger for later status changes.

CREATE TABLE IF NOT EXISTS "ClaimBoardEntry" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "track" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "strength" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "nextAction" TEXT NOT NULL,
  "useNow" TEXT NOT NULL,
  "needs" TEXT NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "sourceUpdatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClaimBoardEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OpportunityEntry" (
  "id" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "track" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "statuses" TEXT[] NOT NULL,
  "whyNow" TEXT NOT NULL,
  "canSay" TEXT NOT NULL,
  "cannotSay" TEXT NOT NULL,
  "validationNeed" TEXT NOT NULL,
  "stopSignal" TEXT NOT NULL,
  "nextAction" TEXT NOT NULL,
  "claimIds" TEXT[] NOT NULL,
  "evidenceIds" TEXT[] NOT NULL,
  "sourceIds" TEXT[] NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "sourceUpdatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OpportunityEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FoodTgBoardLedger" (
  "id" TEXT NOT NULL,
  "entryType" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FoodTgBoardLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ClaimBoardEntry_claimId_idx" ON "ClaimBoardEntry"("claimId");
CREATE INDEX IF NOT EXISTS "ClaimBoardEntry_track_idx" ON "ClaimBoardEntry"("track");
CREATE INDEX IF NOT EXISTS "ClaimBoardEntry_status_idx" ON "ClaimBoardEntry"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "OpportunityEntry_rank_key" ON "OpportunityEntry"("rank");
CREATE INDEX IF NOT EXISTS "OpportunityEntry_rank_idx" ON "OpportunityEntry"("rank");
CREATE INDEX IF NOT EXISTS "OpportunityEntry_track_idx" ON "OpportunityEntry"("track");

CREATE UNIQUE INDEX IF NOT EXISTS "FoodTgBoardLedger_entryType_entryId_contentHash_key"
  ON "FoodTgBoardLedger"("entryType", "entryId", "contentHash");
CREATE INDEX IF NOT EXISTS "FoodTgBoardLedger_entryType_entryId_idx"
  ON "FoodTgBoardLedger"("entryType", "entryId");

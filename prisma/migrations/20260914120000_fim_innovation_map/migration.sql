-- Food Innovation Map Norway (FIM) candidate tables. Data is imported separately
-- from the private data repository through prod-data-import.yml (fim-v009).

-- CreateTable
CREATE TABLE "FimRelease" (
    "id" TEXT NOT NULL,
    "sealSha256" TEXT NOT NULL,
    "pilotSealSha256" TEXT,
    "profileCount" INTEGER NOT NULL,
    "findingCount" INTEGER NOT NULL,
    "observationCount" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FimRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FimProfile" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgNumber" TEXT,
    "entityKind" TEXT NOT NULL,
    "cohort" TEXT NOT NULL,
    "origin" TEXT,
    "companyId" TEXT,
    "fields" JSONB NOT NULL,
    "findings" JSONB NOT NULL,
    "numericObservations" JSONB NOT NULL,
    "narrative" JSONB,
    "openQuestions" JSONB,
    "assessment" JSONB,
    "pilotReview" JSONB,
    "documentedFieldCount" INTEGER NOT NULL,
    "conflictCount" INTEGER NOT NULL,
    "searchText" TEXT NOT NULL,

    CONSTRAINT "FimProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FimProfile_releaseId_idx" ON "FimProfile"("releaseId");

-- CreateIndex
CREATE INDEX "FimProfile_cohort_idx" ON "FimProfile"("cohort");

-- CreateIndex
CREATE INDEX "FimProfile_entityKind_idx" ON "FimProfile"("entityKind");

-- CreateIndex
CREATE INDEX "FimProfile_orgNumber_idx" ON "FimProfile"("orgNumber");

-- AddForeignKey
ALTER TABLE "FimProfile" ADD CONSTRAINT "FimProfile_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "FimRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "MediaOutlet" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "outletType" TEXT NOT NULL,
  "language" TEXT,
  "url" TEXT,
  "notes" TEXT,

  CONSTRAINT "MediaOutlet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MediaEntry" (
  "id" TEXT NOT NULL,
  "outletId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "publishedYear" INTEGER NOT NULL,
  "publishedMonth" INTEGER,
  "publishedDay" INTEGER,
  "datePrecision" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "url" TEXT,
  "recordType" TEXT NOT NULL,
  "verificationLevel" TEXT NOT NULL,
  "triggerLabel" TEXT,
  "sourceDocId" TEXT,
  "sourceRefs" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MediaEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MediaEntry_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "MediaOutlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MediaEntry_sourceDocId_fkey" FOREIGN KEY ("sourceDocId") REFERENCES "SourceDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MediaEntryCoding" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "primaryTheme" TEXT NOT NULL,
  "secondaryThemes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tone" TEXT NOT NULL,
  "frame" TEXT NOT NULL,
  "geography" TEXT NOT NULL,
  "actorTargets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "confidence" INTEGER NOT NULL,
  "triggerLabel" TEXT,
  "evidenceNote" TEXT,
  "codedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MediaEntryCoding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MediaEntryCoding_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MediaEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "MediaEntry_url_key" ON "MediaEntry"("url");
CREATE UNIQUE INDEX IF NOT EXISTS "MediaEntryCoding_entryId_primaryTheme_tone_frame_key" ON "MediaEntryCoding"("entryId", "primaryTheme", "tone", "frame");

CREATE INDEX IF NOT EXISTS "MediaOutlet_country_idx" ON "MediaOutlet"("country");
CREATE INDEX IF NOT EXISTS "MediaOutlet_outletType_idx" ON "MediaOutlet"("outletType");
CREATE INDEX IF NOT EXISTS "MediaEntry_country_publishedYear_idx" ON "MediaEntry"("country", "publishedYear");
CREATE INDEX IF NOT EXISTS "MediaEntry_recordType_idx" ON "MediaEntry"("recordType");
CREATE INDEX IF NOT EXISTS "MediaEntry_verificationLevel_idx" ON "MediaEntry"("verificationLevel");
CREATE INDEX IF NOT EXISTS "MediaEntry_sourceDocId_idx" ON "MediaEntry"("sourceDocId");
CREATE INDEX IF NOT EXISTS "MediaEntryCoding_entryId_idx" ON "MediaEntryCoding"("entryId");
CREATE INDEX IF NOT EXISTS "MediaEntryCoding_country_primaryTheme_idx" ON "MediaEntryCoding"("country", "primaryTheme");
CREATE INDEX IF NOT EXISTS "MediaEntryCoding_tone_idx" ON "MediaEntryCoding"("tone");
CREATE INDEX IF NOT EXISTS "MediaEntryCoding_frame_idx" ON "MediaEntryCoding"("frame");

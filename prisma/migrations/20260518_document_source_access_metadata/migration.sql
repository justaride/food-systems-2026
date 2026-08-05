-- Akademisk kildeføring fase 1: nullable access/archive metadata for canonical documents and source docs.

ALTER TABLE "Document"
ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "archivedUrl" TEXT;

ALTER TABLE "SourceDoc"
ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "archivedUrl" TEXT;

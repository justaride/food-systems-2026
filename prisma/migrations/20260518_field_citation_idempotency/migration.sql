-- Enforce FieldCitation idempotency at DB level.
-- PostgreSQL UNIQUE permits multiple NULLs, so record-level citations
-- (`fieldPath IS NULL`) need a separate partial unique index.

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "citationId", "entityType", "entityId", "fieldPath"
      ORDER BY "id"
    ) AS rn
  FROM "FieldCitation"
  WHERE "fieldPath" IS NOT NULL
)
DELETE FROM "FieldCitation"
WHERE "id" IN (SELECT "id" FROM ranked WHERE rn > 1);

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "citationId", "entityType", "entityId"
      ORDER BY "id"
    ) AS rn
  FROM "FieldCitation"
  WHERE "fieldPath" IS NULL
)
DELETE FROM "FieldCitation"
WHERE "id" IN (SELECT "id" FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS "FieldCitation_unique_field_idx"
ON "FieldCitation"("citationId", "entityType", "entityId", "fieldPath")
WHERE "fieldPath" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "FieldCitation_unique_record_idx"
ON "FieldCitation"("citationId", "entityType", "entityId")
WHERE "fieldPath" IS NULL;

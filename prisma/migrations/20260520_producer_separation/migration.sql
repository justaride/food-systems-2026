-- Producer separation (dual-target FK). Idempotent — re-applied on every Coolify deploy.
-- Producers move to "Producer"; Subsidy/DeliveryVolume keep their Company FK and gain a
-- nullable Producer FK so rows referencing curated companies (Yara, Felleskjøpet) survive.

-- 1. Producer table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Producer" (
  "id"           TEXT NOT NULL,
  "orgNr"        TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "country"      TEXT NOT NULL DEFAULT 'NO',
  "municipality" TEXT,
  "metadata"     JSONB,
  CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Producer_orgNr_key" ON "Producer" ("orgNr");
CREATE INDEX IF NOT EXISTS "Producer_country_idx" ON "Producer" ("country");

-- 2. Additive columns + relax the now-optional Company FK columns ---------
ALTER TABLE "Subsidy"        ADD COLUMN IF NOT EXISTS "producerId" TEXT;
ALTER TABLE "DeliveryVolume" ADD COLUMN IF NOT EXISTS "supplierProducerId" TEXT;
ALTER TABLE "Subsidy"        ALTER COLUMN "companyId"  DROP NOT NULL;
ALTER TABLE "DeliveryVolume" ALTER COLUMN "supplierId" DROP NOT NULL;

-- 3. One-time data move (guard skips it once producers have left Company) -
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production') THEN

    -- 3a. Copy producer rows into Producer (id reused verbatim).
    INSERT INTO "Producer" ("id", "orgNr", "name", "country", "metadata")
    SELECT "id", "orgNr", "name", "country", "metadata"
    FROM "Company" WHERE "valueChainStage" = 'production'
    ON CONFLICT ("id") DO NOTHING;

    -- 3b. Subsidy: move producer references from companyId to producerId.
    UPDATE "Subsidy" s SET "producerId" = s."companyId", "companyId" = NULL
    WHERE s."companyId" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "Producer" p WHERE p."id" = s."companyId");

    -- 3c. DeliveryVolume: move producer references from supplierId to supplierProducerId.
    UPDATE "DeliveryVolume" dv SET "supplierProducerId" = dv."supplierId", "supplierId" = NULL
    WHERE dv."supplierId" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "Producer" p WHERE p."id" = dv."supplierId");

    -- 3d. Remove migrated producers from Company.
    DELETE FROM "Company" WHERE "valueChainStage" = 'production';

  END IF;
END $$;

-- 4. Indexes on the new Producer FK columns ------------------------------
CREATE INDEX IF NOT EXISTS "Subsidy_producerId_idx" ON "Subsidy" ("producerId");
CREATE INDEX IF NOT EXISTS "DeliveryVolume_supplierProducerId_idx" ON "DeliveryVolume" ("supplierProducerId");

-- 5. Foreign keys to Producer --------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subsidy_producerId_fkey') THEN
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_producerId_fkey"
      FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryVolume_supplierProducerId_fkey') THEN
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplierProducerId_fkey"
      FOREIGN KEY ("supplierProducerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Dual-FK invariant: exactly one of the two FK columns is set per row -
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subsidy_recipient_exactly_one') THEN
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_recipient_exactly_one"
      CHECK (("companyId" IS NULL) <> ("producerId" IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryVolume_supplier_exactly_one') THEN
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplier_exactly_one"
      CHECK (("supplierId" IS NULL) <> ("supplierProducerId" IS NULL));
  END IF;
END $$;

-- 7. Pin the pre-existing Company-side FKs to RESTRICT/CASCADE so the DB
--    matches schema.prisma's explicit onDelete (companyId/supplierId became
--    optional). No-op when the constraint is already in that state.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Subsidy_companyId_fkey' AND confdeltype = 'r' AND confupdtype = 'c'
  ) THEN
    ALTER TABLE "Subsidy" DROP CONSTRAINT IF EXISTS "Subsidy_companyId_fkey";
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DeliveryVolume_supplierId_fkey' AND confdeltype = 'r' AND confupdtype = 'c'
  ) THEN
    ALTER TABLE "DeliveryVolume" DROP CONSTRAINT IF EXISTS "DeliveryVolume_supplierId_fkey";
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplierId_fkey"
      FOREIGN KEY ("supplierId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

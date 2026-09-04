-- Nordic systems spine (WP3 internal) + CompanyFinancial unitScale
-- Codebook: docs/project/plans/nordic-spine-codebook-2026-09-04.md
-- Empty indicator/flow tables are intentional.

ALTER TABLE "CompanyFinancial" ADD COLUMN "unitScale" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "CompanyFinancial" ADD COLUMN "amountUnitNote" TEXT;

CREATE TABLE "NordicCell" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definitionMd" TEXT NOT NULL,
    "periodRule" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "codebookPath" TEXT NOT NULL DEFAULT 'docs/project/plans/nordic-spine-codebook-2026-09-04.md',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NordicCell_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NordicIndicatorRow" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DECIMAL(18,6),
    "unit" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "holeReason" TEXT,
    "citationId" TEXT,
    "partnerStatus" TEXT NOT NULL DEFAULT 'internal',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NordicIndicatorRow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivitySignal" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "confidence" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "citationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FlowCell" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "substance" TEXT NOT NULL,
    "fromNode" TEXT NOT NULL,
    "toNode" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "systemBoundary" TEXT NOT NULL,
    "citationId" TEXT,
    "holeReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowCell_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NordicIndicatorRow_cellId_country_indicatorId_year_methodId_key" ON "NordicIndicatorRow"("cellId", "country", "indicatorId", "year", "methodId");
CREATE INDEX "NordicIndicatorRow_cellId_country_idx" ON "NordicIndicatorRow"("cellId", "country");
CREATE INDEX "NordicIndicatorRow_country_year_idx" ON "NordicIndicatorRow"("country", "year");
CREATE INDEX "NordicIndicatorRow_quality_idx" ON "NordicIndicatorRow"("quality");
CREATE INDEX "NordicIndicatorRow_partnerStatus_idx" ON "NordicIndicatorRow"("partnerStatus");

CREATE INDEX "ActivitySignal_entityType_entityId_domain_idx" ON "ActivitySignal"("entityType", "entityId", "domain");
CREATE INDEX "ActivitySignal_domain_year_idx" ON "ActivitySignal"("domain", "year");
CREATE INDEX "ActivitySignal_confidence_idx" ON "ActivitySignal"("confidence");

CREATE INDEX "FlowCell_cellId_country_year_idx" ON "FlowCell"("cellId", "country", "year");
CREATE INDEX "FlowCell_substance_idx" ON "FlowCell"("substance");
CREATE INDEX "FlowCell_quality_idx" ON "FlowCell"("quality");

ALTER TABLE "NordicIndicatorRow"
  ADD CONSTRAINT "NordicIndicatorRow_cellId_fkey"
  FOREIGN KEY ("cellId") REFERENCES "NordicCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FlowCell"
  ADD CONSTRAINT "FlowCell_cellId_fkey"
  FOREIGN KEY ("cellId") REFERENCES "NordicCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the three frozen cell shells (indicator/flow rows intentionally empty)
INSERT INTO "NordicCell" ("id", "title", "definitionMd", "periodRule", "status", "codebookPath", "updatedAt") VALUES
(
  'retail-concentration',
  'Grocery retail concentration (CR3 / HHI / top-3 margins)',
  'C1: Comparable grocery retail concentration and top-3 operating margins across NO/SE/DK/FI/IS. See codebook.',
  'calendar-year for CR3/HHI; latest completed FY for margins (label year explicitly)',
  'frozen',
  'docs/project/plans/nordic-spine-codebook-2026-09-04.md',
  CURRENT_TIMESTAMP
),
(
  'seafood-residue-flow',
  'Aquaculture residue / sludge flow',
  'C2: Aquaculture → sludge/residue → collected → treated (mass + N/P). True-C holes allowed if dated. See codebook.',
  'calendar-year',
  'frozen',
  'docs/project/plans/nordic-spine-codebook-2026-09-04.md',
  CURRENT_TIMESTAMP
),
(
  'food-waste-digestate',
  'Food waste → digestate nutrient loop',
  'C3: Household/municipal food waste → biogas/digestate → land (mass + N/P/K class). See codebook.',
  'calendar-year',
  'frozen',
  'docs/project/plans/nordic-spine-codebook-2026-09-04.md',
  CURRENT_TIMESTAMP
);

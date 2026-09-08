BEGIN;
CREATE TEMP TABLE "DeliveryVolume" (LIKE public."DeliveryVolume" INCLUDING DEFAULTS);
ALTER TABLE "DeliveryVolume" DROP COLUMN "buyerVerification", DROP COLUMN "buyerSourceUrl";
CREATE TEMP TABLE "FlowCell" (LIKE public."FlowCell" INCLUDING DEFAULTS);
INSERT INTO "DeliveryVolume" (id,"supplierOrgNr",commodity,year,quantity,unit,"buyerId","buyerName",source,metadata) VALUES ('test-delivery','test-supplier','melk-ku',2024,123,'liter','inferred','Tine','Landbruksdirektoratet','{"original":"preserved"}');
INSERT INTO "FlowCell" (id,"cellId",country,year,substance,"fromNode","toNode",quantity,unit,quality,"systemBoundary",metadata,"updatedAt") VALUES ('test-flow','food-waste-digestate','NO',2024,'mass','household_municipal_waste','collection',451000,'t','measured','old', '{"pass":"nordic-c3-food-waste-digestate-2026-09-04","sourceMetricType":"foodWaste"}', now());
-- Add negative-by-default buyer provenance; retain rejected assignments as history.
ALTER TABLE "DeliveryVolume" ADD COLUMN "buyerVerification" TEXT NOT NULL DEFAULT 'unverified', ADD COLUMN "buyerSourceUrl" TEXT;
UPDATE "DeliveryVolume"
SET "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_build_object(
      'rejectedBuyerAssignment', jsonb_build_object('buyerId', "buyerId", 'buyerName', "buyerName", 'reason', 'Importer assigned buyer by commodity, not by source observation', 'repair', 'FS-02-2026-09-08')),
    "buyerId" = NULL, "buyerName" = NULL
WHERE "source" = 'Landbruksdirektoratet' AND ("buyerId" IS NOT NULL OR "buyerName" IS NOT NULL);

-- A food-waste statistic does not measure collected household/municipal waste.
UPDATE "FlowCell"
SET "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_build_object(
      'rejectedFlowInterpretation', jsonb_build_object('quantity', "quantity", 'quality', "quality", 'systemBoundary', "systemBoundary", 'repair', 'FS-03-2026-09-08')),
    "quantity" = NULL,
    "quality" = 'unknown',
    "holeReason" = 'Food-waste statistics do not document collected household/municipal mass. No compatible collection measurement is available.',
    "systemBoundary" = 'Household + municipal food-waste collection → biogas / AD → digestate → land application. Waste generation and industrial/retail totals are outside the collection boundary.'
WHERE "cellId" = 'food-waste-digestate'
  AND "fromNode" = 'household_municipal_waste' AND "toNode" = 'collection'
  AND "metadata"->>'pass' = 'nordic-c3-food-waste-digestate-2026-09-04'
  AND "metadata"->>'sourceMetricType' = 'foodWaste';

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM "DeliveryVolume" WHERE id='test-delivery' AND "buyerId" IS NULL AND "buyerName" IS NULL AND quantity=123 AND metadata->>'original'='preserved' AND metadata->'rejectedBuyerAssignment'->>'buyerId'='inferred') THEN RAISE EXCEPTION 'buyer repair failed'; END IF;
IF NOT EXISTS (SELECT 1 FROM "FlowCell" WHERE id='test-flow' AND quantity IS NULL AND quality='unknown' AND metadata->'rejectedFlowInterpretation'->>'quantity'='451000') THEN RAISE EXCEPTION 'C3 repair failed'; END IF;
RAISE NOTICE 'PASS: quantities preserved, inferred buyers removed with history, C3 quantity retracted with history';
END $$;
ROLLBACK;

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

-- Actor relationship provenance.
--
-- ActorRelationship rows were included in the knowledge graph, but had no
-- source/provenance columns. That left all actor-to-actor graph edges without
-- confidence/source labels even though the rows are curated seed relationships.
--
-- Idempotent so it is safe to apply on databases that have already been
-- synced with `prisma db push`.

ALTER TABLE "ActorRelationship"
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

UPDATE "ActorRelationship"
SET
  "source" = COALESCE("source", 'source:curated-actor-relationship-seed'),
  "metadata" = COALESCE("metadata", '{"sourceType":"curated_actor_relationship_seed"}'::jsonb)
WHERE "source" IS NULL;

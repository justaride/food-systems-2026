-- Align three candidate identifiers with the names Prisma derives.
--
-- 20260818_candidate_analysis_foundation declares three identifiers longer than
-- PostgreSQL's 63-character limit. PostgreSQL truncates them on the right and
-- says so (`identifier ... will be truncated to ...`), while Prisma shortens the
-- middle so the `_key` / `_fkey` suffix survives. The two names can therefore
-- never agree, so `prisma migrate diff` reports a rename on every run and
-- scripts/verify-database-schema-drift.sh fails closed on unknown drift. That
-- stops the container before it serves traffic, which is how the deploy of
-- 6e278a1 failed.
--
-- The foundation migration is already applied, and editing it would change its
-- checksum and break `migrate deploy` on every environment that has it. So the
-- rename happens here instead. A database built from prisma/schema.prisma
-- directly already carries the target names, hence the existence guards.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'CandidatePromotionDecision_assertionId_assertionPayloadHash_fke'
  ) THEN
    ALTER TABLE "CandidatePromotionDecision"
      RENAME CONSTRAINT "CandidatePromotionDecision_assertionId_assertionPayloadHash_fke"
                     TO "CandidatePromotionDecision_assertionId_assertionPayloadHas_fkey";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relkind = 'i'
      AND relname = 'CandidateHumanReviewDecision_id_decisionHash_assertionId_review'
  ) THEN
    ALTER INDEX "CandidateHumanReviewDecision_id_decisionHash_assertionId_review"
      RENAME TO "CandidateHumanReviewDecision_id_decisionHash_assertionId_re_key";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relkind = 'i'
      AND relname = 'CandidatePromotionDecision_id_decisionHash_assertionId_targetPr'
  ) THEN
    ALTER INDEX "CandidatePromotionDecision_id_decisionHash_assertionId_targetPr"
      RENAME TO "CandidatePromotionDecision_id_decisionHash_assertionId_targ_key";
  END IF;
END
$$;

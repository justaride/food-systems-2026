-- Create or extend citation enums before later migrations use new enum values
-- as column defaults.

DO $$
BEGIN
  CREATE TYPE "SourceClass" AS ENUM (
    'primary',
    'secondary',
    'dataset',
    'internal_synthesis',
    'media',
    'unknown',
    'synthesis',
    'internal_construct',
    'registry_snapshot',
    'legacy_unsourced'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "SourceClass" ADD VALUE IF NOT EXISTS 'dataset';
ALTER TYPE "SourceClass" ADD VALUE IF NOT EXISTS 'internal_synthesis';
ALTER TYPE "SourceClass" ADD VALUE IF NOT EXISTS 'media';
ALTER TYPE "SourceClass" ADD VALUE IF NOT EXISTS 'unknown';

DO $$
BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM (
    'verified',
    'partially_verified',
    'needs_review',
    'failed',
    'unverified',
    'machine_verified',
    'human_verified',
    'disputed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'partially_verified';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'needs_review';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'failed';

DO $$
BEGIN
  CREATE TYPE "CitationReadiness" AS ENUM (
    'citable_external',
    'citable_with_note',
    'internal_context',
    'blocked_unsourced'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

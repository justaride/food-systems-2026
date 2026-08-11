-- Follow-up only: the base controlled-mutation migration may already be in a
-- migration ledger. Never rewrite that applied migration to add this binding.
BEGIN;

LOCK TABLE "ControlledMutationAudit" IN ACCESS EXCLUSIVE MODE;

DO $dependency_binding_preflight$
BEGIN
  IF EXISTS (SELECT 1 FROM "ControlledMutationAudit") THEN
    RAISE EXCEPTION
      'dependencyStateSha256 cannot be added without a reviewed backfill for existing ControlledMutationAudit rows';
  END IF;
END
$dependency_binding_preflight$;

ALTER TABLE "ControlledMutationAudit"
  ADD COLUMN "dependencyStateSha256" TEXT NOT NULL,
  ADD CONSTRAINT "ControlledMutationAudit_dependencyStateSha256_check"
    CHECK ("dependencyStateSha256" ~ '^[0-9a-f]{64}$');

ALTER TABLE "ControlledMutationAudit"
  DROP CONSTRAINT "ControlledMutationAudit_operator_authorization_check",
  ADD CONSTRAINT "ControlledMutationAudit_operator_authorization_check" CHECK (
    NULLIF(BTRIM("operatorId"), '') IS NOT NULL
    AND NULLIF(BTRIM("authorizationRef"), '') IS NOT NULL
    AND NULLIF(BTRIM("databaseRole"), '') IS NOT NULL
    AND LOWER(BTRIM("databaseRole")) NOT LIKE '%mcp%'
    AND LOWER(BTRIM("databaseRole")) NOT LIKE '%readonly%'
    AND LOWER(BTRIM("databaseRole")) NOT LIKE '%read_only%'
    AND LOWER(BTRIM("databaseRole")) NOT LIKE '%read-only%'
    AND LOWER(BTRIM("databaseRole")) !~ '(^|[_-])ro($|[_-])'
  );

CREATE FUNCTION public.enforce_controlled_mutation_audit_database_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $audit_role$
BEGIN
  IF NEW."operatorId" IS DISTINCT FROM BTRIM(NEW."operatorId")
    OR NEW."operatorId" ~ '[[:cntrl:]]'
  THEN
    RAISE EXCEPTION
      'ControlledMutationAudit.operatorId must be trimmed text without control characters';
  END IF;

  IF NEW."authorizationRef" IS DISTINCT FROM BTRIM(NEW."authorizationRef")
    OR NEW."authorizationRef" ~ '[[:cntrl:]]'
  THEN
    RAISE EXCEPTION
      'ControlledMutationAudit.authorizationRef must be trimmed text without control characters';
  END IF;

  IF NEW."databaseRole" IS DISTINCT FROM BTRIM(NEW."databaseRole")
    OR NEW."databaseRole" ~ '[[:cntrl:]]'
    OR BTRIM(NEW."databaseRole") IS DISTINCT FROM current_user::text
  THEN
    RAISE EXCEPTION
      'ControlledMutationAudit.databaseRole must be trimmed and equal current_user (%)',
      current_user;
  END IF;
  RETURN NEW;
END
$audit_role$;

REVOKE ALL ON FUNCTION public.enforce_controlled_mutation_audit_database_role() FROM PUBLIC;

CREATE TRIGGER "ControlledMutationAudit_bind_database_role"
BEFORE INSERT ON "ControlledMutationAudit"
FOR EACH ROW
EXECUTE FUNCTION public.enforce_controlled_mutation_audit_database_role();

COMMIT;

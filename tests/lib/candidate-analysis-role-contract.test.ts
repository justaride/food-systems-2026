import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { withCandidateAnalysisPostgres } from "../helpers/candidate-analysis-postgres";

const repoRoot = process.cwd();
const bootstrapPath = resolve("scripts/bootstrap-candidate-analysis-roles.sh");
const disablePath = resolve("scripts/disable-candidate-analysis-writes.sh");
const verifyPath = resolve("scripts/verify-candidate-analysis-roles.sh");

function executable(path: string): boolean {
  return existsSync(path) && (statSync(path).mode & 0o111) !== 0;
}

function postgresPath(): string {
  const configured = process.env.POSTGRES_BINDIR?.trim();
  if (configured) return `${configured}:${process.env.PATH ?? ""}`;
  const result = spawnSync("pg_config", ["--bindir"], { encoding: "utf8" });
  return result.status === 0 && result.stdout.trim()
    ? `${result.stdout.trim()}:${process.env.PATH ?? ""}`
    : process.env.PATH ?? "";
}

test("candidate role scripts are explicit, credential-safe, and exact-allowlist", () => {
  const bootstrap = readFileSync(bootstrapPath, "utf8");
  const disable = readFileSync(disablePath, "utf8");
  const verify = readFileSync(verifyPath, "utf8");

  assert.ok(executable(bootstrapPath));
  assert.ok(executable(disablePath));
  assert.ok(executable(verifyPath));
  for (const script of [bootstrap, disable, verify]) {
    assert.match(script, /^#!\/bin\/sh/);
    assert.match(script, /set -eu/);
    assert.match(script, /PGPASSFILE/);
    assert.match(script, /url\.searchParams\.has\("password"\)/);
    assert.match(script, /url\.searchParams\.has\("sslpassword"\)/);
    assert.match(script, /url\.password = ""/);
  }

  assert.match(bootstrap, /refusing to change grants without --apply/);
  assert.match(
    bootstrap,
    /NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS/,
  );
  assert.match(bootstrap, /GRANT INSERT ON TABLE/);
  assert.doesNotMatch(bootstrap, /GRANT (?:ALL|UPDATE|DELETE|TRUNCATE)/);
  assert.doesNotMatch(bootstrap, /review_operator|promotion_service/);

  assert.match(verify, /CandidateHumanReviewDecision/);
  assert.match(verify, /CandidatePromotionDecision/);
  assert.match(verify, /canonical or unrelated write privilege is effective/i);
  assert.match(verify, /has_table_privilege\(current_user, relation_oid, 'SELECT'\)/);
  assert.match(verify, /has_table_privilege\(current_user, relation_oid, 'INSERT'\)/);
  assert.match(verify, /has_table_privilege\(current_user, relation_oid, 'UPDATE'\)/);
  assert.match(verify, /has_any_column_privilege\(current_user, relation_oid, 'UPDATE'\)/);
  assert.match(verify, /has_database_privilege\(current_user, current_database\(\), 'TEMP'\)/);
  assert.match(verify, /has_schema_privilege\(current_user, schema_oid, 'CREATE'\)/);
  assert.match(verify, /has_function_privilege\(current_user, routine_oid, 'EXECUTE'\)/);

  assert.match(disable, /refusing to disable candidate writes without --apply/);
  assert.match(disable, /ALTER ROLE .* NOLOGIN/);
  assert.match(disable, /pg_terminate_backend/);
  assert.doesNotMatch(disable, /DROP (?:TABLE|ROLE)|DELETE FROM|TRUNCATE/);
});

test(
  "candidate roles enforce exact effective privileges and fail-safe disable in PostgreSQL",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl, database, port, psql }) => {
      const setup = psql(`
        CREATE TABLE public."Document" (id text PRIMARY KEY);
        CREATE TABLE public."SourceDoc" (id text PRIMARY KEY);
        CREATE TABLE public."LibraryAnalysisRecord" (id text PRIMARY KEY);
        CREATE TABLE public."CanonicalOutsideAllowlist" (id text PRIMARY KEY);
        CREATE SCHEMA sidecar;
        CREATE TABLE sidecar.unrelated (id text PRIMARY KEY);
        CREATE ROLE candidate_inherited_writer NOLOGIN;
        CREATE ROLE foodsystems_candidate_worker NOLOGIN;
        CREATE ROLE foodsystems_candidate_reconciler NOLOGIN;
        GRANT USAGE ON SCHEMA sidecar TO candidate_inherited_writer;
        GRANT INSERT ON sidecar.unrelated TO candidate_inherited_writer;
        GRANT candidate_inherited_writer TO foodsystems_candidate_worker;
        ALTER ROLE foodsystems_candidate_worker SET default_transaction_read_only TO 'on';
        GRANT INSERT ON public."CanonicalOutsideAllowlist" TO PUBLIC;
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const path = postgresPath();
      const workerPassword = "candidate-worker-test-password";
      const reconcilerPassword = "candidate-reconciler-test-password";
      const workerUrl = `postgresql://foodsystems_candidate_worker:${workerPassword}@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-worker`;
      const reconcilerUrl = `postgresql://foodsystems_candidate_reconciler:${reconcilerPassword}@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-reconciler`;
      const adminEnv = {
        ...process.env,
        PATH: path,
        DATABASE_ADMIN_URL: adminUrl,
        CANDIDATE_WORKER_DB_PASSWORD: workerPassword,
        CANDIDATE_RECONCILER_DB_PASSWORD: reconcilerPassword,
      };

      const bootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(bootstrap.status, 0, bootstrap.stderr);

      const verifyWorker = () =>
        spawnSync(verifyPath, ["--role=worker"], {
          cwd: repoRoot,
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: path,
            CANDIDATE_WORKER_DATABASE_URL: workerUrl,
          },
        });
      const verifyReconciler = () =>
        spawnSync(verifyPath, ["--role=reconciler"], {
          cwd: repoRoot,
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: path,
            CANDIDATE_RECONCILER_DATABASE_URL: reconcilerUrl,
          },
        });

      const initialWorker = verifyWorker();
      assert.equal(initialWorker.status, 0, initialWorker.stderr);
      const initialReconciler = verifyReconciler();
      assert.equal(initialReconciler.status, 0, initialReconciler.stderr);

      const effective = psql(`
        SELECT
          has_table_privilege('foodsystems_candidate_worker', 'public."Document"', 'SELECT'),
          has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          has_table_privilege('foodsystems_candidate_worker', 'public."CandidateReconciliationSnapshot"', 'INSERT'),
          has_table_privilege('foodsystems_candidate_worker', 'public."CandidateHumanReviewDecision"', 'INSERT'),
          has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateAssertion"', 'SELECT'),
          has_table_privilege('foodsystems_candidate_reconciler', 'public."Document"', 'SELECT'),
          has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT'),
          has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateAssertion"', 'INSERT');
      `);
      assert.equal(effective.status, 0, effective.stderr);
      assert.match(
        effective.stdout,
        /t\s*\|\s*t\s*\|\s*f\s*\|\s*f\s*\|\s*t\s*\|\s*f\s*\|\s*t\s*\|\s*f/,
      );

      assert.equal(
        psql('GRANT INSERT ON public."Document" TO foodsystems_candidate_worker').status,
        0,
      );
      const canonicalLeak = verifyWorker();
      assert.notEqual(canonicalLeak.status, 0);
      assert.match(canonicalLeak.stderr, /canonical or unrelated write privilege is effective/i);
      assert.equal(
        psql('REVOKE INSERT ON public."Document" FROM foodsystems_candidate_worker').status,
        0,
      );
      assert.equal(verifyWorker().status, 0);

      assert.equal(
        psql('GRANT candidate_inherited_writer TO foodsystems_candidate_worker').status,
        0,
      );
      const membershipLeak = verifyWorker();
      assert.notEqual(membershipLeak.status, 0);
      assert.match(membershipLeak.stderr, /membership/i);
      assert.equal(
        psql('REVOKE candidate_inherited_writer FROM foodsystems_candidate_worker').status,
        0,
      );
      assert.equal(verifyWorker().status, 0);

      const beforeDisable = psql(`
        SELECT sum(row_count) FROM (
          SELECT count(*) AS row_count FROM public."CandidateAnalysisRun"
          UNION ALL
          SELECT count(*) FROM public."CandidateReconciliationSnapshot"
        ) rows;
      `);
      assert.equal(beforeDisable.status, 0, beforeDisable.stderr);

      assert.equal(
        psql('GRANT INSERT ON public."Document" TO foodsystems_candidate_worker').status,
        0,
      );
      assert.equal(
        psql('GRANT INSERT (id) ON sidecar.unrelated TO foodsystems_candidate_reconciler').status,
        0,
      );

      const disable = spawnSync(disablePath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: path,
          DATABASE_ADMIN_URL: adminUrl,
        },
      });
      assert.equal(disable.status, 0, disable.stderr);

      const disabled = psql(`
        SELECT
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."Document"', 'INSERT'),
          NOT has_any_column_privilege('foodsystems_candidate_reconciler', 'sidecar.unrelated', 'INSERT');
      `);
      assert.equal(disabled.status, 0, disabled.stderr);
      assert.match(
        disabled.stdout,
        /t\s*\|\s*t\s*\|\s*t\s*\|\s*t\s*\|\s*t\s*\|\s*t/,
      );
      const afterDisable = psql(`
        SELECT sum(row_count) FROM (
          SELECT count(*) AS row_count FROM public."CandidateAnalysisRun"
          UNION ALL
          SELECT count(*) FROM public."CandidateReconciliationSnapshot"
        ) rows;
      `);
      assert.equal(afterDisable.status, 0, afterDisable.stderr);
      assert.equal(afterDisable.stdout.trim(), beforeDisable.stdout.trim());

      const rebootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(rebootstrap.status, 0, rebootstrap.stderr);
      assert.equal(verifyWorker().status, 0);
      assert.equal(verifyReconciler().status, 0);
      const reservedRoles = psql(
        "SELECT count(*) FROM pg_roles WHERE rolname IN ('review_operator', 'promotion_service')",
      );
      assert.equal(reservedRoles.status, 0, reservedRoles.stderr);
      assert.equal(reservedRoles.stdout.trim(), "0");
    });
  },
);

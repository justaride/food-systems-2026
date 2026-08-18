import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
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

async function waitFor(
  predicate: () => boolean,
  message: string,
  timeoutMs = 5_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
  }
  throw new Error(message);
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
  assert.match(verify, /session_user <> current_user/);
  assert.match(verify, /url\.username/);
  assert.match(verify, /url\.searchParams\.has\("options"\)/);
  assert.match(verify, /pg_type/);

  assert.match(disable, /refusing to disable candidate writes without --apply/);
  assert.match(disable, /ALTER ROLE .* NOLOGIN/);
  assert.match(disable, /pg_terminate_backend/);
  assert.doesNotMatch(disable, /DROP (?:TABLE|ROLE)|DELETE FROM|TRUNCATE/);
});

test("candidate scripts sanitize malformed URLs and remove password variables before psql", () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "candidate-role-secret-contract-"));
  const fakePsql = join(tempRoot, "psql");
  const invocationLog = join(tempRoot, "psql.log");
  writeFileSync(
    fakePsql,
    `#!/bin/sh
if [ -n "\${CANDIDATE_WORKER_DB_PASSWORD:-}" ] || [ -n "\${CANDIDATE_RECONCILER_DB_PASSWORD:-}" ]; then
  printf '%s\n' password-env-present > "$FAKE_PSQL_LOG"
  exit 91
fi
printf '%s\n' "$*" > "$FAKE_PSQL_LOG"
exit 0
`,
  );
  chmodSync(fakePsql, 0o755);

  try {
    const secret = "do-not-leak-this-password";
    const commonEnv = {
      ...process.env,
      PATH: `${tempRoot}:${process.env.PATH ?? ""}`,
      FAKE_PSQL_LOG: invocationLog,
    };
    for (const [script, args, env] of [
      [
        bootstrapPath,
        ["--apply"],
        {
          ...commonEnv,
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}@[invalid/db`,
          CANDIDATE_WORKER_DB_PASSWORD: secret,
          CANDIDATE_RECONCILER_DB_PASSWORD: secret,
        },
      ],
      [
        disablePath,
        ["--apply"],
        {
          ...commonEnv,
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}@[invalid/db`,
        },
      ],
      [
        verifyPath,
        ["--role=worker"],
        {
          ...commonEnv,
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@[invalid/db`,
        },
      ],
    ] as const) {
      const result = spawnSync(script, args, {
        cwd: repoRoot,
        encoding: "utf8",
        env,
      });
      assert.notEqual(result.status, 0);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
      assert.match(result.stderr, /invalid PostgreSQL URL/);
    }

    for (const [script, args, env] of [
      [
        bootstrapPath,
        ["--apply"],
        {
          ...commonEnv,
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}%E0%A4%A@example.invalid/db`,
          CANDIDATE_WORKER_DB_PASSWORD: secret,
          CANDIDATE_RECONCILER_DB_PASSWORD: secret,
        },
      ],
      [
        disablePath,
        ["--apply"],
        {
          ...commonEnv,
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}%E0%A4%A@example.invalid/db`,
        },
      ],
      [
        verifyPath,
        ["--role=worker"],
        {
          ...commonEnv,
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}%E0%A4%A@example.invalid/db?application_name=foodsystems-candidate-worker`,
        },
      ],
    ] as const) {
      const result = spawnSync(script, args, {
        cwd: repoRoot,
        encoding: "utf8",
        env,
      });
      assert.notEqual(result.status, 0);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
      assert.match(result.stderr, /invalid PostgreSQL URL/);
    }

    const safeBootstrap = spawnSync(bootstrapPath, ["--apply"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...commonEnv,
        DATABASE_ADMIN_URL: "postgresql://admin:admin-secret@example.invalid/foodsystems",
        CANDIDATE_WORKER_DB_PASSWORD: secret,
        CANDIDATE_RECONCILER_DB_PASSWORD: `${secret}-reconciler`,
      },
    });
    assert.equal(safeBootstrap.status, 0, safeBootstrap.stderr);
    const invocation = readFileSync(invocationLog, "utf8");
    assert.doesNotMatch(invocation, /password-env-present/);
    assert.doesNotMatch(invocation, new RegExp(secret));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
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

      const candidateTables = [
        "CandidateContentUnit",
        "CandidateAnalysisRun",
        "CandidateAnalysisRunInput",
        "CandidateAnalysisRunEvent",
        "CandidateAnalysisArtifact",
        "CandidateAssertion",
        "CandidateEvidenceLink",
        "CandidateDependency",
        "CandidateReconciliationSnapshot",
        "CandidateHumanReviewDecision",
        "CandidatePromotionDecision",
      ] as const;
      const canonicalTables = [
        "Document",
        "SourceDoc",
        "LibraryAnalysisRecord",
      ] as const;
      const tablePrivileges = [
        "SELECT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "TRIGGER",
      ] as const;
      const workerInsert = new Set([
        "CandidateAnalysisRun",
        "CandidateAnalysisRunInput",
        "CandidateAnalysisRunEvent",
        "CandidateAnalysisArtifact",
        "CandidateAssertion",
        "CandidateEvidenceLink",
        "CandidateDependency",
      ]);
      const matrix = psql(`
        SELECT role_name, relation_name, privilege_name,
          has_table_privilege(role_name, format('public.%I', relation_name), privilege_name)
        FROM unnest(ARRAY['foodsystems_candidate_worker', 'foodsystems_candidate_reconciler']) role_name
        CROSS JOIN unnest(ARRAY[
          'Document', 'SourceDoc', 'LibraryAnalysisRecord',
          'CandidateContentUnit', 'CandidateAnalysisRun',
          'CandidateAnalysisRunInput', 'CandidateAnalysisRunEvent',
          'CandidateAnalysisArtifact', 'CandidateAssertion',
          'CandidateEvidenceLink', 'CandidateDependency',
          'CandidateReconciliationSnapshot', 'CandidateHumanReviewDecision',
          'CandidatePromotionDecision'
        ]) relation_name
        CROSS JOIN unnest(ARRAY[
          'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
        ]) privilege_name
        ORDER BY role_name, relation_name, privilege_name;
      `);
      assert.equal(matrix.status, 0, matrix.stderr);
      const actualMatrix = new Map(
        matrix.stdout.trim().split("\n").map((line) => {
          const [role, relation, privilege, value] = line.split("|");
          return [`${role}|${relation}|${privilege}`, value === "t"];
        }),
      );
      for (const role of [
        "foodsystems_candidate_worker",
        "foodsystems_candidate_reconciler",
      ] as const) {
        for (const relation of [...canonicalTables, ...candidateTables]) {
          for (const privilege of tablePrivileges) {
            const expected = privilege === "SELECT"
              ? candidateTables.includes(relation as typeof candidateTables[number])
                || (role === "foodsystems_candidate_worker"
                  && canonicalTables.includes(relation as typeof canonicalTables[number]))
              : privilege === "INSERT"
                ? role === "foodsystems_candidate_worker"
                  ? workerInsert.has(relation)
                  : relation === "CandidateReconciliationSnapshot"
                : false;
            assert.equal(
              actualMatrix.get(`${role}|${relation}|${privilege}`),
              expected,
              `${role} ${privilege} public.${relation}`,
            );
          }
        }
      }
      const columnMatrix = psql(`
        SELECT role_name, relation_name, privilege_name,
          has_any_column_privilege(role_name, format('public.%I', relation_name), privilege_name)
        FROM unnest(ARRAY['foodsystems_candidate_worker', 'foodsystems_candidate_reconciler']) role_name
        CROSS JOIN unnest(ARRAY[
          'Document', 'SourceDoc', 'LibraryAnalysisRecord',
          'CandidateContentUnit', 'CandidateAnalysisRun',
          'CandidateAnalysisRunInput', 'CandidateAnalysisRunEvent',
          'CandidateAnalysisArtifact', 'CandidateAssertion',
          'CandidateEvidenceLink', 'CandidateDependency',
          'CandidateReconciliationSnapshot', 'CandidateHumanReviewDecision',
          'CandidatePromotionDecision'
        ]) relation_name
        CROSS JOIN unnest(ARRAY['INSERT', 'UPDATE', 'REFERENCES']) privilege_name
        ORDER BY role_name, relation_name, privilege_name;
      `);
      assert.equal(columnMatrix.status, 0, columnMatrix.stderr);
      for (const line of columnMatrix.stdout.trim().split("\n")) {
        const [role, relation, privilege, value] = line.split("|");
        const expected = privilege === "INSERT"
          && (role === "foodsystems_candidate_worker"
            ? workerInsert.has(relation)
            : relation === "CandidateReconciliationSnapshot");
        assert.equal(value === "t", expected, `${role} column ${privilege} public.${relation}`);
      }

      assert.equal(
        psql("CREATE TYPE sidecar.candidate_owned_enum AS ENUM ('one')").status,
        0,
      );
      assert.equal(
        psql("ALTER TYPE sidecar.candidate_owned_enum OWNER TO foodsystems_candidate_worker").status,
        0,
      );
      const ownershipLeak = verifyWorker();
      assert.notEqual(ownershipLeak.status, 0);
      assert.match(ownershipLeak.stderr, /owns user-defined type|ownership dependency/i);
      assert.equal(
        psql("ALTER TYPE sidecar.candidate_owned_enum OWNER TO postgres").status,
        0,
      );
      assert.equal(verifyWorker().status, 0);

      const gatewayUrl = `postgresql://postgres@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-worker&options=-c%20role%3Dfoodsystems_candidate_worker`;
      const gatewayAttempt = spawnSync(verifyPath, ["--role=worker"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: path,
          CANDIDATE_WORKER_DATABASE_URL: gatewayUrl,
        },
      });
      assert.notEqual(gatewayAttempt.status, 0);
      assert.match(gatewayAttempt.stderr, /startup options are not permitted/);
      const gatewayUsernameAttempt = spawnSync(verifyPath, ["--role=worker"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: path,
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://postgres@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-worker`,
        },
      });
      assert.notEqual(gatewayUsernameAttempt.status, 0);
      assert.match(gatewayUsernameAttempt.stderr, /username does not match expected role/);
      const inheritedOptionsAttempt = spawnSync(verifyPath, ["--role=worker"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: path,
          PGOPTIONS: "-c role=foodsystems_candidate_worker",
          CANDIDATE_WORKER_DATABASE_URL: workerUrl,
        },
      });
      assert.notEqual(inheritedOptionsAttempt.status, 0);
      assert.match(inheritedOptionsAttempt.stderr, /PGOPTIONS is not permitted/);
      const gatewayIdentity = psql(
        "SET ROLE foodsystems_candidate_worker; SELECT session_user, current_user; RESET ROLE",
      );
      assert.equal(gatewayIdentity.status, 0, gatewayIdentity.stderr);
      assert.match(
        gatewayIdentity.stdout,
        /postgres\s*\|\s*foodsystems_candidate_worker/,
      );
      assert.equal(psql("CREATE ROLE candidate_gateway LOGIN").status, 0);
      assert.equal(
        psql("GRANT foodsystems_candidate_worker TO candidate_gateway").status,
        0,
      );
      const inboundMembershipLeak = verifyWorker();
      assert.notEqual(inboundMembershipLeak.status, 0);
      assert.match(inboundMembershipLeak.stderr, /can SET ROLE into the candidate identity/i);
      const membershipCleanupBootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(membershipCleanupBootstrap.status, 0, membershipCleanupBootstrap.stderr);
      assert.equal(verifyWorker().status, 0);

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

      const hash = "a".repeat(64);
      const seeded = psql(`
        INSERT INTO public."CandidateAnalysisRun" (
          "id", "workflowId", "workflowVersion", "modelProvider", "modelName",
          "modelVersion", "promptHash", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'disable-preservation-run', 'candidate-analysis', 'v1', 'test', 'test-model',
          'v1', '${hash}', '${hash}', '${hash}', 'disable preservation',
          'candidate-only', 'test-worker', 'disable-preservation-run', 1
        );
        INSERT INTO public."CandidateReconciliationSnapshot" (
          "id", "runId", "scopeHash", "payload", "payloadHash", "conflictCount"
        ) VALUES (
          'disable-preservation-snapshot', 'disable-preservation-run', '${hash}',
          '{}', '${hash}', 0
        );
      `);
      assert.equal(seeded.status, 0, seeded.stderr);

      const candidateSession = spawn(
        "psql",
        [
          "-X", "-h", "127.0.0.1", "-p", String(port),
          "-U", "foodsystems_candidate_worker", "-d", database,
          "-c", "SELECT pg_sleep(30)",
        ],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            PATH: path,
            PGAPPNAME: "candidate-disable-session-test",
          },
          stdio: "ignore",
        },
      );
      const unrelatedSession = spawn(
        "psql",
        [
          "-X", "-h", "127.0.0.1", "-p", String(port),
          "-U", "postgres", "-d", database,
          "-c", "SELECT pg_sleep(30)",
        ],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            PATH: path,
            PGAPPNAME: "candidate-unrelated-session-test",
          },
          stdio: "ignore",
        },
      );
      const reconcilerSession = spawn(
        "psql",
        [
          "-X", "-h", "127.0.0.1", "-p", String(port),
          "-U", "foodsystems_candidate_reconciler", "-d", database,
          "-c", "SELECT pg_sleep(30)",
        ],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            PATH: path,
            PGAPPNAME: "candidate-disable-reconciler-session-test",
          },
          stdio: "ignore",
        },
      );
      const activityCount = (applicationName: string) => {
        const result = psql(
          `SELECT count(*) FROM pg_stat_activity WHERE application_name = '${applicationName}'`,
        );
        return result.status === 0 ? result.stdout.trim() : "error";
      };
      await waitFor(
        () => activityCount("candidate-disable-session-test") === "1",
        "candidate session did not become active",
      );
      await waitFor(
        () => activityCount("candidate-unrelated-session-test") === "1",
        "unrelated session did not become active",
      );
      await waitFor(
        () => activityCount("candidate-disable-reconciler-session-test") === "1",
        "reconciler session did not become active",
      );

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
      assert.equal(
        psql("GRANT foodsystems_candidate_worker TO candidate_gateway").status,
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
      await waitFor(
        () => activityCount("candidate-disable-session-test") === "0",
        "candidate session survived disable",
      );
      await waitFor(
        () => candidateSession.exitCode !== null,
        "candidate psql process did not observe termination",
      );
      await waitFor(
        () => activityCount("candidate-disable-reconciler-session-test") === "0",
        "reconciler session survived disable",
      );
      await waitFor(
        () => reconcilerSession.exitCode !== null,
        "reconciler psql process did not observe termination",
      );
      assert.equal(activityCount("candidate-unrelated-session-test"), "1");

      const disabled = psql(`
        SELECT
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."Document"', 'INSERT'),
          NOT has_any_column_privilege('foodsystems_candidate_reconciler', 'sidecar.unrelated', 'INSERT'),
          NOT EXISTS (
            SELECT 1 FROM pg_auth_members membership
            JOIN pg_roles granted ON granted.oid = membership.roleid
            WHERE granted.rolname IN ('foodsystems_candidate_worker', 'foodsystems_candidate_reconciler')
          );
      `);
      assert.equal(disabled.status, 0, disabled.stderr);
      assert.match(
        disabled.stdout,
        /t\s*\|\s*t\s*\|\s*t\s*\|\s*t\s*\|\s*t\s*\|\s*t\s*\|\s*t/,
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
      const cleanupUnrelated = psql(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE application_name = 'candidate-unrelated-session-test';
      `);
      assert.equal(cleanupUnrelated.status, 0, cleanupUnrelated.stderr);
      await waitFor(
        () => unrelatedSession.exitCode !== null,
        "unrelated psql process did not close after the test",
      );
      const reservedRoles = psql(
        "SELECT count(*) FROM pg_roles WHERE rolname IN ('review_operator', 'promotion_service')",
      );
      assert.equal(reservedRoles.status, 0, reservedRoles.stderr);
      assert.equal(reservedRoles.stdout.trim(), "0");
    });
  },
);

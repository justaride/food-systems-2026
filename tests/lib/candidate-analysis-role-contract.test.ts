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
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createServer, type Socket } from "node:net";
import { test } from "node:test";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import {
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisAssertionScopeHash,
  candidateAnalysisReconciliationPayloadHash,
  candidateAnalysisReconciliationScopeHash,
  candidateAnalysisRunScopeHash,
  type CandidateAssertionInput,
  type CandidateReconciliationSnapshotInput,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  createCandidateAnalysisWriter,
  createCandidateReconciliationWriter,
} from "../../src/lib/knowledge/candidate-analysis-writer";
import { candidateAnalysisFixture } from "../fixtures/candidate-analysis-fixture";
import {
  withCandidateAnalysisPostgres,
  type CandidateAnalysisPostgresContext,
} from "../helpers/candidate-analysis-postgres";

const repoRoot = process.cwd();
const bootstrapPath = resolve("scripts/bootstrap-candidate-analysis-roles.sh");
const disablePath = resolve("scripts/disable-candidate-analysis-writes.sh");
const enablePath = resolve("scripts/enable-candidate-analysis-logins.sh");
const verifyPath = resolve("scripts/verify-candidate-analysis-roles.sh");
const ambientGuardPath = resolve("scripts/reject-ambient-candidate-libpq-env.mjs");
const urlHelperPath = resolve("scripts/normalize-candidate-postgres-url.mjs");

function executable(path: string): boolean {
  return existsSync(path) && (statSync(path).mode & 0o111) !== 0;
}

function rolePrisma(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
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

type RecoveryFixture = {
  path: string;
  reconcilerUrl: string;
  workerUrl: string;
};

function prepareRecoveryFixture(
  context: CandidateAnalysisPostgresContext,
): RecoveryFixture {
  const { adminUrl, database, port, psql } = context;
  const setup = psql(`
    CREATE TABLE public."Document" (id text PRIMARY KEY);
    CREATE TABLE public."SourceDoc" (id text PRIMARY KEY);
    CREATE TABLE public."LibraryAnalysisRecord" (id text PRIMARY KEY);
    CREATE SCHEMA sidecar;
    REVOKE CREATE, TEMPORARY ON DATABASE ${database} FROM PUBLIC;
    REVOKE ALL PRIVILEGES ON SCHEMA public, sidecar FROM PUBLIC;
    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, sidecar FROM PUBLIC;
    REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public, sidecar FROM PUBLIC;
    REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public, sidecar FROM PUBLIC;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres
      REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
  `);
  assert.equal(setup.status, 0, setup.stderr);

  const path = postgresPath();
  const adminEnv = {
    ...process.env,
    PATH: path,
    DATABASE_ADMIN_URL: adminUrl,
  };
  const bootstrap = spawnSync(bootstrapPath, ["--apply"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: adminEnv,
  });
  assert.equal(bootstrap.status, 0, bootstrap.stderr);

  const workerPassword = "candidate-worker-recovery-test-password";
  const reconcilerPassword = "candidate-reconciler-recovery-test-password";
  const provision = psql(`
    ALTER ROLE foodsystems_candidate_worker PASSWORD '${workerPassword}';
    ALTER ROLE foodsystems_candidate_reconciler PASSWORD '${reconcilerPassword}';
  `);
  assert.equal(provision.status, 0, provision.stderr);

  return {
    path,
    workerUrl: `postgresql://foodsystems_candidate_worker:${workerPassword}@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-worker`,
    reconcilerUrl: `postgresql://foodsystems_candidate_reconciler:${reconcilerPassword}@127.0.0.1:${port}/${database}?application_name=foodsystems-candidate-reconciler`,
  };
}

function recoveryEnableEnv(
  fixture: RecoveryFixture,
  databaseAdminUrl: string,
  path = fixture.path,
): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: path,
    DATABASE_ADMIN_URL: databaseAdminUrl,
    CANDIDATE_WORKER_DATABASE_URL: fixture.workerUrl,
    CANDIDATE_RECONCILER_DATABASE_URL: fixture.reconcilerUrl,
  };
}

function activityCount(
  context: CandidateAnalysisPostgresContext,
  applicationName: string,
): string {
  const result = context.psql(
    `SELECT count(*) FROM pg_stat_activity WHERE application_name = '${applicationName}'`,
  );
  return result.status === 0 ? result.stdout.trim() : "error";
}

function candidateRowsSnapshot(
  context: CandidateAnalysisPostgresContext,
): string {
  const result = context.psql(`
    WITH candidate_snapshot(table_name, row_count, rows) AS (
      SELECT 'CandidateContentUnit', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateContentUnit" candidate_row
      UNION ALL
      SELECT 'CandidateAnalysisRun', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateAnalysisRun" candidate_row
      UNION ALL
      SELECT 'CandidateAnalysisRunInput', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateAnalysisRunInput" candidate_row
      UNION ALL
      SELECT 'CandidateAnalysisRunEvent', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateAnalysisRunEvent" candidate_row
      UNION ALL
      SELECT 'CandidateAnalysisArtifact', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateAnalysisArtifact" candidate_row
      UNION ALL
      SELECT 'CandidateAssertion', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateAssertion" candidate_row
      UNION ALL
      SELECT 'CandidateEvidenceLink', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateEvidenceLink" candidate_row
      UNION ALL
      SELECT 'CandidateDependency', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateDependency" candidate_row
      UNION ALL
      SELECT 'CandidateReconciliationSnapshot', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateReconciliationSnapshot" candidate_row
      UNION ALL
      SELECT 'CandidateHumanReviewDecision', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidateHumanReviewDecision" candidate_row
      UNION ALL
      SELECT 'CandidatePromotionDecision', count(*),
        COALESCE(jsonb_agg(to_jsonb(candidate_row) ORDER BY candidate_row.id), '[]')
      FROM public."CandidatePromotionDecision" candidate_row
    )
    SELECT jsonb_object_agg(
      table_name,
      jsonb_build_object('count', row_count, 'rows', rows)
      ORDER BY table_name
    )
    FROM candidate_snapshot;
  `);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function childExit(child: ChildProcess): Promise<number | null> {
  if (child.exitCode !== null) return Promise.resolve(child.exitCode);
  return new Promise((resolvePromise, rejectPromise) => {
    child.once("error", rejectPromise);
    child.once("exit", resolvePromise);
  });
}

function writeRecoveryRacePsql(
  tempRoot: string,
  context: CandidateAnalysisPostgresContext,
): {
  countFile: string;
  markerFile: string;
  mutationFile: string;
  path: string;
  realPsql: string;
  releaseFile: string;
} {
  const fakePsql = join(tempRoot, "psql");
  const countFile = join(tempRoot, "count");
  const markerFile = join(tempRoot, "second-psql-complete");
  const mutationFile = join(tempRoot, "mutation-complete");
  const releaseFile = join(tempRoot, "release");
  const realPsql = postgresPath().split(":")[0] + "/psql";
  writeFileSync(
    fakePsql,
    `#!/bin/sh
count=0
if [ -f "$RACE_COUNT_FILE" ]; then
  count=$(sed -n '1p' "$RACE_COUNT_FILE")
fi
count=$((count + 1))
printf '%s\n' "$count" > "$RACE_COUNT_FILE"
"$REAL_PSQL" "$@"
status=$?
if [ "$status" -eq 0 ] && [ "$count" -eq 1 ]; then
  "$REAL_PSQL" -X -q -h 127.0.0.1 -p "$RACE_PORT" -U postgres -d "$RACE_DATABASE" -v ON_ERROR_STOP=1 -c "$RACE_MUTATION_SQL" >/dev/null
  : > "$RACE_MUTATION_FILE"
fi
if [ "$status" -eq 0 ] && [ "$count" -eq 2 ]; then
  : > "$RACE_MARKER_FILE"
  deadline=200
  while [ ! -f "$RACE_RELEASE_FILE" ] && [ "$deadline" -gt 0 ]; do
    sleep 0.05
    deadline=$((deadline - 1))
  done
fi
exit "$status"
`,
  );
  chmodSync(fakePsql, 0o755);
  return {
    countFile,
    markerFile,
    mutationFile,
    releaseFile,
    path: `${tempRoot}:${postgresPath()}`,
    realPsql,
  };
}

test("candidate role scripts are explicit, credential-safe, and exact-allowlist", () => {
  const bootstrap = readFileSync(bootstrapPath, "utf8");
  const disable = readFileSync(disablePath, "utf8");
  const verify = readFileSync(verifyPath, "utf8");
  const ambientGuard = readFileSync(ambientGuardPath, "utf8");
  const urlHelper = readFileSync(urlHelperPath, "utf8");

  assert.ok(executable(bootstrapPath));
  assert.ok(executable(disablePath));
  assert.ok(executable(verifyPath));
  assert.ok(executable(ambientGuardPath));
  assert.ok(executable(urlHelperPath));
  for (const script of [bootstrap, disable, verify]) {
    assert.match(script, /^#!\/bin\/sh/);
    assert.match(script, /set -eu/);
    assert.match(script, /PGPASSFILE/);
    assert.match(script, /normalize-candidate-postgres-url\.mjs/);
    assert.match(script, /reject-ambient-candidate-libpq-env\.mjs/);
  }
  assert.match(ambientGuard, /\^PG\[A-Z0-9_\]\*\$/);
  assert.match(urlHelper, /allowedSearchParameters/);
  assert.match(urlHelper, /url\.password = ""/);
  assert.match(urlHelper, /unsupported database URL parameter/);

  assert.match(bootstrap, /refusing to change grants without --apply/);
  assert.match(
    bootstrap,
    /NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS/,
  );
  assert.match(bootstrap, /GRANT INSERT ON TABLE/);
  assert.doesNotMatch(bootstrap, /GRANT (?:ALL|UPDATE|DELETE|TRUNCATE)/);
  assert.doesNotMatch(bootstrap, /review_operator|promotion_service/);
  assert.match(bootstrap, /CREATE ROLE %I NOLOGIN/);
  assert.doesNotMatch(bootstrap, /CANDIDATE_(?:WORKER|RECONCILER)_DB_PASSWORD/);
  assert.doesNotMatch(bootstrap, /PASSWORD %L|Buffer\.from\([^\n]*password/i);
  assert.doesNotMatch(bootstrap, /REVOKE[^\n]*FROM PUBLIC/);
  assert.match(bootstrap, /incompatible PUBLIC or default ACL surface/i);

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
  assert.match(urlHelper, /url\.username/);
  assert.match(urlHelper, /allowedSearchParameters/);
  assert.match(verify, /pg_type/);

  assert.match(disable, /refusing to disable candidate writes without --apply/);
  assert.match(disable, /ALTER ROLE .* NOLOGIN/);
  assert.match(disable, /pg_terminate_backend/);
  assert.doesNotMatch(disable, /DROP (?:TABLE|ROLE)|DELETE FROM|TRUNCATE/);
});

test("candidate scripts sanitize malformed URLs and keep credentials out of role SQL", () => {
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
      },
    });
    assert.equal(safeBootstrap.status, 0, safeBootstrap.stderr);
    const invocation = readFileSync(invocationLog, "utf8");
    assert.doesNotMatch(invocation, /password-env-present/);
    assert.doesNotMatch(invocation, new RegExp(secret));

    for (const parameter of [
      "host",
      "port",
      "dbname",
      "user",
      "password",
      "passfile",
      "options",
      "service",
    ]) {
      const queryValue = encodeURIComponent(`${secret}-${parameter}`);
      const attempts = [
        {
          script: bootstrapPath,
          args: ["--apply"],
          env: {
            ...commonEnv,
            DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems?${parameter}=${queryValue}`,
          },
        },
        {
          script: disablePath,
          args: ["--apply"],
          env: {
            ...commonEnv,
            DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems?${parameter}=${queryValue}`,
          },
        },
        {
          script: verifyPath,
          args: ["--role=worker"],
          env: {
            ...commonEnv,
            CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-worker&${parameter}=${queryValue}`,
          },
        },
      ];
      for (const attempt of attempts) {
        const result = spawnSync(attempt.script, attempt.args, {
          cwd: repoRoot,
          encoding: "utf8",
          env: attempt.env,
        });
        assert.notEqual(result.status, 0, `${attempt.script} accepted ${parameter}`);
        assert.match(result.stderr, /unsupported database URL parameter/);
        assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
      }
    }

    for (const [script, args, urlEnvironment] of [
      [
        bootstrapPath,
        ["--apply"],
        { DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems` },
      ],
      [
        disablePath,
        ["--apply"],
        { DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems` },
      ],
      [
        verifyPath,
        ["--role=worker"],
        {
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-worker`,
        },
      ],
    ] as const) {
      const result = spawnSync(script, args, {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...commonEnv, ...urlEnvironment, PGHOST: "override.invalid" },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /PGHOST is not permitted/);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
    }

    for (const [script, args, urlEnvironment] of [
      [
        bootstrapPath,
        ["--apply"],
        { DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems` },
      ],
      [
        disablePath,
        ["--apply"],
        { DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems` },
      ],
      [
        verifyPath,
        ["--role=worker"],
        {
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-worker`,
        },
      ],
    ] as const) {
      const result = spawnSync(script, args, {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...commonEnv, ...urlEnvironment, PGREQUIREPEER: "attacker" },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /PGREQUIREPEER is not permitted/);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("candidate scripts reject PGSSLCERTMODE, PGGSSDELEGATION, and future libpq variables before psql", () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "candidate-role-ambient-libpq-"));
  const fakePsql = join(tempRoot, "psql");
  const invocationLog = join(tempRoot, "psql.log");
  writeFileSync(
    fakePsql,
    `#!/bin/sh
printf '%s\n' psql-invoked > "$FAKE_PSQL_LOG"
exit 0
`,
  );
  chmodSync(fakePsql, 0o755);

  try {
    const secret = "ambient-libpq-secret";
    const commonEnv = { ...process.env };
    for (const name of Object.keys(commonEnv)) {
      if (/^PG[A-Z0-9_]*$/.test(name)) delete commonEnv[name];
    }
    const attempts = [
      {
        script: bootstrapPath,
        args: ["--apply"],
        urlEnvironment: {
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems`,
        },
      },
      {
        script: disablePath,
        args: ["--apply"],
        urlEnvironment: {
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems`,
        },
      },
      {
        script: enablePath,
        args: ["--apply", "--confirm-existing-credentials"],
        urlEnvironment: {
          DATABASE_ADMIN_URL: `postgresql://admin:${secret}@example.invalid/foodsystems`,
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-worker`,
          CANDIDATE_RECONCILER_DATABASE_URL: `postgresql://foodsystems_candidate_reconciler:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-reconciler`,
        },
      },
      {
        script: verifyPath,
        args: ["--role=worker"],
        urlEnvironment: {
          CANDIDATE_WORKER_DATABASE_URL: `postgresql://foodsystems_candidate_worker:${secret}@example.invalid/foodsystems?application_name=foodsystems-candidate-worker`,
        },
      },
    ] as const;

    for (const variableName of [
      "PGSSLCERTMODE",
      "PGGSSDELEGATION",
      "PGFUTURECLIENTMODE",
    ] as const) {
      for (const attempt of attempts) {
        rmSync(invocationLog, { force: true });
        const result = spawnSync(attempt.script, attempt.args, {
          cwd: repoRoot,
          encoding: "utf8",
          env: {
            ...commonEnv,
            PATH: `${tempRoot}:${commonEnv.PATH ?? ""}`,
            FAKE_PSQL_LOG: invocationLog,
            ...attempt.urlEnvironment,
            [variableName]: "1",
          },
        });
        assert.notEqual(
          result.status,
          0,
          `${attempt.script} accepted ambient ${variableName}`,
        );
        assert.equal(
          existsSync(invocationLog),
          false,
          `${attempt.script} invoked psql before rejecting ${variableName}`,
        );
        assert.match(result.stderr, new RegExp(variableName));
        assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("explicit login recovery is guarded and has no credential mutation or logging path", () => {
  assert.ok(existsSync(enablePath), "explicit login recovery script is missing");
  const enable = readFileSync(enablePath, "utf8");

  assert.ok(executable(enablePath));
  assert.match(enable, /^#!\/bin\/sh/);
  assert.match(enable, /--apply --confirm-existing-credentials/);
  assert.match(enable, /reject-ambient-candidate-libpq-env\.mjs/);
  assert.match(enable, /normalize-candidate-postgres-url\.mjs/);
  assert.match(enable, /verify-candidate-analysis-roles\.sh/);
  assert.match(enable, /disable-candidate-analysis-writes\.sh/);
  assert.match(enable, /connected recovery administrator must be SUPERUSER/);
  assert.match(enable, /IN SHARE ROW EXCLUSIVE MODE/);
  for (const catalog of [
    "pg_authid",
    "pg_auth_members",
    "pg_namespace",
    "pg_class",
    "pg_proc",
    "pg_type",
  ]) {
    assert.match(enable, new RegExp(`pg_catalog\\.${catalog}`));
  }
  assert.match(enable, /pg_terminate_backend\(activity\.pid, 5000\)/);
  assert.doesNotMatch(enable, /\bCREATE ROLE\b/i);
  assert.doesNotMatch(enable, /\bALTER ROLE\b[^\n]*\bPASSWORD\b/i);
  assert.doesNotMatch(enable, /randomBytes|openssl\s+rand|uuidgen/i);
  assert.doesNotMatch(enable, /set -x/);
  assert.doesNotMatch(
    enable,
    /printf[^\n]*(?:DATABASE_ADMIN_URL|CANDIDATE_WORKER_DATABASE_URL|CANDIDATE_RECONCILER_DATABASE_URL)/,
  );
  for (const args of [
    [],
    ["--apply"],
    ["--confirm-existing-credentials", "--apply"],
    ["--apply", "--confirm-existing-credentials", "unexpected"],
  ]) {
    const result = spawnSync(enablePath, args, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /exactly --apply --confirm-existing-credentials is required/);
  }
});

test(
  "type-only owner preflight holds while candidate bootstrap preserves NOLOGIN, explicit login recovery succeeds, and failed login recovery disables both roles",
  { timeout: 60_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl, database, port, psql }) => {
      const setup = psql(`
        CREATE TABLE public."Document" (id text PRIMARY KEY);
        CREATE TABLE public."SourceDoc" (id text PRIMARY KEY);
        CREATE TABLE public."LibraryAnalysisRecord" (id text PRIMARY KEY);
        CREATE TABLE public."CanonicalOutsideAllowlist" (id text PRIMARY KEY);
        CREATE SCHEMA sidecar;
        CREATE TABLE sidecar.unrelated (id text PRIMARY KEY);
        INSERT INTO sidecar.unrelated (id) VALUES ('preserve-through-preflight');
        CREATE FUNCTION sidecar.unrelated_fn() RETURNS integer
          LANGUAGE sql AS $$ SELECT 1 $$;
        CREATE ROLE candidate_inherited_writer NOLOGIN;
        CREATE ROLE foodsystems_candidate_worker NOLOGIN;
        CREATE ROLE foodsystems_candidate_reconciler NOLOGIN;
        GRANT USAGE ON SCHEMA sidecar TO candidate_inherited_writer;
        GRANT INSERT ON sidecar.unrelated TO candidate_inherited_writer;
        GRANT candidate_inherited_writer TO foodsystems_candidate_worker;
        ALTER ROLE foodsystems_candidate_worker SET default_transaction_read_only TO 'on';
        GRANT INSERT ON public."CanonicalOutsideAllowlist" TO PUBLIC;
        ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sidecar
          GRANT SELECT ON TABLES TO PUBLIC;
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
      };

      const databaseState = () => psql(`
        WITH state_line(kind, identity, value) AS (
          SELECT 'role', auth.rolname,
            jsonb_build_object(
              'super', auth.rolsuper,
              'inherit', auth.rolinherit,
              'createRole', auth.rolcreaterole,
              'createDb', auth.rolcreatedb,
              'canLogin', auth.rolcanlogin,
              'replication', auth.rolreplication,
              'connectionLimit', auth.rolconnlimit,
              'password', auth.rolpassword,
              'bypassRls', auth.rolbypassrls
            )::text
          FROM pg_authid auth
          WHERE auth.rolname IN (
            'candidate_inherited_writer',
            'candidate_type_only_owner',
            'foodsystems_candidate_worker',
            'foodsystems_candidate_reconciler'
          )
          UNION ALL
          SELECT 'membership', granted.rolname || '->' || member.rolname,
            jsonb_build_object(
              'admin', membership.admin_option,
              'grantor', grantor.rolname
            )::text
          FROM pg_auth_members membership
          JOIN pg_roles granted ON granted.oid = membership.roleid
          JOIN pg_roles member ON member.oid = membership.member
          JOIN pg_roles grantor ON grantor.oid = membership.grantor
          WHERE granted.rolname LIKE 'foodsystems_candidate_%'
             OR member.rolname LIKE 'foodsystems_candidate_%'
          UNION ALL
          SELECT 'setting', role.rolname || '@' || settings.setdatabase::text,
            settings.setconfig::text
          FROM pg_db_role_setting settings
          JOIN pg_roles role ON role.oid = settings.setrole
          WHERE role.rolname LIKE 'foodsystems_candidate_%'
          UNION ALL
          SELECT 'database-acl', database.datname,
            COALESCE(database.datacl::text, '<null>')
          FROM pg_database database
          WHERE database.datname = current_database()
          UNION ALL
          SELECT 'schema-acl', namespace.nspname,
            COALESCE(namespace.nspacl::text, '<null>')
          FROM pg_namespace namespace
          WHERE namespace.nspname <> 'information_schema'
            AND namespace.nspname !~ '^pg_'
          UNION ALL
          SELECT 'relation-acl', namespace.nspname || '.' || class.relname,
            COALESCE(class.relacl::text, '<null>')
          FROM pg_class class
          JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
          WHERE namespace.nspname <> 'information_schema'
            AND namespace.nspname !~ '^pg_'
            AND class.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
          UNION ALL
          SELECT 'column-acl', namespace.nspname || '.' || class.relname || '.' || attribute.attname,
            attribute.attacl::text
          FROM pg_attribute attribute
          JOIN pg_class class ON class.oid = attribute.attrelid
          JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
          WHERE namespace.nspname <> 'information_schema'
            AND namespace.nspname !~ '^pg_'
            AND attribute.attnum > 0
            AND NOT attribute.attisdropped
            AND attribute.attacl IS NOT NULL
          UNION ALL
          SELECT 'routine-acl', namespace.nspname || '.' || procedure.oid::regprocedure::text,
            COALESCE(procedure.proacl::text, '<null>')
          FROM pg_proc procedure
          JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
          WHERE namespace.nspname <> 'information_schema'
            AND namespace.nspname !~ '^pg_'
          UNION ALL
          SELECT 'default-acl', owner.rolname || '@' ||
            COALESCE(namespace.nspname, '<global>') || ':' || defaults.defaclobjtype::text,
            defaults.defaclacl::text
          FROM pg_default_acl defaults
          JOIN pg_roles owner ON owner.oid = defaults.defaclrole
          LEFT JOIN pg_namespace namespace ON namespace.oid = defaults.defaclnamespace
          UNION ALL
          SELECT 'type-owner', namespace.nspname || '.' || type.typname,
            owner.rolname
          FROM pg_type type
          JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
          JOIN pg_roles owner ON owner.oid = type.typowner
          WHERE namespace.nspname <> 'information_schema'
            AND namespace.nspname !~ '^pg_'
          UNION ALL
          SELECT 'data', 'sidecar.unrelated',
            COALESCE(jsonb_agg(unrelated.id ORDER BY unrelated.id)::text, '[]')
          FROM sidecar.unrelated unrelated
          UNION ALL
          SELECT 'data', 'candidate-protected-row-counts',
            jsonb_build_object(
              'contentUnit', (SELECT count(*) FROM public."CandidateContentUnit"),
              'run', (SELECT count(*) FROM public."CandidateAnalysisRun"),
              'runInput', (SELECT count(*) FROM public."CandidateAnalysisRunInput"),
              'runEvent', (SELECT count(*) FROM public."CandidateAnalysisRunEvent"),
              'artifact', (SELECT count(*) FROM public."CandidateAnalysisArtifact"),
              'assertion', (SELECT count(*) FROM public."CandidateAssertion"),
              'evidenceLink', (SELECT count(*) FROM public."CandidateEvidenceLink"),
              'dependency', (SELECT count(*) FROM public."CandidateDependency"),
              'reconciliation', (SELECT count(*) FROM public."CandidateReconciliationSnapshot"),
              'humanReview', (SELECT count(*) FROM public."CandidateHumanReviewDecision"),
              'promotion', (SELECT count(*) FROM public."CandidatePromotionDecision")
            )::text
        )
        SELECT kind || '|' || identity || '|' || value
        FROM state_line
        ORDER BY kind, identity, value;
      `);

      const beforeBlockedBootstrap = databaseState();
      assert.equal(beforeBlockedBootstrap.status, 0, beforeBlockedBootstrap.stderr);
      const blockedBootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.notEqual(blockedBootstrap.status, 0);
      assert.match(blockedBootstrap.stderr, /incompatible PUBLIC or default ACL surface/i);
      const afterBlockedBootstrap = databaseState();
      assert.equal(afterBlockedBootstrap.status, 0, afterBlockedBootstrap.stderr);
      assert.equal(
        afterBlockedBootstrap.stdout,
        beforeBlockedBootstrap.stdout,
        "failed bootstrap changed roles, ACLs, default ACLs, or protected data",
      );

      const externalHardening = psql(`
        REVOKE CREATE, TEMPORARY ON DATABASE ${database} FROM PUBLIC;
        REVOKE ALL PRIVILEGES ON SCHEMA public, sidecar FROM PUBLIC;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, sidecar FROM PUBLIC;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public, sidecar FROM PUBLIC;
        REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public, sidecar FROM PUBLIC;
        ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sidecar
          REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC;
        ALTER DEFAULT PRIVILEGES FOR ROLE postgres
          REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
      `);
      assert.equal(externalHardening.status, 0, externalHardening.stderr);

      const typeOnlyOwnerSetup = psql(`
        CREATE ROLE candidate_type_only_owner NOLOGIN;
        CREATE TYPE sidecar.type_only_enum AS ENUM ('one');
        ALTER TYPE sidecar.type_only_enum OWNER TO candidate_type_only_owner;
      `);
      assert.equal(typeOnlyOwnerSetup.status, 0, typeOnlyOwnerSetup.stderr);
      const beforeTypeOnlyOwnerBootstrap = databaseState();
      assert.equal(
        beforeTypeOnlyOwnerBootstrap.status,
        0,
        beforeTypeOnlyOwnerBootstrap.stderr,
      );
      const typeOnlyOwnerBootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.notEqual(typeOnlyOwnerBootstrap.status, 0);
      assert.match(
        typeOnlyOwnerBootstrap.stderr,
        /incompatible PUBLIC or default ACL surface/i,
      );
      const afterTypeOnlyOwnerBootstrap = databaseState();
      assert.equal(
        afterTypeOnlyOwnerBootstrap.status,
        0,
        afterTypeOnlyOwnerBootstrap.stderr,
      );
      assert.equal(
        afterTypeOnlyOwnerBootstrap.stdout,
        beforeTypeOnlyOwnerBootstrap.stdout,
        "type-only owner preflight failure changed roles, ACLs, default ACLs, or protected rows",
      );
      const typeOnlyOwnerHardening = psql(`
        ALTER DEFAULT PRIVILEGES FOR ROLE candidate_type_only_owner
          REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
      `);
      assert.equal(
        typeOnlyOwnerHardening.status,
        0,
        typeOnlyOwnerHardening.stderr,
      );

      const bootstrap = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(bootstrap.status, 0, bootstrap.stderr);

      const provisionLogins = () => psql(`
        ALTER ROLE foodsystems_candidate_worker LOGIN PASSWORD '${workerPassword}';
        ALTER ROLE foodsystems_candidate_reconciler LOGIN PASSWORD '${reconcilerPassword}';
      `);
      const provisioned = provisionLogins();
      assert.equal(provisioned.status, 0, provisioned.stderr);

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

      const roleFixture = candidateAnalysisFixture({ runId: "run:role-api:1" });
      const adminPrisma = rolePrisma(adminUrl);
      try {
        await adminPrisma.candidateContentUnit.create({
          data: roleFixture.contentUnit,
        });
      } finally {
        await adminPrisma.$disconnect();
      }
      const workerPrisma = rolePrisma(workerUrl);
      try {
        const workerWriter = createCandidateAnalysisWriter(workerPrisma);
        await workerWriter.createRun(roleFixture.run);
        await workerWriter.appendRunEvent(roleFixture.events.started);
        await workerWriter.appendAssertion(roleFixture.assertion);
        const upstreamPayload: CandidateAssertionInput["payload"] = {
          namespace: "candidate",
          kind: "assertion",
          data: {
            entries: [
              {
                role: "proposition",
                valueType: "text",
                value: "Role-scoped dependency upstream.",
              },
            ],
          },
        };
        const upstream = {
          ...roleFixture.assertion,
          id: "assertion:role-api:upstream",
          payload: upstreamPayload,
          payloadHash: candidateAnalysisAssertionPayloadHash(upstreamPayload),
          scopeKey: "claim:role-api:upstream",
          scopeHash: candidateAnalysisAssertionScopeHash(
            "claim:role-api:upstream",
          ),
        };
        await workerWriter.appendAssertion(upstream);
        await workerWriter.appendDependency({
          id: "dependency:role-api:1",
          assertionId: roleFixture.assertion.id,
          upstreamAssertionId: upstream.id,
          relation: "derived_from",
          inheritedLimitations: [...upstream.limitations].sort(),
        });
      } finally {
        await workerPrisma.$disconnect();
      }
      const reconcilerPrisma = rolePrisma(reconcilerUrl);
      try {
        const scope = { runId: roleFixture.run.id };
        const payload: CandidateReconciliationSnapshotInput["payload"] = {
          namespace: "candidate",
          kind: "reconciliation",
          data: {
            entries: [
              {
                role: "contradiction",
                valueType: "flag",
                value: false,
              },
            ],
          },
        };
        await createCandidateReconciliationWriter(
          reconcilerPrisma,
        ).appendSnapshot({
          id: "snapshot:role-api:1",
          runId: roleFixture.run.id,
          scope,
          scopeHash: candidateAnalysisReconciliationScopeHash(scope),
          payload,
          payloadHash: candidateAnalysisReconciliationPayloadHash(payload),
          conflictCount: 0,
        });
      } finally {
        await reconcilerPrisma.$disconnect();
      }

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
        SELECT role_name, schema_name, relation_name, privilege_name,
          has_table_privilege(role_name, format('%I.%I', schema_name, relation_name), privilege_name)
        FROM unnest(ARRAY['foodsystems_candidate_worker', 'foodsystems_candidate_reconciler']) role_name
        CROSS JOIN (VALUES
          ('public', 'Document'), ('public', 'SourceDoc'),
          ('public', 'LibraryAnalysisRecord'),
          ('public', 'CandidateContentUnit'), ('public', 'CandidateAnalysisRun'),
          ('public', 'CandidateAnalysisRunInput'), ('public', 'CandidateAnalysisRunEvent'),
          ('public', 'CandidateAnalysisArtifact'), ('public', 'CandidateAssertion'),
          ('public', 'CandidateEvidenceLink'), ('public', 'CandidateDependency'),
          ('public', 'CandidateReconciliationSnapshot'),
          ('public', 'CandidateHumanReviewDecision'),
          ('public', 'CandidatePromotionDecision'),
          ('public', 'CanonicalOutsideAllowlist'), ('sidecar', 'unrelated')
        ) relation(schema_name, relation_name)
        CROSS JOIN unnest(ARRAY[
          'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
        ]) privilege_name
        ORDER BY role_name, relation_name, privilege_name;
      `);
      assert.equal(matrix.status, 0, matrix.stderr);
      const actualMatrix = new Map(
        matrix.stdout.trim().split("\n").map((line) => {
          const [role, schema, relation, privilege, value] = line.split("|");
          return [`${role}|${schema}|${relation}|${privilege}`, value === "t"];
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
              actualMatrix.get(`${role}|public|${relation}|${privilege}`),
              expected,
              `${role} ${privilege} public.${relation}`,
            );
          }
        }
      }
      const outsideRelations = [
        { schema: "public", relation: "CanonicalOutsideAllowlist" },
        { schema: "sidecar", relation: "unrelated" },
      ] as const;
      for (const role of [
        "foodsystems_candidate_worker",
        "foodsystems_candidate_reconciler",
      ] as const) {
        for (const { schema, relation } of outsideRelations) {
          for (const privilege of tablePrivileges) {
            assert.equal(
              actualMatrix.get(`${role}|${schema}|${relation}|${privilege}`),
              false,
              `${role} ${privilege} ${schema}.${relation}`,
            );
          }
        }
      }
      const columnMatrix = psql(`
        SELECT role_name, schema_name, relation_name, privilege_name,
          has_any_column_privilege(role_name, format('%I.%I', schema_name, relation_name), privilege_name)
        FROM unnest(ARRAY['foodsystems_candidate_worker', 'foodsystems_candidate_reconciler']) role_name
        CROSS JOIN (VALUES
          ('public', 'Document'), ('public', 'SourceDoc'),
          ('public', 'LibraryAnalysisRecord'),
          ('public', 'CandidateContentUnit'), ('public', 'CandidateAnalysisRun'),
          ('public', 'CandidateAnalysisRunInput'), ('public', 'CandidateAnalysisRunEvent'),
          ('public', 'CandidateAnalysisArtifact'), ('public', 'CandidateAssertion'),
          ('public', 'CandidateEvidenceLink'), ('public', 'CandidateDependency'),
          ('public', 'CandidateReconciliationSnapshot'),
          ('public', 'CandidateHumanReviewDecision'),
          ('public', 'CandidatePromotionDecision'),
          ('public', 'CanonicalOutsideAllowlist'), ('sidecar', 'unrelated')
        ) relation(schema_name, relation_name)
        CROSS JOIN unnest(ARRAY['INSERT', 'UPDATE', 'REFERENCES']) privilege_name
        ORDER BY role_name, relation_name, privilege_name;
      `);
      assert.equal(columnMatrix.status, 0, columnMatrix.stderr);
      const actualColumnMatrix = new Map(
        columnMatrix.stdout.trim().split("\n").map((line) => {
          const [role, schema, relation, privilege, value] = line.split("|");
          return [`${role}|${schema}|${relation}|${privilege}`, value === "t"];
        }),
      );
      for (const role of [
        "foodsystems_candidate_worker",
        "foodsystems_candidate_reconciler",
      ] as const) {
        for (const relation of [...canonicalTables, ...candidateTables]) {
          for (const privilege of ["INSERT", "UPDATE", "REFERENCES"] as const) {
            const expected = privilege === "INSERT"
              && (role === "foodsystems_candidate_worker"
                ? workerInsert.has(relation)
                : relation === "CandidateReconciliationSnapshot");
            assert.equal(
              actualColumnMatrix.get(`${role}|public|${relation}|${privilege}`),
              expected,
              `${role} column ${privilege} public.${relation}`,
            );
          }
        }
        for (const { schema, relation } of outsideRelations) {
          for (const privilege of ["INSERT", "UPDATE", "REFERENCES"] as const) {
            assert.equal(
              actualColumnMatrix.get(`${role}|${schema}|${relation}|${privilege}`),
              false,
              `${role} column ${privilege} ${schema}.${relation}`,
            );
          }
        }
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
      assert.match(gatewayAttempt.stderr, /unsupported database URL parameter: options/);
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

      const falseScopeRunId = "run:worker:false-scope";
      const falseScopeInsert = psql(`
        INSERT INTO public."CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${falseScopeRunId}', '${"f".repeat(64)}', 'workflow.candidate_analysis.v1', '1.0.0',
          'workflow.md', '${"0".repeat(64)}', 'prompt.candidate_analysis.v1', '1.0.0',
          'prompt.md', 'provider', 'model', 'version', '${"1".repeat(64)}', '{}',
          '${"2".repeat(64)}', '${"3".repeat(64)}', 'false worker scope', 'candidate_only',
          'worker:false-scope', '${"4".repeat(64)}', 1
        )
      `, "foodsystems_candidate_worker");
      assert.notEqual(
        falseScopeInsert.status,
        0,
        `worker inserted false run scope instead of ${candidateAnalysisRunScopeHash(falseScopeRunId)}`,
      );
      assert.match(falseScopeInsert.stderr, /invalid candidate run scope/);

      const hash = "a".repeat(64);
      const preservationRunId = "disable-preservation-run";
      const preservationRunScope = candidateAnalysisRunScopeHash(preservationRunId);
      const seeded = psql(`
        INSERT INTO public."CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${preservationRunId}', '${preservationRunScope}', 'candidate-analysis', 'v1',
          'knowledge/corpus/workflows/candidate-analysis-v1.md', '${hash}',
          'candidate-analysis-prompt', 'v1',
          'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md',
          'test', 'test-model', 'v1', '${hash}', '{}', '${hash}', '${hash}',
          'disable preservation',
          'candidate-only', 'test-worker', '${hash}', 1
        );
        INSERT INTO public."CandidateReconciliationSnapshot" (
          "id", "runId", "scope", "scopeHash", "payload", "payloadHash", "conflictCount"
        ) VALUES (
          'disable-preservation-snapshot', '${preservationRunId}', '{}',
          '${hash}',
          '{"namespace":"candidate","kind":"reconciliation","data":{"entries":[{"role":"contradiction","valueType":"flag","value":false}]}}',
          '${hash}', 0
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
      const bootstrapNoLogin = psql(`
        SELECT
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT');
      `);
      assert.equal(bootstrapNoLogin.status, 0, bootstrapNoLogin.stderr);
      assert.match(bootstrapNoLogin.stdout, /t\s*\|\s*t\s*\|\s*t\s*\|\s*t/);

      const explicitEnable = spawnSync(
        enablePath,
        ["--apply", "--confirm-existing-credentials"],
        {
          cwd: repoRoot,
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: path,
            DATABASE_ADMIN_URL: adminUrl,
            CANDIDATE_WORKER_DATABASE_URL: workerUrl,
            CANDIDATE_RECONCILER_DATABASE_URL: reconcilerUrl,
          },
        },
      );
      assert.equal(explicitEnable.status, 0, explicitEnable.stderr);
      assert.equal(verifyWorker().status, 0);
      assert.equal(verifyReconciler().status, 0);

      const disableBeforeFailedRecovery = spawnSync(disablePath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(
        disableBeforeFailedRecovery.status,
        0,
        disableBeforeFailedRecovery.stderr,
      );
      const bootstrapBeforeFailedRecovery = spawnSync(bootstrapPath, ["--apply"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: adminEnv,
      });
      assert.equal(
        bootstrapBeforeFailedRecovery.status,
        0,
        bootstrapBeforeFailedRecovery.stderr,
      );
      const beforeFailedRecoveryRows = psql(`
        SELECT jsonb_build_object(
          'contentUnit', (SELECT count(*) FROM public."CandidateContentUnit"),
          'run', (SELECT count(*) FROM public."CandidateAnalysisRun"),
          'runInput', (SELECT count(*) FROM public."CandidateAnalysisRunInput"),
          'runEvent', (SELECT count(*) FROM public."CandidateAnalysisRunEvent"),
          'artifact', (SELECT count(*) FROM public."CandidateAnalysisArtifact"),
          'assertion', (SELECT count(*) FROM public."CandidateAssertion"),
          'evidenceLink', (SELECT count(*) FROM public."CandidateEvidenceLink"),
          'dependency', (SELECT count(*) FROM public."CandidateDependency"),
          'reconciliation', (SELECT count(*) FROM public."CandidateReconciliationSnapshot"),
          'humanReview', (SELECT count(*) FROM public."CandidateHumanReviewDecision"),
          'promotion', (SELECT count(*) FROM public."CandidatePromotionDecision")
        );
      `);
      assert.equal(
        beforeFailedRecoveryRows.status,
        0,
        beforeFailedRecoveryRows.stderr,
      );

      const blackholeSockets = new Set<Socket>();
      const blackholeServer = createServer((socket) => {
        blackholeSockets.add(socket);
        socket.on("close", () => blackholeSockets.delete(socket));
      });
      await new Promise<void>((resolvePromise, rejectPromise) => {
        blackholeServer.once("error", rejectPromise);
        blackholeServer.listen(0, "127.0.0.1", resolvePromise);
      });
      const blackholeAddress = blackholeServer.address();
      assert.ok(blackholeAddress && typeof blackholeAddress !== "string");
      const wrongReconcilerUrl = `postgresql://foodsystems_candidate_reconciler:wrong-existing-credential@127.0.0.1:${blackholeAddress.port}/${database}?application_name=foodsystems-candidate-reconciler`;
      const failedEnable = spawn(
        enablePath,
        ["--apply", "--confirm-existing-credentials"],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            PATH: path,
            DATABASE_ADMIN_URL: adminUrl,
            CANDIDATE_WORKER_DATABASE_URL: workerUrl,
            CANDIDATE_RECONCILER_DATABASE_URL: wrongReconcilerUrl,
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let failedEnableOutput = "";
      failedEnable.stdout?.on("data", (chunk) => {
        failedEnableOutput += chunk.toString();
      });
      failedEnable.stderr?.on("data", (chunk) => {
        failedEnableOutput += chunk.toString();
      });
      await waitFor(() => {
        const loginState = psql(`
          SELECT bool_and(rolcanlogin)
          FROM pg_roles
          WHERE rolname IN ('foodsystems_candidate_worker', 'foodsystems_candidate_reconciler');
        `);
        return loginState.status === 0 && loginState.stdout.trim() === "t";
      }, "failed recovery never enabled the exact candidate logins");

      const failedRecoveryWorkerSession = spawn(
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
            PGAPPNAME: "candidate-failed-recovery-worker-session",
          },
          stdio: "ignore",
        },
      );
      const failedRecoveryReconcilerSession = spawn(
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
            PGAPPNAME: "candidate-failed-recovery-reconciler-session",
          },
          stdio: "ignore",
        },
      );
      await waitFor(
        () => activityCount("candidate-failed-recovery-worker-session") === "1",
        "worker session did not become active during failed recovery",
      );
      await waitFor(
        () => activityCount("candidate-failed-recovery-reconciler-session") === "1",
        "reconciler session did not become active during failed recovery",
      );
      for (const socket of blackholeSockets) socket.destroy();
      await new Promise<void>((resolvePromise) => blackholeServer.close(() => resolvePromise()));
      const failedEnableStatus = await new Promise<number | null>((resolvePromise, rejectPromise) => {
        failedEnable.once("error", rejectPromise);
        failedEnable.once("exit", (code) => resolvePromise(code));
      });
      assert.notEqual(failedEnableStatus, 0, failedEnableOutput);
      assert.doesNotMatch(failedEnableOutput, /wrong-existing-credential/);
      await waitFor(
        () => activityCount("candidate-failed-recovery-worker-session") === "0",
        "worker session survived failed recovery",
      );
      await waitFor(
        () => activityCount("candidate-failed-recovery-reconciler-session") === "0",
        "reconciler session survived failed recovery",
      );
      await waitFor(
        () => failedRecoveryWorkerSession.exitCode !== null,
        "worker psql did not observe failed-recovery termination",
      );
      await waitFor(
        () => failedRecoveryReconcilerSession.exitCode !== null,
        "reconciler psql did not observe failed-recovery termination",
      );
      const failedRecoveryState = psql(`
        SELECT
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          (SELECT NOT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT');
      `);
      assert.equal(failedRecoveryState.status, 0, failedRecoveryState.stderr);
      assert.match(failedRecoveryState.stdout, /t\s*\|\s*t\s*\|\s*t\s*\|\s*t/);
      const afterFailedRecoveryRows = psql(`
        SELECT jsonb_build_object(
          'contentUnit', (SELECT count(*) FROM public."CandidateContentUnit"),
          'run', (SELECT count(*) FROM public."CandidateAnalysisRun"),
          'runInput', (SELECT count(*) FROM public."CandidateAnalysisRunInput"),
          'runEvent', (SELECT count(*) FROM public."CandidateAnalysisRunEvent"),
          'artifact', (SELECT count(*) FROM public."CandidateAnalysisArtifact"),
          'assertion', (SELECT count(*) FROM public."CandidateAssertion"),
          'evidenceLink', (SELECT count(*) FROM public."CandidateEvidenceLink"),
          'dependency', (SELECT count(*) FROM public."CandidateDependency"),
          'reconciliation', (SELECT count(*) FROM public."CandidateReconciliationSnapshot"),
          'humanReview', (SELECT count(*) FROM public."CandidateHumanReviewDecision"),
          'promotion', (SELECT count(*) FROM public."CandidatePromotionDecision")
        );
      `);
      assert.equal(afterFailedRecoveryRows.status, 0, afterFailedRecoveryRows.stderr);
      assert.equal(
        afterFailedRecoveryRows.stdout.trim(),
        beforeFailedRecoveryRows.stdout.trim(),
      );
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

test(
  "enable preflight failure disables already-active unsafe candidate roles without deleting rows",
  { timeout: 30_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async (context) => {
      const { adminUrl, database, port, psql } = context;
      const fixture = prepareRecoveryFixture(context);
      const runId = "run:recovery-preflight-failure";
      const scopeHash = candidateAnalysisRunScopeHash(runId);
      const hash = "a".repeat(64);
      const setup = psql(`
        INSERT INTO public."CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${runId}', '${scopeHash}', 'candidate-analysis', 'v1', 'workflow.md', '${hash}',
          'candidate-analysis-prompt', 'v1', 'prompt.md', 'test', 'test-model', 'v1',
          '${hash}', '{}', '${hash}', '${hash}', 'preflight fail-safe preservation',
          'candidate-only', 'test-worker', '${hash}', 1
        );
        CREATE ROLE candidate_preflight_member NOLOGIN;
        CREATE TYPE sidecar.preflight_owned_enum AS ENUM ('one');
        ALTER ROLE foodsystems_candidate_worker LOGIN CREATEROLE;
        ALTER ROLE foodsystems_candidate_reconciler LOGIN;
        GRANT candidate_preflight_member TO foodsystems_candidate_worker;
        ALTER TYPE sidecar.preflight_owned_enum OWNER TO foodsystems_candidate_worker;
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const workerSession = spawn(
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
            PATH: fixture.path,
            PGAPPNAME: "candidate-enable-preflight-worker",
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
            PATH: fixture.path,
            PGAPPNAME: "candidate-enable-preflight-reconciler",
          },
          stdio: "ignore",
        },
      );
      await waitFor(
        () => activityCount(context, "candidate-enable-preflight-worker") === "1",
        "unsafe worker session did not become active",
      );
      await waitFor(
        () => activityCount(context, "candidate-enable-preflight-reconciler") === "1",
        "unsafe reconciler session did not become active",
      );

      const beforeRows = psql('SELECT count(*) FROM public."CandidateAnalysisRun"');
      assert.equal(beforeRows.status, 0, beforeRows.stderr);
      assert.equal(beforeRows.stdout.trim(), "1");
      const failedEnable = spawnSync(
        enablePath,
        ["--apply", "--confirm-existing-credentials"],
        {
          cwd: repoRoot,
          encoding: "utf8",
          env: recoveryEnableEnv(fixture, adminUrl),
        },
      );
      assert.notEqual(failedEnable.status, 0, failedEnable.stderr);
      const afterRows = psql('SELECT count(*) FROM public."CandidateAnalysisRun"');
      assert.equal(afterRows.status, 0, afterRows.stderr);
      assert.equal(afterRows.stdout.trim(), beforeRows.stdout.trim());

      const safeState = psql(`
        SELECT
          NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          NOT has_table_privilege('foodsystems_candidate_worker', 'public."CandidateAnalysisRun"', 'INSERT'),
          NOT has_table_privilege('foodsystems_candidate_reconciler', 'public."CandidateReconciliationSnapshot"', 'INSERT'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-preflight-worker'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-preflight-reconciler');
      `);
      assert.equal(safeState.status, 0, safeState.stderr);
      assert.equal(
        safeState.stdout.trim(),
        "t|t|t|t|0|0",
        "preflight failure did not establish NOLOGIN, revoke exact INSERT, and terminate exact sessions",
      );
      await Promise.all([childExit(workerSession), childExit(reconcilerSession)]);
    });
  },
);

test(
  "enable terminates stale candidate sessions before restoring both exact logins",
  { timeout: 30_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async (context) => {
      const { adminUrl, database, port, psql } = context;
      const fixture = prepareRecoveryFixture(context);
      const preservedFixture = candidateAnalysisFixture({
        contentUnitId: "content:stale-session-preservation:1",
      });
      const adminPrisma = rolePrisma(adminUrl);
      try {
        await adminPrisma.candidateContentUnit.create({
          data: preservedFixture.contentUnit,
        });
      } finally {
        await adminPrisma.$disconnect();
      }
      const beforeCandidateRows = candidateRowsSnapshot(context);
      const beforeCandidateSnapshot = JSON.parse(beforeCandidateRows) as Record<
        string,
        { count: number; rows: unknown[] }
      >;
      assert.deepEqual(
        Object.fromEntries(
          Object.entries(beforeCandidateSnapshot).map(([tableName, snapshot]) => [
            tableName,
            snapshot.count,
          ]),
        ),
        {
          CandidateAnalysisArtifact: 0,
          CandidateAnalysisRun: 0,
          CandidateAnalysisRunEvent: 0,
          CandidateAnalysisRunInput: 0,
          CandidateAssertion: 0,
          CandidateContentUnit: 1,
          CandidateDependency: 0,
          CandidateEvidenceLink: 0,
          CandidateHumanReviewDecision: 0,
          CandidatePromotionDecision: 0,
          CandidateReconciliationSnapshot: 0,
        },
      );
      const temporarilyEnabled = psql(`
        ALTER ROLE foodsystems_candidate_worker LOGIN;
        ALTER ROLE foodsystems_candidate_reconciler LOGIN;
      `);
      assert.equal(temporarilyEnabled.status, 0, temporarilyEnabled.stderr);

      const staleWorker = spawn(
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
            PATH: fixture.path,
            PGAPPNAME: "candidate-enable-stale-worker",
          },
          stdio: "ignore",
        },
      );
      const staleReconciler = spawn(
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
            PATH: fixture.path,
            PGAPPNAME: "candidate-enable-stale-reconciler",
          },
          stdio: "ignore",
        },
      );
      await waitFor(
        () => activityCount(context, "candidate-enable-stale-worker") === "1",
        "stale worker session did not become active",
      );
      await waitFor(
        () => activityCount(context, "candidate-enable-stale-reconciler") === "1",
        "stale reconciler session did not become active",
      );

      const disabledWithoutTermination = psql(`
        ALTER ROLE foodsystems_candidate_worker NOLOGIN;
        ALTER ROLE foodsystems_candidate_reconciler NOLOGIN;
      `);
      assert.equal(
        disabledWithoutTermination.status,
        0,
        disabledWithoutTermination.stderr,
      );
      const staleState = psql(`
        SELECT
          NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-stale-worker'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-stale-reconciler');
      `);
      assert.equal(staleState.status, 0, staleState.stderr);
      assert.equal(staleState.stdout.trim(), "t|t|1|1");

      const enable = spawnSync(
        enablePath,
        ["--apply", "--confirm-existing-credentials"],
        {
          cwd: repoRoot,
          encoding: "utf8",
          env: recoveryEnableEnv(fixture, adminUrl),
        },
      );
      assert.equal(enable.status, 0, `${enable.stdout}${enable.stderr}`);
      await Promise.all([childExit(staleWorker), childExit(staleReconciler)]);
      const enabledState = psql(`
        SELECT
          (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
          (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'foodsystems_candidate_reconciler'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-stale-worker'),
          (SELECT count(*) FROM pg_stat_activity WHERE application_name = 'candidate-enable-stale-reconciler');
      `);
      assert.equal(enabledState.status, 0, enabledState.stderr);
      assert.equal(enabledState.stdout.trim(), "t|t|0|0");
      const afterCandidateRows = candidateRowsSnapshot(context);
      assert.equal(
        afterCandidateRows,
        beforeCandidateRows,
        "stale-session recovery changed exact content or counts in the 11 candidate tables",
      );
    });
  },
);

test(
  "concurrent membership, elevated-attribute, and ownership drift cannot cross enable's activation boundary",
  { timeout: 30_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async (context) => {
      const { adminUrl, psql } = context;
      const fixture = prepareRecoveryFixture(context);
      const raceSetup = psql(`
        CREATE ROLE candidate_concurrent_member NOLOGIN;
        CREATE TYPE sidecar.concurrent_owned_enum AS ENUM ('one');
      `);
      assert.equal(raceSetup.status, 0, raceSetup.stderr);
      const tempRoot = mkdtempSync(join(tmpdir(), "candidate-enable-race-"));
      const race = writeRecoveryRacePsql(tempRoot, context);
      try {
        const enable = spawn(
          enablePath,
          ["--apply", "--confirm-existing-credentials"],
          {
            cwd: repoRoot,
            env: {
              ...recoveryEnableEnv(fixture, adminUrl, race.path),
              RACE_COUNT_FILE: race.countFile,
              RACE_DATABASE: context.database,
              RACE_MARKER_FILE: race.markerFile,
              RACE_MUTATION_FILE: race.mutationFile,
              RACE_MUTATION_SQL: `ALTER ROLE foodsystems_candidate_worker CREATEROLE;
                GRANT candidate_concurrent_member TO foodsystems_candidate_worker;
                ALTER TYPE sidecar.concurrent_owned_enum OWNER TO foodsystems_candidate_worker;`,
              RACE_PORT: String(context.port),
              RACE_RELEASE_FILE: race.releaseFile,
              REAL_PSQL: race.realPsql,
            },
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
        let output = "";
        enable.stdout?.on("data", (chunk) => {
          output += chunk.toString();
        });
        enable.stderr?.on("data", (chunk) => {
          output += chunk.toString();
        });
        const enableExit = childExit(enable);
        await waitFor(
          () => existsSync(race.markerFile) || enable.exitCode !== null,
          "concurrent enable neither exposed LOGIN nor rejected drift",
        );
        assert.ok(existsSync(race.mutationFile), "race mutation did not complete");
        const durableDrift = psql(`
          SELECT
            (SELECT rolcreaterole FROM pg_roles WHERE rolname = 'foodsystems_candidate_worker'),
            (SELECT owner.rolname = 'foodsystems_candidate_worker'
             FROM pg_type type JOIN pg_roles owner ON owner.oid = type.typowner
             WHERE type.oid = 'sidecar.concurrent_owned_enum'::regtype);
        `);
        assert.equal(durableDrift.status, 0, durableDrift.stderr);
        assert.equal(
          durableDrift.stdout.trim(),
          "t|t",
          "durable elevated-attribute/ownership race mutations did not land",
        );
        const exposedLogin = existsSync(race.markerFile);
        if (exposedLogin) {
          const loginState = psql(`
            SELECT bool_and(rolcanlogin)
            FROM pg_roles
            WHERE rolname IN ('foodsystems_candidate_worker', 'foodsystems_candidate_reconciler');
          `);
          assert.equal(loginState.status, 0, loginState.stderr);
          assert.equal(loginState.stdout.trim(), "t", "race marker preceded LOGIN commit");
          writeFileSync(race.releaseFile, "release\n");
        }
        const exitCode = await enableExit;
        assert.notEqual(exitCode, 0, output);
        assert.equal(
          exposedLogin,
          false,
          "concurrent unsafe role state crossed the enable preflight/LOGIN gap",
        );
      } finally {
        writeFileSync(race.releaseFile, "release\n");
        rmSync(tempRoot, { recursive: true, force: true });
      }
    });
  },
);

test(
  "CREATEROLE-only recovery admin cannot expose candidate LOGIN or let an active candidate transaction survive fallback",
  { timeout: 30_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async (context) => {
      const { database, port, psql } = context;
      const fixture = prepareRecoveryFixture(context);
      const adminSetup = psql(`
        CREATE ROLE candidate_recovery_admin LOGIN CREATEROLE;
        GRANT CONNECT ON DATABASE ${database} TO candidate_recovery_admin;
      `);
      assert.equal(adminSetup.status, 0, adminSetup.stderr);
      const recoveryAdminUrl = `postgresql://candidate_recovery_admin@127.0.0.1:${port}/${database}`;
      const runId = "run:createrole-survivor";
      const tempRoot = mkdtempSync(join(tmpdir(), "candidate-createrole-recovery-"));
      const race = writeRecoveryRacePsql(tempRoot, context);
      try {
        const enable = spawn(
          enablePath,
          ["--apply", "--confirm-existing-credentials"],
          {
            cwd: repoRoot,
            env: {
              ...recoveryEnableEnv(fixture, recoveryAdminUrl, race.path),
              RACE_COUNT_FILE: race.countFile,
              RACE_DATABASE: database,
              RACE_MARKER_FILE: race.markerFile,
              RACE_MUTATION_FILE: race.mutationFile,
              RACE_MUTATION_SQL: `GRANT foodsystems_candidate_worker, foodsystems_candidate_reconciler
                TO candidate_recovery_admin WITH ADMIN OPTION;`,
              RACE_PORT: String(port),
              RACE_RELEASE_FILE: race.releaseFile,
              REAL_PSQL: race.realPsql,
            },
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
        let output = "";
        enable.stdout?.on("data", (chunk) => {
          output += chunk.toString();
        });
        enable.stderr?.on("data", (chunk) => {
          output += chunk.toString();
        });
        const enableExit = childExit(enable);
        await waitFor(
          () => existsSync(race.markerFile) || enable.exitCode !== null,
          "CREATEROLE-only recovery neither exposed LOGIN nor failed closed",
        );
        const exposedLogin = existsSync(race.markerFile);
        let candidateTransaction: ChildProcess | null = null;
        if (exposedLogin) {
          const scopeHash = candidateAnalysisRunScopeHash(runId);
          const hash = "b".repeat(64);
          candidateTransaction = spawn(
            "psql",
            [
              "-X", "-h", "127.0.0.1", "-p", String(port),
              "-U", "foodsystems_candidate_worker", "-d", database,
              "-v", "ON_ERROR_STOP=1", "-c", `
                BEGIN;
                INSERT INTO public."CandidateAnalysisRun" (
                  "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
                  "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
                  "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
                  "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
                ) VALUES (
                  '${runId}', '${scopeHash}', 'candidate-analysis', 'v1', 'workflow.md', '${hash}',
                  'candidate-analysis-prompt', 'v1', 'prompt.md', 'test', 'test-model', 'v1',
                  '${hash}', '{}', '${hash}', '${hash}', 'survive failed fallback',
                  'candidate-only', 'test-worker', '${hash}', 1
                );
                SELECT pg_sleep(2);
                COMMIT;
              `,
            ],
            {
              cwd: repoRoot,
              env: {
                ...process.env,
                PATH: fixture.path,
                PGAPPNAME: "candidate-createrole-survivor-transaction",
              },
              stdio: "ignore",
            },
          );
          await waitFor(
            () => activityCount(context, "candidate-createrole-survivor-transaction") === "1",
            "candidate transaction did not become active after exposed LOGIN",
          );
          writeFileSync(race.releaseFile, "release\n");
        }
        const exitCode = await enableExit;
        assert.notEqual(exitCode, 0, output);
        assert.match(output, /connected recovery administrator must be SUPERUSER/);
        if (candidateTransaction) await childExit(candidateTransaction);
        const committed = psql(
          `SELECT count(*) FROM public."CandidateAnalysisRun" WHERE id = '${runId}'`,
        );
        assert.equal(committed.status, 0, committed.stderr);
        assert.equal(
          `${exposedLogin ? "LOGIN" : "NOLOGIN"}|${committed.stdout.trim()}`,
          "NOLOGIN|0",
          "CREATEROLE-only recovery exposed LOGIN and its failed fallback allowed a candidate transaction to commit",
        );
      } finally {
        writeFileSync(race.releaseFile, "release\n");
        rmSync(tempRoot, { recursive: true, force: true });
      }
    });
  },
);

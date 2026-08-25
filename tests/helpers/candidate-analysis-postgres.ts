import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  spawnSync,
  type SpawnSyncReturns,
} from "node:child_process";
import type { TestContext } from "node:test";

import { startEphemeralPostgres } from "./ephemeral-postgres";

export type CandidateAnalysisPostgresContext = {
  adminUrl: string;
  database: string;
  port: number;
  psql(sql: string, user?: string): SpawnSyncReturns<string>;
};

export type CandidateAnalysisPostgresOptions = {
  maxPreparedTransactions?: number;
};

function postgresBindir(): string | null {
  const configured = process.env.POSTGRES_BINDIR?.trim();
  if (configured) return configured;

  const result = spawnSync("pg_config", ["--bindir"], { encoding: "utf8" });
  return result.status === 0 && result.stdout.trim()
    ? result.stdout.trim()
    : null;
}

function commandError(
  command: string,
  result: SpawnSyncReturns<string>,
): Error {
  return new Error(
    `${command} failed with status ${String(result.status)}: ${result.stderr.trim()}`,
  );
}

export async function withCandidateAnalysisPostgres(
  t: TestContext,
  callback: (context: CandidateAnalysisPostgresContext) => Promise<void>,
  options: CandidateAnalysisPostgresOptions = {},
): Promise<void> {
  const bindir = postgresBindir();
  if (!bindir) {
    t.skip(
      "pg_config is unavailable; set POSTGRES_BINDIR to run candidate analysis PostgreSQL tests",
    );
    return;
  }

  const binaries = Object.fromEntries(
    ["initdb", "pg_ctl", "createdb", "psql"].map((name) => [
      name,
      join(bindir, name),
    ]),
  ) as Record<"initdb" | "pg_ctl" | "createdb" | "psql", string>;
  const missing = Object.entries(binaries)
    .filter(([, path]) => !existsSync(path))
    .map(([name]) => name);
  if (missing.length > 0) {
    t.skip(
      `PostgreSQL server binaries are unavailable (${missing.join(", ")}); set POSTGRES_BINDIR to run candidate analysis PostgreSQL tests`,
    );
    return;
  }

  const repoRoot = process.cwd();
  const tempRoot = mkdtempSync("/tmp/fs-candidate-pg-");
  const dataDir = join(tempRoot, "data");
  const socketDir = join(tempRoot, "socket");
  const database = "candidate_analysis_test";
  // Settes av oppstartsløkka, ikke her: porten som gjelder er den serveren
  // faktisk klarte å binde. `psql` under leser den ved kalltidspunkt.
  let port = 0;
  const processEnv: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: `${bindir}:${process.env.PATH ?? ""}`,
  };
  let started = false;

  const run = (binary: string, args: string[]) =>
    spawnSync(binary, args, {
      cwd: repoRoot,
      encoding: "utf8",
      env: processEnv,
    });
  const psql = (sql: string, user = "postgres") =>
    run(binaries.psql, [
      "-X",
      "-A",
      "-t",
      "-h",
      "127.0.0.1",
      "-p",
      String(port),
      "-U",
      user,
      "-d",
      database,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ]);

  try {
    const initialized = run(binaries.initdb, [
      "-A",
      "trust",
      "-U",
      "postgres",
      "-D",
      dataDir,
    ]);
    if (initialized.status !== 0) throw commandError("initdb", initialized);

    mkdirSync(socketDir);
    port = await startEphemeralPostgres({
      run,
      pgCtl: binaries.pg_ctl,
      dataDir,
      socketDir,
      logPathFor: (attempt) => join(tempRoot, `postgres-attempt-${attempt}.log`),
      extraServerOptions:
        options.maxPreparedTransactions === undefined
          ? []
          : [`-c max_prepared_transactions=${options.maxPreparedTransactions}`],
    });
    started = true;

    const adminUrl = `postgresql://postgres@127.0.0.1:${port}/${database}`;

    const created = run(binaries.createdb, [
      "-h",
      "127.0.0.1",
      "-p",
      String(port),
      "-U",
      "postgres",
      database,
    ]);
    if (created.status !== 0) throw commandError("createdb", created);

    const isolated = run(binaries.psql, [
      "-X",
      "-h",
      "127.0.0.1",
      "-p",
      String(port),
      "-U",
      "postgres",
      "-d",
      database,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `DO $isolation$
       DECLARE other_database record;
       BEGIN
         FOR other_database IN
           SELECT datname FROM pg_database
           WHERE datallowconn AND datname <> current_database()
         LOOP
           EXECUTE format(
             'REVOKE CONNECT ON DATABASE %I FROM PUBLIC',
             other_database.datname
           );
         END LOOP;
       END
       $isolation$`,
    ]);
    if (isolated.status !== 0) {
      throw commandError("candidate database isolation", isolated);
    }

    for (const migrationPath of [
      "prisma/migrations/20260818_candidate_analysis_foundation/migration.sql",
      "prisma/migrations/20260823_library_analysis_prompt_1_0_23/migration.sql",
      "prisma/migrations/20260823_zz_candidate_identifier_truncation/migration.sql",
    ]) {
      const migrated = run(binaries.psql, [
        "-X",
        "-h",
        "127.0.0.1",
        "-p",
        String(port),
        "-U",
        "postgres",
        "-d",
        database,
        "-v",
        "ON_ERROR_STOP=1",
        "-f",
        resolve(repoRoot, migrationPath),
      ]);
      if (migrated.status !== 0) {
        throw commandError(`candidate migration ${migrationPath}`, migrated);
      }
    }

    await callback({ adminUrl, database, port, psql });
  } finally {
    if (started) {
      run(binaries.pg_ctl, ["-D", dataDir, "-m", "fast", "-w", "stop"]);
    }
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

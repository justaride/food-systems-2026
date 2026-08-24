import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { createServer, type AddressInfo } from "node:net";
import { join, resolve } from "node:path";
import {
  spawnSync,
  type SpawnSyncReturns,
} from "node:child_process";
import type { TestContext } from "node:test";

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

/**
 * Låner en ledig port av kjernen. Reservasjonen kan ikke gjøres vanntett:
 * lytteren må lukkes før postgres kan binde porten, og fra lukkingen til
 * postmasterens bind() står porten fritt til å deles ut til noen andre.
 * Kalleren må derfor tåle at porten er opptatt — se oppstartsløkka under.
 */
async function reserveTcpPort(): Promise<number> {
  return await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      server.close((error) =>
        error ? reject(error) : resolvePort(address.port),
      );
    });
  });
}

/**
 * Nok forsøk til at racen forsvinner i praksis. Hvert forsøk låner en ny port,
 * så en kollisjon gjentar seg ikke — den koster ett tapt oppstartsforsøk.
 */
const MAX_START_ATTEMPTS = 5;

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
    const serverOptions = (chosenPort: number) =>
      [
        "-F",
        `-p ${chosenPort}`,
        `-k ${socketDir}`,
        // Bind bare IPv4, ikke initdb-standarden `localhost` (som er BÅDE
        // ::1 og 127.0.0.1). Med begge kan en halv kollisjon — noen andre
        // holder 127.0.0.1, ::1 er ledig — la postgres starte på ::1 og
        // returnere 0, mens alle klientene under kobler til 127.0.0.1 og
        // havner hos den andre prosessen. Det henger i stedet for å feile,
        // og retryen ser aldri en feil å reagere på. Bundet til én familie
        // blir enhver kollisjon en oppstartsfeil retryen fanger.
        "-c listen_addresses=127.0.0.1",
        ...(options.maxPreparedTransactions === undefined
          ? []
          : [`-c max_prepared_transactions=${options.maxPreparedTransactions}`]),
      ].join(" ");

    // Porten lånes her, rett før start — ikke sammen med resten av oppsettet.
    // Lå reservasjonen der, spente vinduet mellom lukket lytter og postgres'
    // bind() over hele initdb, altså sekunder der kjernen fritt kunne dele ut
    // porten til noen andre. `knowledge:candidate-contracts:check` kjører
    // tretten testfiler i én `node --test`, altså parallelt, så flere slike
    // vinduer overlapper i hver eneste kjøring.
    //
    // Resten tas av retry, for vinduet kan ikke lukkes helt: lytteren MÅ være
    // borte før postgres kan binde. En kollisjon er heller ikke en feil i
    // serveren — det er bare en annen port som er ledig.
    //
    // Målt 2026-08-24 (kjøring 32770422258): rødt på main med et tre som var
    // identisk med et grønt build. 253 av 257 tester passerte, og den ene
    // feilen var «could not bind ... port 41919 ... Address already in use».
    for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt += 1) {
      port = await reserveTcpPort();
      // Egen logg per forsøk. `pg_ctl -l` appender, så en delt logg ville latt
      // forrige forsøks kollisjon avgjøre om neste feil ble lest som en.
      const logPath = join(tempRoot, `postgres-attempt-${attempt}.log`);
      const start = run(binaries.pg_ctl, [
        "-D",
        dataDir,
        "-l",
        logPath,
        "-o",
        serverOptions(port),
        "-w",
        "start",
      ]);
      if (start.status === 0) {
        started = true;
        break;
      }

      const serverLog = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
      // Bare portkollisjon er verdt et nytt forsøk. En ødelagt datakatalog
      // eller en ugyldig serveropsjon blir ikke bedre av fem forsøk — den skal
      // opp med serverloggen med én gang, slik den gjorde før.
      if (
        attempt === MAX_START_ATTEMPTS ||
        !serverLog.includes("Address already in use")
      ) {
        throw new Error(`${commandError("pg_ctl start", start).message}\n${serverLog}`);
      }
    }

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

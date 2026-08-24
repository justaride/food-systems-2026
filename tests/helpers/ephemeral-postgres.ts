import { existsSync, readFileSync } from "node:fs";
import { createServer, type AddressInfo } from "node:net";
import type { SpawnSyncReturns } from "node:child_process";

/**
 * Låner en ledig port av kjernen. Reservasjonen kan ikke gjøres vanntett:
 * lytteren må lukkes før postgres kan binde porten, og fra lukkingen til
 * postmasterens bind() står porten fritt til å deles ut til noen andre.
 * Kalleren må derfor tåle at porten er opptatt — se startEphemeralPostgres.
 */
export async function reserveTcpPort(): Promise<number> {
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

export type StartEphemeralPostgresOptions = {
  /** Kallerens egen spawnSync-innpakning, med riktig cwd og PATH. */
  run: (binary: string, args: string[]) => SpawnSyncReturns<string>;
  pgCtl: string;
  dataDir: string;
  socketDir: string;
  /** Egen logg per forsøk — `pg_ctl -l` appender. */
  logPathFor: (attempt: number) => string;
  /** Ekstra `-c`-flagg, f.eks. `-c max_prepared_transactions=…`. */
  extraServerOptions?: readonly string[];
};

/**
 * Starter en kastbar postgres på en port den faktisk klarte å binde, og
 * returnerer den porten. Kalleren må lese porten herfra og ikke reservere
 * sin egen på forhånd.
 *
 * Racen dette lukker: `reserveTcpPort()` må lukke lytteren før pg_ctl kan
 * binde, så vinduet kan ikke fjernes — bare gjøres lite og tålt. Lå
 * reservasjonen sammen med resten av oppsettet, spente vinduet over hele
 * `initdb`, altså sekunder. Testfilene kjøres parallelt av `node --test`, så
 * flere slike vinduer overlapper i hver eneste kjøring.
 *
 * Målt 2026-08-24 (kjøring 32770422258): rødt på main med et tre som var
 * identisk med et grønt build. 253 av 257 tester passerte, og den ene feilen
 * var «could not bind ... port 41919 ... Address already in use».
 *
 * `listen_addresses` låses til 127.0.0.1 i stedet for initdb-standarden
 * `localhost` (som er BÅDE ::1 og 127.0.0.1). Med begge kan en halv kollisjon
 * — noen andre holder 127.0.0.1, ::1 er ledig — la postgres starte på ::1 og
 * returnere 0, mens klientene kobler til 127.0.0.1 og havner hos den andre
 * prosessen. Det henger i stedet for å feile, og retryen får aldri se en feil
 * å reagere på. Bundet til én familie blir enhver kollisjon en oppstartsfeil.
 * Alle kallstedene kobler allerede eksplisitt til 127.0.0.1.
 */
export async function startEphemeralPostgres({
  run,
  pgCtl,
  dataDir,
  socketDir,
  logPathFor,
  extraServerOptions = [],
}: StartEphemeralPostgresOptions): Promise<number> {
  let lastFailure = "";

  for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt += 1) {
    const port = await reserveTcpPort();
    const logPath = logPathFor(attempt);
    const start = run(pgCtl, [
      "-D",
      dataDir,
      "-l",
      logPath,
      "-o",
      [
        "-F",
        `-p ${port}`,
        `-k ${socketDir}`,
        "-c listen_addresses=127.0.0.1",
        ...extraServerOptions,
      ].join(" "),
      "-w",
      "start",
    ]);
    if (start.status === 0) return port;

    const serverLog = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
    lastFailure = `pg_ctl start failed with status ${String(start.status)}: ${start.stderr.trim()}\n${serverLog}`;
    // Bare portkollisjon er verdt et nytt forsøk. En ødelagt datakatalog eller
    // en ugyldig serveropsjon blir ikke bedre av fem forsøk — den skal opp med
    // serverloggen med én gang.
    if (!serverLog.includes("Address already in use")) {
      throw new Error(lastFailure);
    }
  }

  throw new Error(
    `pg_ctl start ga opp etter ${String(MAX_START_ATTEMPTS)} portforsøk.\n${lastFailure}`,
  );
}

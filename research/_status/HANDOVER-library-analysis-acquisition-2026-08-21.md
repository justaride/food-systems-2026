# Handover: automated-only library-analysis acquisition

**Dato:** 2026-08-21  
**Branch:** `codex/autonomous-ai-candidate-design`  
**Status:** Lokal implementasjon og bounded privat pilot er grønn. Full ekstern
acquisition, kandidatdatabase og modellkjøring er ikke autorisert eller kjørt.

## 1. Faktisk resultat

Pipeline fra forseglet populasjon til privat, hashbundet modellinput er nå
implementert:

```text
population -> acquisition plan -> controlled extraction -> resolution
           -> content-unit manifest -> cost envelope -> gated candidate intake
```

Piloten brukte en separat åtte-kilders population og plan. Seks kilder ble
klare, to ble blokkert, og `440` private content units ble verifisert. Hele den
private run-roten ble lest tilbake rekursivt. Resultatet forblir intern-only:

```text
automatedOnly=true
externalReady=false
candidateDatabaseWritten=false
productionDataMutated=false
networkScope=bounded_pilot
```

Den sanitiserte kvitteringen er
`research/_status/library-analysis-acquisition-pilot-2026-08-21.md`.

## 2. Verifiserte bindingshasher

- Full population: `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- Full plan: `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`
- Pilot selection: `280638c78891c3238089d6b50f0ccb2f78d808154eeb8fb7997e4a984b8d7a46`
- Pilot population: `82ab2f637658b5cf037e5b1febabdb3e45ea040ec043b45556b70b57650d5d6e`
- Pilot plan: `01e46e0d3879c981cf562ca3eb3dac13401ddf7db5dfeaf633f7ded800de1165`
- Pilot resolution: `5214062db288754e6f68457eb185ff503c34fd166a10221965fa32c9b3f53054`
- Content-unit manifest: `6bf62dc02ebff6b232bd209549e895d735a47ef60f574e7364847ee0720ac6e9`
- Cost envelope: `20bff045c769f19eeccfee6427bf1a9933f52313fe8b87d78c70c60dd1610907`
- Private inventory: `ba2aa3c379be47fde6e92f431e58bf8cf3fb98279d7388a88b74c9b872d7edc2`

Private paths, source identifiers, URLs and text finnes bare i mode-`0700/0400`
run-artifakter og er ikke gjengitt her.

## 3. Fullplanen som gjenstår

| Route | Rader | Nåværende fullplanstatus |
|---|---:|---|
| `database_document` | 1,534 | Implementert read-only route; ikke kjørt som full resolution |
| `controlled_https` | 70 | Bare to pilotvalg forsøkt; full nettverkskjøring ikke autorisert |
| `repository_csv` | 2 | Implementert; én pilotfil verifisert |
| `repository_pptx` | 1 | Implementert og pilotverifisert |
| `database_derived_record` | 2 | Implementert; én pilotpost verifisert |
| `superseded` | 17 | Terminal retained-history disposition |
| `unresolvable` | 1 | Terminal `missing_locator` inntil ny locator finnes |
| **Totalt** | **1,627** | Full resolution ikke forseglet |

Pilotens `6 ready / 2 blocked` må ikke presenteres som fullkorpusstatus.

## 4. Reproduserbare kommandoer

Kjør fra repository-roten. Sett private operatørstier lokalt; ikke legg
database-URL eller andre secrets på kommandolinjen.

```bash
LIBRARY_FULL_SNAPSHOT='<private absolute snapshot path>'
LIBRARY_FULL_PLAN='<private absolute full-plan path>'
LIBRARY_RUN_ROOT='<new private absolute run root>'
LIBRARY_ENV_FILE='<absolute path to operator-owned dotenv file>'
```

Planlegging bruker source-databasen i `REPEATABLE READ` og setter transaksjonen
read-only:

```bash
node --env-file="$LIBRARY_ENV_FILE" --import=tsx \
  scripts/knowledge/plan-library-analysis-acquisition.ts \
  --snapshot="$LIBRARY_FULL_SNAPSHOT" \
  --output="$LIBRARY_FULL_PLAN"
```

Sideeffektfri kontroll:

```bash
node --import=tsx scripts/knowledge/execute-library-analysis-acquisition.ts \
  --plan="$LIBRARY_FULL_PLAN" \
  --run-root="$LIBRARY_RUN_ROOT" \
  --check-only
```

Network execution må først autoriseres på et eksplisitt, hashbundet scope. Den
skal ikke kjøres mot fullplanen direkte før en bounded batch-selector og
budsjett/stoppgrense er godkjent:

```bash
node --env-file="$LIBRARY_ENV_FILE" --import=tsx \
  scripts/knowledge/execute-library-analysis-acquisition.ts \
  --plan='<authorized bounded plan path>' \
  --run-root="$LIBRARY_RUN_ROOT" \
  --execute-network
```

Private emit krever ingen databasevariabel:

```bash
node --import=tsx scripts/knowledge/emit-library-analysis-content-units.ts \
  --snapshot='<bounded population path>' \
  --plan='<bounded plan path>' \
  --run-root="$LIBRARY_RUN_ROOT" \
  --output="$LIBRARY_RUN_ROOT/manifests/private-emit.v1.json"
```

Kandidatintak er en separat gate. Kommandoen krever
`CANDIDATE_INTAKE_DATABASE_URL`, matching resolution chain og private unit-
readback. Den skal ikke kjøres før migrasjon, backup/restore, rolle og writer-
attestasjon er godkjent.

## 5. Retry, resume og stopplinjer

- `429` og `5xx` retryes maksimalt tre ganger med `1s` og `4s` backoff;
  integer `Retry-After` er capped til `30s`.
- `401`, `403`, `404` og `410` retryes ikke. Alternate locator brukes bare
  etter not-found.
- Redirect til HTTP, credentials/fragment, mer enn fem hopp, over `100 MiB`,
  MIME-/schemafeil, symlink, path escape og hashdrift stopper berørt kilde.
- Private writes er exclusive og sealed. En avbrutt eller delvis kjøring skal
  ikke overskrives. Bruk en ny run-root og behold forrige rot som evidens.
- Et execution-checkpoint er komplett først når koordinatoren har avsluttet.
  Manglende slutt-checkpoint er ikke en komplett resolution.
- Ingen feilbane skal logge raw bytes, extracted text, database-URL eller token.

## 6. Verifikasjon ved handover

- Library-analysis/private-store: `260` tester bestått, `0` feilet.
- TypeScript: `npx tsc --noEmit` exit `0`.
- Targeted ESLint: exit `0`.
- Research-artifact audit: `5,797` tracked files, `0` violations.
- Piloten re-verifiserte `468` private filer og `440` unit-payloads.

Den brede `npm test`-baselinen har fortsatt den tidligere dokumenterte,
scope-uavhengige corpus-health-feilen: tracked Prisma-schemahash matcher ikke
candidate-branchens faktiske schemahash. Den ble ikke omskrevet som del av
dette arbeidet.

## 7. Neste beslutning

Anbefalt rekkefølge:

1. Autoriser utvikling og kjøring av full acquisition i små, hashbundne
   nettverksbatcher med samlet cost/stop-envelope.
2. Forsegl én komplett resolution for alle `1,627` rader.
3. Vurder deretter kandidatdatabase-migrasjon, backup/restore, rolleaktivering
   og attested intake.
4. Velg modellprovider og eksplisitt budsjett før analyse + separat validering.

Ikke push, åpne PR, merge, migrer, aktiver roller, deploy, kjør full ekstern
acquisition eller start betalt modellkjøring uten ny eksplisitt autorisasjon.

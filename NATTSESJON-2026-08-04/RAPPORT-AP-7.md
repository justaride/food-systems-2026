# Rapport AP-7: Live databaseverifisering

**Status:** DELVIS — steg 1–3 grønne etter runtime-reverifikasjon; steg 4 blokkert av stale source-registration-pinne
**Agent:** Codex / GPT-5
**Tidsrom:** 2026-08-04, nattkjøring (CEST)
**Gren / worktree:** `codex/nordic-knowledge-canonical-v1`, kun lesing
**Commits laget:** ingen

## 1. Hva som ble gjort

AP-7 steg 1–3 ble kjørt read-only mot den lokale databasen. Etter at de
gitignorerte private røttene var tilgjengelige, ble steg 4 (`--plan-only`)
forsøkt med maskert output. Trusted-runtime-attestasjonen passerte, men planen
stoppet fail-closed fordi den låste source-registration-batchen forventer en
eldre hash for `source-analysis-input-generation-manifest.v1.json`.

Ingen `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, Prisma-mutasjon, migrasjon, `--apply`, `--rehearse-logical-clone`, `migrate deploy`, `db push` eller `db seed` ble kjørt. I selve AP-7-kjøringen ble ingen prosjektfiler utenfor de to forespurte rapportene endret.

For å tilfredsstille trusted-runtime-kontrakten ble de eksisterende, ignorerte
`node_modules`- og Prisma-generated-trærne flyttet bytebevarende til en
midlertidig ekstern runtime-rot og symlinket tilbake. Dette endret ingen
sporede filer, kode, database eller korpusartefakter.

## 2. Kommandoer og resultat

### Steg 1 — databaseidentitet

Read-only-spørringene fra arbeidspakken ble kjørt mot `localhost:5432/foodsystems`:

```sql
SELECT current_database(), current_user, version();
SELECT system_identifier FROM pg_control_system();
SHOW server_version_num;
SELECT inet_server_addr(), inet_server_port();
```

Resultat:

```text
foodsystems|foodsystems|PostgreSQL 16.13 (Homebrew) on aarch64-apple-darwin25.2.0, compiled by Apple clang version 17.0.0 (clang-1700.6.3.2), 64-bit
7620055716543368057
160013
127.0.0.1|5432
```

Databaseidentiteten, systemidentifikatoren, serverversjonen og adresse/port samsvarer med den sealede måldefinisjonen. `current_user` er `foodsystems`.

### Steg 2 — skriptbaserte kontroller

#### `npm run knowledge:health:check`

Før runtime-layouten ble reparert, returnerte kontrollen exit code `1` med
melding om at den immutable snapshot-set-en hadde annet innhold. Etter at de
ignorerte runtime-trærne var satt tilbake som eksterne symlinker, ble samme
read-only-kontroll kjørt på nytt og passerte:

```text
> food-systems-2026@1.0.0 knowledge:health:check
> tsx scripts/knowledge/generate-corpus-health.ts --check

knowledge:health:check ok (6 immutable assessment(s))
```

Databasen ble ikke endret mellom forsøkene; den read-only database-snapshoten
har samme kjernetellinger og samme resultathash som den låste health-
snapshoten. F9 er derfor lukket som en runtime-/arbeidskopireproduksjonsfeil
for denne kontrollen, med forbehold om at health-generatoren fortsatt må kjøres
med den kontraktsmessige runtime-layouten.

#### `npm run knowledge:library-history:check`

Exit code: `0`.

```json
{
  "ok": true,
  "contractVersion": "2026-07-28-v1",
  "contractSha256": "8cc74813bb3bac1434d07f8a5333d20b0136d955cf69c2b36acb3de8b24f03c4",
  "pinnedContractSha256": "8cc74813bb3bac1434d07f8a5333d20b0136d955cf69c2b36acb3de8b24f03c4",
  "databaseTransaction": {
    "isolationLevel": "repeatable_read",
    "readOnly": true
  },
  "identityPartition": {
    "contractRows": 17,
    "currentInventoryRows": 1555,
    "persistedRows": 1572,
    "livePersistedRows": 1555,
    "retainedHistoryRows": 17,
    "inventoryOnlyRows": 0,
    "missingCounterpartRows": 0
  },
  "projectionFreshness": {
    "contractBoundary": "separate",
    "materialUpdateCount": 15,
    "observedAtReview": 15,
    "matchesReviewObservation": true,
    "noopCount": 1540
  },
  "managedRuntimeSourceDocs": {
    "contractBoundary": "separate",
    "retainedIntersectionCount": 0
  }
}
```

#### `npm run knowledge:corpus:check:live`

Exit code: `0`.

```text
Corpus processing verified: active=1555; retained-history=17 non-additive; missing-files=29; full-text-units=1467; owner-review=1555
{"mode":"live_inventory_snapshot_checked","liveDatabaseVerifiedThisRun":true,"databaseMutationAllowed":false,"activeRows":1555,"sourceKindCounts":{"document":1534,"library_file":3,"report":6,"source_doc":11,"thesis":1},"identityContentSetSha256":"54b9cbd2f8fdca27845f27490155f556db6371f9a96f6445a90fd1cfe0c179cf","ledgerSha256":"3f10532176b85adcc8d2d0f36009bb821893003637eada5de8cf89f0f349ec70","parityFailures":0}
```

#### `npm run db:check-drift`

Den rå Prisma-kontrollen viser de samme fire `search_vector`-forskjellene i
`Document`, `Insight`, `Report` og `Thesis`. Dette er den forventede forskjellen
som oppstår fordi GENERATED tsvector-defaults og GIN-indekser håndteres via rå
SQL og ikke kan modelleres fullt ut av Prisma.

Den repository-spesifikke, strengere kontrollen ble kjørt etterpå:

```text
> food-systems-2026@1.0.0 db:check-drift
> prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma

Loaded Prisma config from prisma.config.ts.


[*] Changed the `Document` table
  [-] Removed index on columns (search_vector)
  [*] Altered column `search_vector` (default changed from `Some(DbGenerated(Some("(((setweight(immutable_to_tsvector_no(title), 'A'::\"char\") || setweight(immutable_to_tsvector_no(summary), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(content), 'C'::\"char\"))")))` to `None`)

[*] Changed the `Insight` table
  [-] Removed index on columns (search_vector)
  [*] Altered column `search_vector` (default changed from `Some(DbGenerated(Some("((setweight(immutable_to_tsvector_no(title), 'A'::\"char\") || setweight(immutable_to_tsvector_no(description), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B'::\"char\"))")))` to `None`)

[*] Changed the `Report` table
  [-] Removed index on columns (search_vector)
  [*] Altered column `search_vector` (default changed from `Some(DbGenerated(Some("(((((setweight(immutable_to_tsvector_no(title), 'A'::\"char\") || setweight(immutable_to_tsvector_no(\"fullTitle\"), 'A'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(\"keyFindings\")), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(recommendations)), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(relevance), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B'::\"char\"))")))` to `None`)

[*] Changed the `Thesis` table
  [-] Removed index on columns (search_vector)
  [*] Altered column `search_vector` (default changed from `Some(DbGenerated(Some("(((((setweight(immutable_to_tsvector_no(title), 'A'::\"char\") || setweight(immutable_to_tsvector_no(\"titleNo\"), 'A'::\"char\")) || setweight(immutable_to_tsvector_no(synthesis), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(\"keyFindings\")), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(takeaways)), 'B'::\"char\")) || setweight(immutable_to_tsvector_no(immutable_array_to_string(tags)), 'B'::\"char\"))")))` to `None`)
```

```text
[schema-drift] PASS: only a documented generated-FTS Prisma diff remains
```

F8 er dermed lukket som forventet, dokumentert Prisma-unsupported drift; det
ble ikke kjørt noen schema- eller databaseendring.

### Steg 3 — kjernetellinger

Følgende ble kjørt i én `REPEATABLE READ READ ONLY`-transaksjon:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT 'Document' AS relasjon, count(*) FROM "Document"
UNION ALL SELECT 'LibraryAnalysisRecord', count(*) FROM "LibraryAnalysisRecord"
UNION ALL SELECT 'ControlledMutationAudit', count(*) FROM "ControlledMutationAudit";
SELECT count(*) FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p','m');
COMMIT;
```

Resultat:

```text
BEGIN
relasjon|count
Document|1539
LibraryAnalysisRecord|1572
ControlledMutationAudit|0
(3 rows)
relasjon|count
public_data_relations|56
(1 row)
COMMIT
```

### Steg 4 — låst plan

`--plan-only` ble forsøkt etter at runtime-trærne var kontrollert som eksterne
symlinker og trusted-runtime-attestasjonen passerte. Kommandoen avsluttet med
exit code `1`:

```text
Source-registration dry run failed: knowledge/corpus/source-analysis-input-manifests/source-analysis-input-generation-manifest.v1.json differs from the exact source-registration batch pin
```

Den låste planen forventer filhash
`897f3599585ed8cb1fb73749df28e944b38d283805ee981499ef440d89f06803`; den
sporede filen i canonical har hash
`631ad900849a9951a3e5471b35e28f8905b8c8607f9a0491deacb59f316c455d` og samme
størrelse `14394` bytes. Read-only file history viser at manifestet ble endret
i `006986f` etter at den låste planen ble laget. Diffen oppdaterer bindingene
til `source-analysis-input-manifest.schema.v1.json`,
`pdf-page-extraction-qualification.ts` og
`source-analysis-input-manifest.ts`, samt manifestets egen self-hash. Ingen
regenerering eller planendring er gjort.

## 3. Verifikasjon

- Databaseidentitet, systemidentifikator, serverversjon og adresse/port: innfridd.
- Bibliotekshistorikk: innfridd; output bekrefter `repeatable_read` og `readOnly: true`.
- Live korpusparitet: innfridd med `parityFailures: 0`.
- Kjernetellinger: innfridd; de tre forventede verdiene er bekreftet.
- `ControlledMutationAudit`: innfridd med verdi `0`.
- Offentlige datarelasjoner: innfridd med verdi `56`.
- Korpushelse: innfridd etter runtime-reverifikasjon; `6 immutable assessment(s)`.
- Schema-drift: innfridd mot prosjektets FTS-aware verifier; bare dokumentert
  GENERATED/GIN-drift gjenstår.
- Låst `--plan-only`: forsøkt med private røtter og maskert output; blokkert av
  stale manifest-pin før øvrige plan-gater kunne vurderes.
- Skriveadgang: ingen databaseskriving utført eller forsøkt.

## 4. Hva som gjenstår

1. Regenerer eller erstatt den låste source-registration-planen gjennom en
   separat kontrollert planprosess etter at manifest-pin-driften er vurdert.
2. Eier må fortsatt avgjøre Nord-rettigheter/restore og eventuell formell
   rollekvittering.

## 5. Beslutninger Gabriel må ta

1. **Stale plan-pin:** Velg om den gamle planen skal beholdes som blokkert
   historisk referanse, eller om en ny plan skal genereres mot manifestet fra
   `006986f`. Anbefaling: ikke endre den gamle planen i denne sesjonen; lag en
   ny, eksplisitt plan etter at snapshot- og schema-avvikene er avklart.

## 6. Risiko og forbehold

- De grønne identitets- og tellingstestene viser at den observerte kjernetilstanden matcher forventningene, men de beviser ikke at alle databaseobjekter er uendret siden 3. august.
- Den rå Prisma-diffen er fortsatt synlig; den strengere repository-verifieren
  godkjenner den kun fordi den samsvarer med det dokumenterte FTS-kontrakts-
  avviket.
- Health-kontrollen må fortsatt kjøres med ekstern/symlinket runtime-layout;
  en vanlig kataloglayout reproducerte det tidligere snapshot-feilsignalet.
- `--plan-only` og dermed planens private korpus-/innholdsgater er ikke verifisert.
- Ingen DATABASE_URL-verdi, private absolutte stier eller nøkkelmateriale er skrevet i rapporten.

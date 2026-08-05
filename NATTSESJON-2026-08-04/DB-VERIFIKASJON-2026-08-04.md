# DB-verifikasjon — 2026-08-04

## Kort konklusjon

Databaseidentiteten og kjernetellingene samsvarer med den låste planen, og `ControlledMutationAudit` er `0`. Etter runtime-reverifikasjon er `knowledge:health:check` grønn, og den strengere schema-drift-verifieren godkjenner de fire dokumenterte GENERATED-FTS-forskjellene. Den låste `--plan-only`-kontrollen stopper fortsatt fail-closed på en stale source-analysis-manifest-pin.

**Svar på spørsmålet om databasen har flyttet seg siden 3. august:** Ikke påvist i identitet, kjernetellinger eller read-only health-resultathash. Fullstendig release-/apply-klarhet kan likevel ikke bekreftes før stale plan-pin er håndtert.

## Påstand mot observasjon

| Påstand | Forventet | Observert | Dom |
|---|---:|---:|---|
| Database | `foodsystems` | `foodsystems` | ✅ |
| Systemidentifikator | `7620055716543368057` | `7620055716543368057` | ✅ |
| Serverversjon | `160013` | `160013` | ✅ |
| Adresse / port | `127.0.0.1` / `5432` | `127.0.0.1` / `5432` | ✅ |
| `Document` | `1539` | `1539` | ✅ |
| `LibraryAnalysisRecord` | `1572` | `1572` | ✅ |
| `ControlledMutationAudit` | `0` | `0` | ✅ |
| Offentlige datarelasjoner | `56` | `56` | ✅ |
| `knowledge:health:check` | grønn kontroll | `knowledge:health:check ok (6 immutable assessment(s))` etter runtime-reverifikasjon | ✅ |
| `knowledge:library-history:check` | grønn read-only-kontroll | `ok: true`; repeatable read; read-only | ✅ |
| `knowledge:corpus:check:live` | grønn live-paritet | `parityFailures: 0`; `activeRows: 1555` | ✅ |
| `db:check-drift` | ingen ukjent schema-drift | rå Prisma-diff viser kun dokumentert GENERATED-FTS-drift; streng verifier passerer | ✅ med kjent kontraktsavvik |
| Låst `--plan-only` | kjørt read-only | forsøkt; blokkert av manifest-pin før øvrige plan-gater | ⚠️ |

## Kontrollresultater

### Databaseidentitet

```text
foodsystems|foodsystems|PostgreSQL 16.13 (Homebrew) on aarch64-apple-darwin25.2.0, compiled by Apple clang version 17.0.0 (clang-1700.6.3.2), 64-bit
7620055716543368057
160013
127.0.0.1|5432
```

`current_user` var `foodsystems`.

### Korpus- og historikkontroller

`knowledge:health:check` passerte etter at canonical runtime-layouten ble
reverifisert som eksterne symlinker:

```text
knowledge:health:check ok (6 immutable assessment(s))
```

`knowledge:library-history:check` rapporterte:

```json
{
  "ok": true,
  "contractVersion": "2026-07-28-v1",
  "contractSha256": "8cc74813bb3bac1434d07f8a5333d20b0136d955cf69c2b36acb3de8b24f03c4",
  "pinnedContractSha256": "8cc74813bb3bac1434d07f8a5333d20b0136d955cf69c2b36acb3de8b24f03c4",
  "databaseTransaction": { "isolationLevel": "repeatable_read", "readOnly": true },
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

`knowledge:corpus:check:live` rapporterte:

```text
Corpus processing verified: active=1555; retained-history=17 non-additive; missing-files=29; full-text-units=1467; owner-review=1555
{"mode":"live_inventory_snapshot_checked","liveDatabaseVerifiedThisRun":true,"databaseMutationAllowed":false,"activeRows":1555,"sourceKindCounts":{"document":1534,"library_file":3,"report":6,"source_doc":11,"thesis":1},"identityContentSetSha256":"54b9cbd2f8fdca27845f27490155f556db6371f9a96f6445a90fd1cfe0c179cf","ledgerSha256":"3f10532176b85adcc8d2d0f36009bb821893003637eada5de8cf89f0f349ec70","parityFailures":0}
```

Merk: den fullstendige AP-7-rapporten gjengir også kommandoens komplette resultat. Denne sammenligningsfilen beholder de viktigste observasjonene samlet for rask lesing.

### Schema-drift

`db:check-drift` returnerte exit code `0`, men viste følgende drift:

- `Document`: `search_vector`-indeks fjernet og database-default fjernet.
- `Insight`: `search_vector`-indeks fjernet og database-default fjernet.
- `Report`: `search_vector`-indeks fjernet og database-default fjernet.
- `Thesis`: `search_vector`-indeks fjernet og database-default fjernet.

Den rå Prisma-diffen er forventet fordi GENERATED tsvector-defaults og
tilhørende GIN-indekser ligger i rå SQL. Den strengere kontrollen passerte:

```text
[schema-drift] PASS: only a documented generated-FTS Prisma diff remains
```

Det ble ikke kjørt noen schema- eller databaseendring.

### Steg 3 — kjernetellinger

```text
Document|1539
LibraryAnalysisRecord|1572
ControlledMutationAudit|0
public_data_relations|56
```

Spørringen ble kjørt i `REPEATABLE READ READ ONLY` og avsluttet med `COMMIT`.

### Steg 4 — `--plan-only`

Kjørt etter at private primær- og replika-korpusrøtter var tilgjengelige og
trusted-runtime-attestasjonen passerte. Kontrollen avsluttet med exit code `1`:

```text
Source-registration dry run failed: knowledge/corpus/source-analysis-input-manifests/source-analysis-input-generation-manifest.v1.json differs from the exact source-registration batch pin
```

Den låste planen forventer hash
`897f3599585ed8cb1fb73749df28e944b38d283805ee981499ef440d89f06803`; den
canonical-sporede manifestfilen har hash
`631ad900849a9951a3e5471b35e28f8905b8c8607f9a0491deacb59f316c455d`.
Read-only Git-history viser at manifestet ble endret i `006986f` etter at
planen ble forberedt. Endringen oppdaterer tre source-analysis/schema-
bindinger og manifestets self-hash, så dette er reell stale-plan-drift, ikke
bare formattering. Ingen plan- eller manifestendring er gjort i denne
verifikasjonen.

## Neste sikre beslutningspunkt

Ikke signer eller kjør apply-planen før den stale manifest-pinnen er avstemt og
en ny separat read-only plan passerer. Health- og schema-gatene er nå
read-only-verifisert grønne innenfor sine kontrakter.
Ingen databaseskriving eller andre korpus-/registermutasjoner ble utført.

Ingen DATABASE_URL-verdi, private absolutte stier eller nøkkelmateriale er skrevet i denne filen.

# Rapport S2-A — diagnostikk

**Status:** FULLFØRT
**Dato:** 2026-08-04
**Gren / worktree:** `codex/nordic-knowledge-canonical-v1` (read-only diagnostikk)
**Mutasjoner:** ingen database-, register-, kø- eller evidence-pack-skriving

## Konklusjon

F8 er forventet, historisk drift fra rå SQL-migrasjonen for PostgreSQL FTS og blokkerer ikke signeringssporet etter at driften er forklart og bundet i apply-kontrakten. F9 ble ikke reprodusert når kontrollen ble kjørt fra canonical worktree med prosjektets lokale env-kilde; den tidligere feilen skyldtes kjøringskonteksten og er en kontrollartefakt, ikke påvist innholdsdrift.

## 1. F8 — schema-drift

Kjørte `npm run db:check-drift` read-only mot den lokale databasen. Diffen viser samme fire avvik som i nattens rapport:

| Tabell | Avvik |
|---|---|
| `Document` | `search_vector`-indeks og generert default finnes i databasen, men ikke i Prisma-datamodellen |
| `Insight` | samme |
| `Report` | samme |
| `Thesis` | samme |

Årsaksprøven er bestått:

- `prisma/migrations/20260719_fts_generated_columns_contract/migration.sql` finnes i sammenligningscommiten `407d984d` og oppretter disse PostgreSQL-spesifikke objektene via rå SQL.
- Samme `prisma migrate diff` mot dagens schema og mot `prisma/schema.prisma` fra `407d984d` gir identisk drift.
- Den eldre commiten `7f5b2eb3` mangler FTS-migrasjonen, men schemaet beskriver fortsatt `search_vector` som Prisma-unsupported felt; migrasjonen er derfor den eksplisitte kilden til den fysiske databasedriften.
- `SOURCE-REGISTRATION-APPLY-CONTRACT.md` binder allerede FTS-funksjonene `immutable_to_tsvector_no(text)` og `immutable_array_to_string(text[])` i katalog-v2-attestasjonen og krever fysisk post-write-sammenligning.

**Dom:** F8 er konstant, forventet drift — ikke ny bevegelse og ikke en grunn til å stoppe signering når funnet er dokumentert. Det er fortsatt ikke tillatt å skjule driften eller behandle en grønn prosesskode som tom diff.

## 2. F9 — snapshot-avvik

Første kjøring fra canonical worktree uten env-kilden stoppet før databasekilden var konfigurert. Med den eksisterende lokale env-kilden i prosessmiljøet kjørte:

```text
npm run knowledge:health:check
knowledge:health:check ok (6 immutable assessment(s))
```

Generatoren bruker den pinnede `baseCommit` fra `knowledge/health/corpus-health-generation-manifest.v1.json`, bygger `sourceSnapshotSetId` deterministisk fra dato og commit, og avviser kun en eksisterende ID dersom canonical JSON-innholdet er ulikt. Den registrerte snapshot-set-en er dermed verifisert som identisk i korrekt kjøringskontekst.

**Dom:** Ingen reell integritetsfeil påvist. Den rapporterte F9-feilen var en kontroll-/kjøringsartefakt knyttet til at canonical worktree ikke automatisk hadde env-kilden tilgjengelig. Ingen snapshot skal rebaselines eller overskrives.

## 3. De 76 filene

Read-only JSONL-kontroll av canonical register og køer:

| Kontroll | Resultat |
|---|---:|
| Rolleklassifiseringskø totalt | 1 555 |
| Uklassifiserte rolleposter | 124 |
| Uklassifiserte poster der køens `canonicalPath` finnes direkte i worktree | 48 |
| Uklassifiserte poster der køens `canonicalPath` ikke finnes direkte | 76 |
| Missing-files-kø | 29 |
| Registerrader med `repositoryFile.state=present` | 1 526 |
| `present`-stier som ikke finnes på disk via registerets resolved locator | 0 |

Diskrepansen er en kategoriforskjell, ikke et registerhull: rolleklassifiseringskøen bruker et foreløpig/forenklet `canonicalPath`-felt som ikke alltid er samme locator som registerets `repositoryFile.resolvedRepositoryPath`. De 76 radene er hovedsakelig interne Markdown-stier (74) og to PDF-stier, og skal ikke automatisk behandles som manglende korpusbytes. Registerets hash- og tilgjengelighetsrepresentasjon viser 0 manglende blant de 1 526 `present`-radene.

## Samlet funntabell

| Funn | Alvorlighet | Blokkerer signering? | Hva må gjøres |
|---|---|---|---|
| F8: FTS generated columns/indexer ikke uttrykt fullt i Prisma | Lav / forklart kontraktsdrift | Nei, ikke etter denne årsaksprøven | Behold rå-SQL-migrasjonen og katalog-v2-bindingen; ikke skjul diffen |
| F9: tidligere immutable snapshot-mismatch | Lav / ikke reprodusert | Nei | Kjør health-check med riktig env-kilde; ikke rebaseline |
| 76 rolle-købaner finnes ikke som direkte path | Lav / forventet kategoriforskjell | Nei | Bruk registerets resolved locator i videre validering; ikke endre køen nå |
| 0 registerrader med manglende `present`-sti | Ingen | Nei | Ingen handling |

## Gjenstående porter

S2-A åpner ikke første databasemutasjon, rettighetsavgjørelser, eierkvitteringer eller signatur. Den konkluderer bare med at F8 og F9 ikke er reelle integritetsblokker etter kontrollen over.

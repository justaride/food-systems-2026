# Kunnskapsbase, database og MCP — gjeldende status 2026-07-20

Filnavnet er beholdt for stabile lenker. Dette dokumentet erstatter eldre tall
og er den gjeldende lokale beslutningsflaten.

## Beslutning

| Bevisflate | Status | Presis betydning |
|---|---|---|
| Seed-metadataregresjon | **PASS** | Pinned prosent- og radminimum for metadata, provenance og tilgangsdato består. Dette er ikke faglig godkjenning. |
| Akademisk/ekstern claim-readiness | **NO-GO** | 0/417 evidensrader har komplett, gjeldende appraisal; 0/417 består ekstern appraisal-port. |
| Lokal database/schema | **PASS** | 31/31 migrasjoner, valid Prisma-schema, dokumentert FTS-drift, null kanoniske FieldCitation-orphaner og null siterte karantenedokumenter. |
| Lokal app/data-count-port | **PASS** | `npm run db:verify` består mot dagens database, inkludert det dokumenterte post-repair-minimumet `FieldCitation=244516`. Dette er kun regresjonsvern, ikke faglig godkjenning eller produksjonsparitet. |
| Seed/runtime-identitet | **NO-GO** | Metadata for alle matchede rader er lik, men den blokkerte Matsvinn-halvtilstanden gjør samlet identitetsparitet rød. |
| Lokal v2-backup/restore | **PASS** | Fersk post-repair-backup er checksum-/metadatabundet, gjenopprettet med eksakte tellinger og fingerprint, og engangsmålet er slettet med fravær bekreftet. |
| Dedikert lokal MCP-rolle | **PASS** | Eksakt 20-relasjons allowlist; `UPDATE`, `DELETE`, permanent og midlertidig `CREATE TABLE` avvises; framtidige rutiner er fail-closed mot `PUBLIC EXECUTE`. |
| Direkte MCP fra hardening-worktree | **PASS** | Seks read-only verktøy, riktig live-database og null eksternt kvalifiserte claims. |
| Registrert Codex-wrapper | **NO-GO** | Wrapperen peker på den urene kanoniske checkouten; akseptansen feiler på manglende hardening-felt. |
| Kontrollert Matsvinn-identitetsmutasjon | **BLOCKED / IKKE ANVENDT** | Apply er hard-disabled; audit-tabellen har 0 rader. Manglende bindinger og ekstern autorisasjon er reelle stoppere. |
| Delt/produksjons-MCP | **NO-GO / IKKE VERIFISERT** | Lokal rolle, lokal backup og lokal stdio er ikke deploy-, produksjons-, auth- eller off-node-bevis. |

Teknisk databasehelse, kildekvalitet, claim-støtte, MCP-rolle, klientkobling,
deploy/runtime og menneskelig review er separate bevislag.

Sluttverifisering på den gjeldende worktree-tilstanden: `1223/1223` tester,
TypeScript, ESLint, produksjonsbygg og `git diff --check` består.

## Lokal databasehelse

| Relasjon | Rader |
|---|---:|
| `Document` | 1 539 |
| `SourceCitation` | 2 703 |
| `FieldCitation` | 244 516 |
| `LibraryAnalysisRecord` | 1 572 |
| `Report` | 139 |
| `Thesis` | 79 |
| `SourceDoc` | 199 |
| `EvidenceAppraisal` | 0 |
| `DatabaseIdentity` | 1 |
| `ControlledMutationAudit` | 0 |

Databasekontrollene er nå additive og anvendt:

- 31/31 Prisma-migrasjoner er fullført.
- `prisma validate` og `prisma migrate status` består.
- Schema-drift består med kun den eksplisitt verifiserte FTS-kontrakten.
- `npm run db:verify` består mot den lokale databasen. Minimumene er
  regresjonsgrenser; de beviser verken akademisk kvalitet, seed/runtime-paritet,
  produksjonsdata eller deployhelse.
- Fire kontrollerte FieldCitation-targettyper må bruke kanonisk type og ID.
- Target-delete, target-ID-endring og truncate blokkeres når siteringer finnes.
- En sitert `Document` kan ikke gå inn i identitetskarantene.
- Document-låsen bruker `FOR SHARE`; en ekte to-tilkoblings-test beviser lovlig sluttstate både når citation og karanteneoppdatering starter først.
- `DatabaseIdentity` er én immutable UUID-linje.
- `ControlledMutationAudit` er append-only og binder databasebruker og dependency-state; tabellen er tom fordi Matsvinn-mutasjonen ikke er kjørt.

Den blandede evidensbasen er `Report + Thesis + SourceDoc = 417` rader. Den
inneholder akademiske arbeider, offentlige primærkilder, rapporter, registre,
interne synteser, operativt materiale og deklarerte duplikater. Den skal ikke
omtales som 417 akademiske publikasjoner.

## Kilde- og kunnskapskvalitet

Maskinell sannhetsflate:
`research/_status/academic-source-quality-status.{md,json}` og
`research/_status/academic-source-quality-repair-queue.{md,json}`.

| Dimensjon | Nåstatus | Tolkning |
|---|---:|---|
| Eksplisitt Report-provenance | 139/139 | Alle Reports har nå eksplisitt evidensrolle; dette validerer ikke lagrede funn. |
| Eksplisitt SourceDoc-provenance | 197/199 | Bare `src-77` og `src-87` står fortsatt fail-closed som `unknown`. |
| Eksterne Reports med syntaktisk gyldig locator | 101/101 | Beviser lagret locator, ikke claim-støtte eller stabil tilgjengelighet. Seks rader ble flyttet ut av eksterne klasser; en sjuende ble omklassifisert innen ekstern klasse til `external_article`. |
| Theses med syntaktisk gyldig locator | 79/79 | Én er den blokkerte syntetiske Matsvinn-identiteten. |
| Eksterne SourceDocs med syntaktisk gyldig locator | 98/102 | Fire eksternt klassifiserte rader mangler selv syntaktisk arbeidslocator; generiske eller misbundne URL-er kan fortsatt telle i de 98. |
| Eksterne Reports med reviewet tilgangsdato | 92/101 | Ni gjenværende rader krever individuell tilgangs- og identitetsreview; de skal ikke fylles ved gjetning. |
| Theses med reviewet tilgangsdato | 78/79 | Seed 78/78 er komplett; den syntetiske DB-only-raden er blokkert. |
| Eksterne SourceDocs med reviewet tilgangsdato | 78/102 | 24 gjenværende rader krever individuell tilgangs- og identitetsreview; fire av disse mangler også syntaktisk arbeidslocator. |
| Komplett, gjeldende appraisal | 0/417 | Menneskelig fulltekstreview mangler for hele korpuset. |
| Består ekstern appraisal-port | 0/417 | Ingen ekstern claim kan godkjennes nå. |
| Minst ett syntaktisk claim-anker | 3/417 | 414 mangler selv ett anker; tre ankere betyr ikke full claim-dekning. |
| Delt Report-locator | 4 grupper / 8 rader | Reviewet som to sannsynlige duplikatpar og to generiske/misbundne locatorpar; dependency-safe utførelse gjenstår. |

Tilgangsarbeidet i denne runden:

- 78/78 seed-Theses har evidensbasert tilgangsdato.
- 55 Reports ble anvendt; 52 beholdt verifisert locator og 3 fikk eksakt locator-reparasjon.
- 48 SourceDocs ble anvendt; 37 beholdt verifisert locator og 11 fikk eksakt locator-reparasjon.
- Ett Report- og fem SourceDoc-speil i `Document` ble oppdatert bare fordi URL-en eksakt matchet gammel locator.
- To andre Report-Documents med egne arbeidsspesifikke locatorer ble uttrykkelig beskyttet og urørt.
- De første reviewbatchene lot 11 Reports og 9 SourceDocs stå urørt fremfor å
  gjette. Etter den etterfølgende provenance- og identitetsgjennomgangen er den
  gjeldende køen 9 Report- og 24 SourceDoc-tilgangsgap; dette er en endret
  klassifikasjon, ikke 33 mislykkede automatiske reparasjoner.
- 213 SourceCitation-rader fikk evidensklasse avledet fra det eksakte,
  overlappsfrie registeret på 197 reviewede SourceDocs. Alle beholdt
  `blocked_unsourced`; post-apply dry-run viser 0 pending og 0 konflikter.
- Report-query og eksternfilter bruker nå provenance som hard ceiling før
  både lagrede Document-siteringer og fallback vurderes. Live lokal kontroll
  bekrefter at blocked, internal og composite Reports ikke kan bli eksternt
  brukbare gjennom en sterkere lagret sitatstatus.
- Ordinær TypeScript-import kan opprette seed-metadata i en tom database, men kan ikke overskrive reviewet locator/tilgang eller eksisterende Report/SourceDoc-provenance.
- En disponibel PostgreSQL-test med to samtidige skriveforbindelser beviser begge
  låserekkefølger: review først blokkerer generisk import, og generisk import
  først får den pinnede review-CAS-en til å feile lukket. Ingen rekkefølge kan
  lage en hybrid av generisk locator og reviewet tilgangsdato.

Durable receipts og køer:

- `research/_status/reviewed-provenance-completion-receipt-2026-07-20.md`
- `research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md`
- `research/_status/source-doc-access-date-review-receipt-2026-07-20.md`
- `research/_status/thesis-bibliographic-entity-review-queue-2026-07-20.md`
- `research/_status/reviewed-thesis-bibliographic-repair-receipt-2026-07-20.md`
- `research/_status/reviewed-report-provenance-correction-receipt-2026-07-20.md`
- `research/_status/reviewed-report-access-post-provenance-idempotence-receipt-2026-07-20.md`
- `research/_status/reviewed-source-doc-identity-repair-receipt-2026-07-20.md`
- `research/_status/reviewed-source-doc-identity-mirror-reconciliation-receipt-2026-07-20.md`
- `research/_status/reviewed-source-doc-content-hash-reconciliation-receipt-2026-07-20.md`
- `research/_status/reviewed-thesis-bibliographic-mirror-reconciliation-receipt-2026-07-20.md`
- `research/_status/reviewed-etmv-report-title-repair-receipt-2026-07-20.md`
- `research/_status/reviewed-etmv-2023-identity-repair-receipt-2026-07-20.md`
- `research/_status/reviewed-sandanger-content-hash-reconciliation-receipt-2026-07-20.md`
- `research/_status/reviewed-thesis-content-hash-reconciliation-receipt-2026-07-20.md`
- `research/_status/duplicate-report-locator-review-2026-07-20.md`

Ni sikre Thesis-bibliografireparasjoner er nå anvendt atomisk og verifisert
idempotente. Den separate, hashbundne speilbatchen oppdaterte ni
SourceCitations, åtte Documents og tre direkte LibraryAnalysisRecords uten å
endre funn eller claim-status. Mattila, Næss og de tre entity-migreringene er
fortsatt holdt utenfor batchen; Sandangers bibliografi er reparert, men
entity-type-reviewen står åpen.

Sju Reports som fortsatt var klassifisert som generiske eksterne rapporter er
nå korrigert atomisk til fem `composite_source`, én `external_article` og én
`blocked_source`. Post-apply-kontrollen viser 0 pending og 0 konflikter; alle
enumererte sitat-, dokument-, analyse- og appraisal-avhengigheter beholdt samme
hash. Dette er klassifisering av evidensrolle, ikke appraisal eller
claim-validering.

Fem avgrensede innholds-/identitetsbatcher er også lukket med byte- og
dependency-bundne kontrakter: 2023-versjonen av Finnish Food Market Ombudsman,
den semantiske tittelen på 2024-rapporten, kanonisk innhold/hash for
`SourceDoc:src-16` og `src-24`, og Sandanger-lokatoren med tilhørende
innholds-/hashspeil. I tillegg er fem Thesis-projeksjoner synkronisert kun for
reviewet bibliografi, med funn, syntese og manglende PDF-er beskyttet. ETMV
2024-PDF-dekning er fortsatt åpen; dette oppgraderer heller ikke
kildeappraisal.

Den gjeldende, post-repair-genererte bibliotekflaten har 1 555 kilder. 35 er
maskinelt klassifisert `safe_for_ai_context` kun for intern AI-kontekst,
1 427 er AI-utkast, 89 står i reviewkø, fire er blokkert og null
har navngitt, datert menneskelig review eller eksplisitt ekstern
claim-tillatelse. Dry-run-køene finner 19 URL-baserte, fem lokale og seks
manuelt URL-matchede tekstkandidater, men de er med hensikt ikke autoanvendt:
tekstgevinst er ikke det samme som kilde- eller claim-godkjenning.

## Appraisal-pilot og PDF-bevis

Pilotmålene er `SourceDoc:src-30`, `src-32` og `src-45`. De eksakte PDF-bytene
er hashbundet, totalt 70 sider er rendret og visuelt kontrollert, og reviewer-
brief/manifest er klare:

- `research/_status/evidence-appraisal-pilot-source-receipt-2026-07-19.md`
- `research/review/evidence-appraisal-pilot-reviewer-brief-2026-07-19.md`
- `research/review/evidence-appraisal-pilot-manifest.ts`

Manifestet er med hensikt tomt og `readyForDatabaseDryRun=false`. Verken side-
QA, metadata eller et eksisterende citation-anker erstatter navngitt menneskelig
fulltekstreview. Ingen appraisal er skrevet til databasen.

Den strenge eksternporten har nå en eksplisitt oppnåelig positiv kontrakt:
hver av de 417 radene må enten bestå den uavhengige appraisal-/citation-porten
eller ha en komplett, gjeldende eksplisitt eksklusjon. Minst én rad må faktisk
kvalifisere eksternt, og alle kvalifiserte rader må ha et syntaktisk claim-anker.
Eksklusjoner autoriserer aldri bruk, og ett radanker autoriserer ikke alle claims.
Dagens kvalifiserte delmengde er tom, så porten forblir korrekt rød.

## Seed/runtime-identitet og Matsvinn

| Sett | Seed | Database | Klassifisert status |
|---|---:|---:|---|
| Report | 139 | 139 | match |
| Thesis | 78 | 79 | mismatch: `matsvinnloven-2025` er uklassifisert DB-only |
| SourceDoc | 183 | 199 | 17 managed transkripsjoner; én offisiell lovkilde er seed-only |

Alle 182 matchede SourceDocs, 78 matchede Theses og 139 Reports har null
feltavvik. De 17 `src-yt-*`-radene er deterministiske runtime-importer og gir
ikke i seg selv ekstern evidensstatus.

Den falske Thesis-identiteten `matsvinnloven-2025` er ikke migrert. Den
autoritative lovidentiteten er modellert som
`SourceDoc:src-lov-2025-06-20-103`, men halvtilstanden er fortsatt eksplisitt
NO-GO. Apply-runneren stopper før databasekontakt. Følgende må fortsatt løses:

- mutation-specific binding til innholdet som faktisk ble restaurert
- eksakt instans/clone/environment-binding
- ekstern autorisasjonsissuer/signatur og eksplisitt brukerautorisasjon
- ende-til-ende disposable test av hele mutasjonstransaksjonen
- trust boundary rundt audit owner/superuser
- citation, appraisal og gjeldende ikrafttredelsesbevis for lovkilden

Ingen generisk import, sletting eller halvautomatisk identitetsreparasjon skal
brukes som snarvei.

## MCP

`foodsystems_mcp_ro` er lokalt re-bootstrapet og verifisert:

- `LOGIN NOINHERIT`, read-only-default, korte timeout-verdier og fast `search_path`
- SELECT kun på 20 eksplisitte relasjoner
- ingen kontrolltabell-, sequence-, schema-CREATE-, TEMP- eller skriverett
- ingen effektiv `SECURITY DEFINER`-vei
- default `PUBLIC EXECUTE` fjernet for gjeldende objekteiere; nye nødvendige app-grants må være eksplisitte

Direkte stdio-akseptanse fra hardening-worktreet består:

- 6/6 read-only verktøy
- `documents=1539`, `sourceCitations=2703`, `reports/theses/sourceDocs=139/79/199`
- `citationGateEligible=133`
- `externalAnswerEligible=0`, `externalAnswerBlocked=154`
- `EvidenceAppraisal=0/417`, `externalGateEligible=0`
- semantic søk faller tilbake til keyword; Obsidian-ressursen er av

Null ekstern eligibility er ønsket fail-closed atferd, ikke et kvalitetstegn.

Den registrerte wrapperen
`/Users/gabrielfreeman/.local/bin/foodsystems-kb-mcp` peker fortsatt på den
urene kanoniske checkouten. Read-only akseptanse feiler med
`kb_status.database.counts.reports must be a number`. Worktree-hardening må
integreres kontrollert, wrapperen må testes på nytt, og en ny klientøkt må se
koblingen før registrert MCP kan kalles GO.

## Backup og restore

Gjeldende post-repair v2-bevis:

- dump: `/Users/gabrielfreeman/.local/share/foodsystems/backups/foodsystems-post-identity-content-hardening-20260720-20260720T035014Z.dump`
- dump SHA-256: `8f7eca4ccc5210544ebfc06ee26f2d0e9d3b297eb93ebca653e310e826aabd52`
- dump bytes: `29494452`
- metadata SHA-256: `0bfcb01407fc589db776e855d53026bc33480603f95617aec8c12f8f629da1ad`
- database UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- ledger: 31 migrasjoner; hash `31a539201bc2a317d14c95fda235198488168dedb4086385e4c7ccf0db9e28ce`
- fingerprint: `ff0b23e8b3570bc8a7d6d84546f11d58ca0dbe94adaf3bcfaa228044b2536d49`
- restore receipt SHA-256: `2c88baa2c9537e65efcffb28c2ca858bbebc748def7b2c64243c33b4f2cc6549`
- åtte eksakte fag-/kjernerelasjonstellinger: PASS
- constraints, indexes, identity, ledger, metadata-binding og fingerprint: PASS
- disposable drop og bekreftet fravær: PASS

Første restoreforsøk med den ordinære approllen feilet korrekt på manglende
rett til å opprette `vector`-utvidelsen; cleanup fjernet mål-databasen og
publiserte ingen kvittering. Verifisert retry brukte lokal PostgreSQL-admin kun
til create/restore/drop og endte med fravær bekreftet.

Full kvittering:
`research/_status/database-release-controls-and-backup-v2-2026-07-20.md`.

Backupen er opprettet med `--no-owner --no-acl` og inneholder derfor **ikke** login-roller, eierskap, grants eller default ACL. MCP-rolle/ACL er et separat bevislag
og må verifiseres uavhengig etter restore. Dette er lokal
recoverability, ikke off-node-retention eller produksjonsrestore.

## Gjenværende arbeid

1. Navngitt reviewer må fullføre appraisal-piloten for `src-30`, `src-32` og `src-45`.
2. `src-77` og `src-87` må få en dependency-safe identitetsbeslutning; de skal ikke klassifiseres fra samme CRESSE-PDF ved gjetning.
3. Ni Report- og 24 SourceDoc-tilgangsgap må løses gjennom individuelle,
   evidensbaserte identitets-, locator- og tilgangsbeslutninger; syntaktisk URL
   er ikke nok.
4. Lukk bare de byte-verifiserte Thesis-/Report-innholdsgapene i
   `bibliographic-content-hash-reconciliation-queue-2026-07-20.md`. ETMV 2024
   trenger en delt asset-policy før PDF-dekning kan kalles lukket. Mattila,
   Næss, tre entity-migreringer og Sandangers entity-type står i separate
   beslutningsspor; den menneskelige/destruktive Thesis-køen er seks saker.
5. Appraisal og claim-ankre må skaleres fra pilot til det eksternt brukte korpuset.
6. Matsvinn-halvtilstanden må enten migreres gjennom en ny autorisert kontrollkontrakt eller få en annen eksplisitt datastyringsbeslutning.
7. De fire delte Report-locatorgruppene er klassifisert som to sannsynlige
   duplikatpar og to generiske/misbundne locatorpar. De trenger nå
   dependency-safe merge/tombstone eller work-level/internal-locator-løsning;
   klassifiseringen alene rydder ikke radene.
8. Hardening må integreres i kanonisk checkout før den registrerte wrapperen kan verifiseres.
9. Off-node backup, production ledger/schema/data, MCP-rolle, deploy/runtime, auth og apphelse må bevises separat.

## Repeterbare porter

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check

npx prisma validate
npx prisma migrate status
npm run db:verify
npm run verify:evidence-appraisal-migration
scripts/verify-database-schema-drift.sh
npm run audit:academic-source-quality
npm run audit:library-analysis

scripts/verify-mcp-readonly-role.sh
npm run mcp:kb:acceptance
```

Disse strengere portene skal fortsatt være røde og må ikke omtolkes:

```bash
npm run audit:academic-source-quality:release
npm run audit:academic-source-quality -- --require-external-ready --require-database-parity
npm run audit:library-analysis -- --require-external-ready
```

Detaljert drift: `docs/project/reference/DEPLOYMENT-AND-DATA-OPERATIONS.md`.
Rolle/backup/migrasjon: `docs/project/reference/POSTGRES-MCP-SETUP.md`.
MCP-kontrakt: `docs/project/reference/FOODSYSTEMS-KB-MCP.md`.

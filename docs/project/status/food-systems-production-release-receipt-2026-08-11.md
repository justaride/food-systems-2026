---
tittel: Food Systems 2026 — produksjons- og kunnskapsrelease
dato: 2026-08-11
status: kontrollert intern releasekvittering
gate: internal
scope: database-reconciliation, kunnskapsinntak, minst privilegium, deploy og runtime-readback
---

# Produksjons- og kunnskapsrelease 2026-08-11

## Dom

Den avgrensede tekniske releasen er **COMPLETE**. Databasen er reconcilet,
kunnskapslaget er fylt, runtime- og migrasjonsidentitetene er separert, og
produksjonen kjører eksakt merge-SHA med grønne data- og sideporter.

Dette er samtidig **NO-GO** for å tolke review-kø, eierpåstander, AI-utkast,
interne klassifiseringer eller prosjektutfall som eksternt godkjente claims.
Releasekvitteringen åpner ingen rettighets-, personvern-, fagreview- eller
publiseringsport.

## Kode og deploy

| Bevis | Resultat |
|---|---|
| Kunnskaps-/database-PR | [#342](https://github.com/justaride/food-systems-2026/pull/342), merge-SHA `62765fc9594d7c3fc25ed6f88355af880861a2e5` |
| Runtime-gate-PR | [#346](https://github.com/justaride/food-systems-2026/pull/346), merge-SHA `866914e34e2ef0dea68a15ae7a01227f8da7d5a7` |
| Produksjonsdeploy | [Coolify SHA Sync 31494521679](https://github.com/justaride/food-systems-2026/actions/runs/31494521679), grønn på eksakt `866914e34e2ef0dea68a15ae7a01227f8da7d5a7` |
| Versjon | `/api/version` = HTTP 200 og eksakt release-SHA |
| Data-/sideporter | `/api/data-status` = HTTP 200, `ok=true`, `dbOk=true`, `pageGatesOk=true`, `knowledgeBaseGatesOk=true` |
| Kunnskapstjeneste | `/api/library-analysis/status` = HTTP 200, `operational=true`, `reviewComplete=false`, `externalReady=false` |
| Produksjonsflate | `/prosjektlandskap` og `/ai-kunnskap` lest tilbake i autentisert nettleser |

Den første deployjobben etter PR #342, run
[31492265587](https://github.com/justaride/food-systems-2026/actions/runs/31492265587),
feilet fordi bibliotek-endepunktet brukte HTTP 503 både for tjenestefeil og en
legitim, fail-closed review-kø. PR #346 innførte separate porter:
`operational`, `reviewComplete` og `externalReady`. Den nye releasejobben
verifiserte dermed tjenestehelse uten å åpne review eller ekstern bruk.

## Database og minst privilegium

- 31 av 31 migrasjoner er fullført; 0 migrasjonsforsøk er uavklarte.
- Schema-/ledger-kontrollen og uavhengig driftkontroll er grønne.
- `foodsystems_migrator` er separat, ikke-superbruker og eier alle 56
  apprelasjoner i `public`.
- Runtime-identiteten `foodsystems` er ikke superbruker, har ikke
  `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS` eller `CREATE` på
  `public`, men har nødvendig DML på apprelasjonene.
- PostgreSQLs bootstrap-eier er skilt ut som egen cluster-admin-identitet;
  appen bruker den ikke.
- De isolerte donor-/kandidatdatabasene, kandidatrollene og den midlertidige
  recovery-operatøren er slettet etter readback.
- Migrasjonsrunneren ble kjørt på nytt med den dedikerte
  migrasjonsidentiteten: ingen ventende migrasjoner og grønn driftkontroll.

## Kontrollert datareconciliation

| Operasjon | Kontrollert resultat |
|---|---|
| Donor-reconciliation | Plan-SHA `cf902e8ce660850b6c177061f6d8c04e85cfec6d2d2ae0faea1bf572f8f0a663`; 0 konflikter; etterfølgende dry-run = 0 delta |
| Orphan citation-repair | Plan-SHA `37a119e0f5f767205ccb52ddbb56b3f078debe4870fea5b05610d6336f093279`; 50 retargetet, 21 ugyldige feltbindinger fjernet, 71 `SourceCitation` bevart, 0 orphan igjen |
| Citation-backfill | 2 654 `SourceCitation` og 5 043 `FieldCitation` opprettet; idempotensdry-run = 0 opprettelser |
| Library analysis | 1 770 rader; slutt-dry-run = 0 opprettelser, 0 oppdateringer, 1 770 no-op |
| Stale thesis | Én tom, duplisert `ulsaker-phd-2018` og dens review-rad fjernet; kanonisk `ulsaker-phd-2016` med offentlig Handle-lokator beholdt |

## Produksjonstall etter release

`npm run db:verify` er grønn mot den herdede runtime-identiteten. Sentrale
readback-tall er:

| Tabell | Antall |
|---|---:|
| Document | 1 615 |
| SourceDoc | 255 |
| Report | 139 |
| Insight | 132 |
| Thesis | 78 |
| SourceCitation | 5 265 |
| FieldCitation | 247 477 |
| LibraryAnalysisRecord | 1 770 |
| Company | 361 |
| CompanyDocumentRef | 1 271 |
| BoardMember | 1 844 |
| PersonProfile | 1 740 |
| Actor | 1 636 |
| AcademicIdentity | 417 |

## Backup og restore

Etter rolleherdingen kjørte GabiBFree Estate en ny backup av asset
`coolify:l0s8o8oo00c8gossw0gksswk`:

| Felt | Verdi |
|---|---|
| Artefakt | `coolify-food-systems-pgvector-db-20260811-125323-b91c5a.dump.age` |
| Kryptert SHA-256 | `8055e332115d65313e22cb1f18fdeacf995665ac31eb3fafb3bb458f2a413738` |
| Backup registrert | `2026-08-11T12:53:42Z` |
| Restore bevist | `2026-08-11T12:53:39Z` |
| iCloud/offsite | `verified` |
| S3/R2/offsite | `verified` |

GabiBFree Estate og `MANIFEST-COOLIFY-v1.tsv` forblir kanonisk flate for
løpende backupstatus. Denne raden er bare releasebundet readback.

## Åpne kunnskaps- og menneskeporter

- 1 355 av 1 770 bibliotekposter er godkjent for intern AI-kontekst.
- 399 poster står i eksplisitt review-kø; 392 mangler tilstrekkelig tekst.
- 15 poster er AI-utkast, 1 er trygt blokkert, og 0 har navngitt/datert
  menneskereview for ekstern claim-bruk.
- 0 kilder er eksplisitt godkjent for eksterne claims; `externalReady=false`.
- 96 label-only og 100 manglende-lokator-kandidater ble korrekt stoppet av
  citation-backfillen.
- Streng kildeaudit har fortsatt label-only-gjeld i finans/eierskap/eiendom og
  landmålinger, manglende kilder for enkelte støtte-, aksjonær- og styrerader,
  samt dokumenter uten offentlig eller varig lokator.
- Prosjektlandskapet har 0 uavhengig evaluerte kvalitative funn. Prosjektets
  egne utfall forblir «rapportert».
- Repoets kryptografisk bundne 1 555-raders corpusbaseline er ikke automatisk
  rebaselinet til produksjonens 1 770 rader; det krever en separat styrt
  corpusrebaseline.

## Verifikasjon

- full `npm test`: 1 894 av 1 894 tester grønne;
- fokuserte bibliotek-/releasekontroller: 19 av 19 grønne;
- `npm run lint` og `npm run build`: grønne;
- `npm run db:verify`: alle kanoniske minimum møtt;
- `scripts/apply-prod-migrations.sh`: 31 migrasjoner, ingen pending og grønn
  schema-/driftkontroll;
- `git diff --check`: grønn.

Neste fase skal derfor prioritere review, locator-/arkivgjeld, uavhengig
outcome-evidens og navngitte menneskeporter — ikke en ny generell breddeimport.

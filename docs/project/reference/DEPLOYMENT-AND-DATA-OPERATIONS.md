# Deployment og dataoperasjoner

## Formål

Food Systems 2026 har seks separate bevislag:

1. riktig commit er publisert
2. app-imaget bygger og starter
3. Prisma-ledger og faktisk databaseskjema er avstemt
4. kanoniske data er importert
5. backup er nylig, off-node og restore-testet
6. appens data- og kunnskapsporter er grønne

En grønn Coolify-deploy beviser bare punkt 2. Den beviser ikke at data,
migrasjoner, backup eller faglig ekstern readiness er i orden.

## Produksjonsporter

Produksjon er **NO-GO** for full dataimport eller MCP-tilkobling før disse er
dokumentert hver for seg:

- en fersk, reviewet GabiBFree Estate-kvittering fra `data_asset_proofs` og
  `MANIFEST-COOLIFY-v1.tsv`
- en vellykket, ikke-tom backup med verifisert iCloud- og S3/R2-offsite-kopi
  innen tillatt alder
- vellykket restore-drill bundet til samme artefakt og SHA-256
- `prisma migrate status` uten manglende eller ukjente ledgerposter
- `scripts/verify-database-schema-drift.sh` uten ukjent drift
- `npm run db:verify` mot måldatabasen
- `/api/data-status` med `ok=true` og `knowledgeBaseGatesOk=true`
- `/api/library-analysis/status` med `ok=true` for operasjonell klassifisering
- dedikert, verifisert read-only rolle før MCP kobles til

`/api/library-analysis/status.externalReady` er en separat faglig port. Den
skal ikke erstattes av `ok=true`: intern klassifisering kan være komplett selv
om eksterne claims mangler navngitt/daterbar human review. Hver eksternt
godkjent dokumentrad må i tillegg ha minst én gjeldende `SourceCitation` som
består answer-time-porten, inkludert en offentlig HTTP(S)-lokator. Statusen
revurderer denne koblingen ved hver avlesning, slik at URL-fjerning lukker
`externalClaimEligible` og `externalReady`.

## Kanoniske minimumstall

`npm run db:verify` feiler dersom produksjon ligger under det verifiserte lokale
korpuset per 2026-07-19. Dette er regresjonsminimum, ikke en øvre grense.

| Tabell | Minimum |
|---|---:|
| `Document` | 1 539 |
| `SourceDoc` | 199 |
| `Report` | 137 |
| `Insight` | 132 |
| `Thesis` | 79 |
| `SourceCitation` | 2 699 |
| `FieldCitation` | 244 516 |
| `LibraryAnalysisRecord` | 1 295 |
| `Company` | 351 |
| `CompanyDocumentRef` | 1 271 |
| `BoardMember` | 1 800 |
| `PersonProfile` | 1 594 |
| `CompanyOwnership` | 160 |
| `BusinessRelationship` | 105 |
| `CompanyProperty` | 104 |
| `Meeting` | 9 |
| `Actor` | 1 636 |

De øvrige minimumene ligger i `scripts/verify-prod-counts.ts`.
`FieldCitation`-minimumet er den verifiserte sluttellingen etter at fem eksakt
reviewede, korrupte orphan-bindinger ble slettet uten å slette deres
`SourceCitation`-rader. Dette er et regresjonsminimum, ikke et kvalitetsmål.
`Communication=0` er fortsatt tillatt fordi seedlaget er tomt per design og
brukerflaten har dokumentfallback.

## Standard rekkefølge

### 1. Verifiser publiseringsgrunnlaget

Før push eller deploy:

```bash
git status --short --branch
git log -1 --oneline
npm run lint
npm test
npm run build
git diff --check
```

Ikke publiser fra en dirty arbeidsgren med urelaterte endringer. Flytt den
godkjente endringsflaten til en ren gren/worktree først.

### 2. Sikre backup og restore

Den sentrale backupkjeden eies av GabiBFree Estate, ikke av Coolifys native
backupplaner. Food Systems skal derfor bruke en ny, immutable kvittering fra
Estate før hver risikofylt produksjonsmutasjon. Kvitteringen binder asset key,
database-UUID, artefakt, SHA-256 og separate backup-, offsite- og restorebevis.
Workflowen avviser manglende bindinger, feil identitet, fremtidige tidsstempler
og bevis eldre enn 36 timer; terskelen kan settes med repository variable
`DB_BACKUP_MAX_AGE_HOURS`.

I tillegg skal en faktisk dump restore-testes. Før en kontrollert
identitets-/citation-mutasjon må backupen bruke metadata v2, bestå streng
`BACKUP_REQUIRE_METADATA_V2=1`-kontroll og ha en maskinverifiserbar receipt v1
som binder dump-/metadatahash, database-UUID, fullført Prisma-ledger, eksakte
tellinger, target-fingerprint og bekreftet cleanup. Eldre backups beholdes bare
for historisk restore og er ikke mutasjonsbevis. Lokal verktøykjede og
sikkerhetsgrenser er dokumentert i
[`POSTGRES-MCP-SETUP.md`](POSTGRES-MCP-SETUP.md).

### 3. Avstem migrasjoner og skjema

Produksjonsimaget bruker denne fail-closed entrypoint-runneren:

```bash
scripts/apply-prod-migrations.sh
```

Den krever en separat `MIGRATION_DATABASE_URL`, verifiserer at den historiske
catch-up-baselinen allerede er fullført, bruker `prisma migrate deploy` og
Primas ledger, og fjerner migrasjonscredentialen før app-prosessen starter. Den
skal aldri erstattes med en løkke som spiller alle `migration.sql`-filer
gjennom `psql`.

Før første kjøring mot en eksisterende database:

```bash
npx prisma migrate status --schema prisma/schema.prisma
scripts/verify-database-schema-drift.sh
```

Hvis et objekt allerede finnes uten korrekt ledgerpost, må objektparitet,
backup og restore-drill bevises før en operatør eventuelt bruker
`prisma migrate resolve --applied`. Dette er aldri en automatisk deployhandling.

Migrasjonshistorikken kan ikke bootstrappe en tom database; den begynner som
catch-up mot et allerede etablert skjema. En manglende eller ufullstendig
historisk ledger er derfor en hard stopp, ikke et signal om å kjøre gammel DDL.

### 4. Deploy kode

1. Merge godkjent PR til `main`.
2. Bekreft at Coolify bygger riktig commit. For Dockerfile-build skal
   «Include Source Commit in Build» være aktivert, og applikasjonen skal ikke
   ha en manuelt lagret `SOURCE_COMMIT` som skygger Coolifys dynamiske verdi.
3. Bekreft at image-entrypointen kjører migrasjonsrunneren før appstart, og at
   Coolify har en aktiv health check mot `/api/data-status`.
4. Vent til deploy er `finished`, men bruk ikke denne statusen alene som
   migrasjonsbevis. Upstream Coolify kan svelge feil i post-deploy-kommandoer.
5. Kjør den manuelle, read-only workflowen **Coolify Deploy Verify** mot valgt
   ref. Den skal kontrollere full `/api/version`-SHA, `/api/data-status` og
   `/api/library-analysis/status` uten å endre env eller trigge deploy.
6. Ikke bruk en Cloudflare Access `302` som
   app-health-bevis.

`scripts/write-version.ts` leser Coolifys dokumenterte `SOURCE_COMMIT` og
`COOLIFY_BRANCH` under bygging. `/api/version.sha` skal være identisk med
deployens commit, ikke bare en commit som tidligere var på `main`. Repoets
tidligere SHA-mutatorer er pensjonert: `coolify-deploy-verify.yml` (tidligere
`coolify-sync-source-commit.yml`) er nå kun verifikasjon, og både `scripts/deploy.sh` og
`scripts/coolify-sync-source-commit.sh` feiler med en pensjoneringsmelding.
Dette beviser ikke at en eksisterende statisk
`SOURCE_COMMIT` allerede er fjernet i Coolify; det er en separat operatørjobb.

### 5. Synk data eksplisitt

Bruk workflowen **Production Data Import** med `confirm=IMPORT`:

- `verify-only`: teller kanoniske tabeller og auditerer library analysis uten
  dataskriv
- `knowledge`: behandler/importerer library-analysis-laget, auditerer og teller
- `full`: kjører hele kanoniske `db:prod-sync`, deretter library analysis og
  verifikasjon

Jobben bruker et beskyttet `production`-environment og non-cancelling
concurrency. Alle targets må bestå ledger-, schema-drift- og count-preflight.
Muterende targets krever i tillegg en fersk, vellykket off-node backup før
første dataskriv. Knowledge-ledger/readiness lastes opp som kjøringsartefakt;
prune- og approval-revocation-loggene beholdes separat som rollbackbevis.

For store innholdsoppdateringer er `full` riktig når backup, migrasjon og
drift er grønne. `knowledge` skal ikke brukes som erstatning for manglende
aktør-, selskaps- eller citation-data.

Direkte operatørkjøring bruker samme kontrakter:

```bash
npm run db:prod-sync
npm run research:library:process:apply
npm run research:library:ledger
npm run audit:library-analysis
npm run db:verify
```

Ledgeren skal eksporteres fra den samme `DATABASE_URL` som nettopp ble
behandlet. Audit av en eldre, inn-sjekket JSONL er ikke bevis for den muterte
databasen.

### 6. Verifiser runtime og kunnskapslag

Kontroller beskyttede endepunkter med gyldig Cloudflare service-token:

```text
/api/version
/api/data-status
/api/library-analysis/status
```

Forvent:

- `/api/data-status`: HTTP 200, `ok=true`, `dbOk=true`,
  `pageGatesOk=true`, `knowledgeBaseGatesOk=true`
- `/api/library-analysis/status`: HTTP 200 og `ok=true`
- `externalReady` rapporteres separat og kan legitimt være `false` mens
  menneskelig review gjenstår

Se deretter kritiske flater visuelt:

- `/kilder`
- `/bibliotek`
- `/rapporter`
- `/innsikt`
- `/ai-kunnskap`
- `/personer`
- `/selskap`
- `/relasjoner`

## Feilhåndtering

### Import feiler

Stopp. Ikke kjør `db push` eller ad hoc `ALTER TABLE` som første respons.

1. les hele feilen
2. kjør `prisma migrate status`
3. kjør schema-drift-porten
4. sammenlign objektet med `prisma/schema.prisma` og migrasjonene
5. lag en ny forward-only migrasjon hvis repoet mangler kontrakten

### Count-port feiler

Dette betyr at databasen ikke representerer kanonisk korpus, eller at en
import har slettet/deduplisert mer enn kontrakten tillater. Finn hvilken import
som eier tabellen, kjør den avgrenset og verifiser på nytt. Ikke senk minimumet
for å gjøre produksjon kunstig grønn.

### Library-port er operasjonelt grønn, men eksternt rød

Det er forventet når poster er trygt klassifisert som intern bakgrunn eller
blokkert, men mangler ekstern bruksregel og human review. Ikke reklassifiser
AI-utkast automatisk. Arbeid gjennom den genererte review-/reparasjonskøen.

### Backup-port feiler

En konfigurert tidsplan alene er ikke backupbevis. Kontroller gjeldende
GabiBFree Estate-kvittering mot `data_asset_proofs` og
`MANIFEST-COOLIFY-v1.tsv`: asset, artefakt, SHA-256, filstørrelse, begge
offsite-mål og restore-drill må samsvare. Lag en ny kvittering; ikke forleng
eller omgå en utløpt kvittering.

## Historisk merknad

Hendelsen 2026-04-21 viste at deployet kode, typed tabeller og faktisk schema
kunne drive fra hverandre. De gamle april-tallene er historikk og skal ikke
lenger brukes som produksjonsbaseline. Dagens porter er den maskinlesbare
kontrakten i `src/lib/data-status.ts`, `scripts/verify-prod-counts.ts` og
database-/MCP-runbooken.

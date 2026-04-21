# Deployment And Data Operations

## Hvorfor denne finnes

Food Systems 2026 er ikke en vanlig "bare deploy kode"-app. Det som vises i produksjon styres av tre lag samtidig:

1. Next.js-koden som bygges og deployes via Coolify
2. PostgreSQL-dataene som fylles av importskriptene i `package.json`
3. Schemaet i produksjonsdatabasen som må være kompatibelt med `prisma/schema.prisma`

Er ett av disse tre lagene ute av sync, kan siden se halvferdig ut selv om deployen teknisk sett er grønn.

## Hendelsen 2026-04-21

Den 21. april 2026 ble det avdekket at produksjon ikke reflekterte de siste 24 timenes arbeid fullt ut, selv om hovedappen var deployet.

Det som faktisk skjedde:

- kode var pushet og Coolify deployet ny app-container
- flere sider leste fra strukturerte tabeller som var tynnere i prod enn i repoets seed/importlag
- enkelte visninger hadde derfor for lite innhold selv om dokumentene fantes i `Document`
- produksjonsdatabasen hadde i tillegg schema-drift på `Subsidy`, som blokkerte deler av standard importkjeden

## Hva som ble rettet

### 1. Kodefallbacks i appen

Det ble lagt inn fallback-logikk slik at sider ikke er like avhengige av at alt først er promotert til egne typed tabeller.

Berørte områder:

- `personer`: fallback fra `BoardMember` når `PersonProfile` er for tynn
- `kommunikasjon`: fallback fra dokumenter når `Communication` er tom
- `rapporter`: fallback fra `Document` når `Report` mangler rader
- `innsikt`: fallback fra `Document` når `Insight` mangler rader
- `kilder`: fallback fra `Document` når `SourceDoc` ikke dekker hele biblioteket

Dette gjør siden mer robust, men det erstatter ikke riktige importer.

### 2. Produksjonsdata ble resynket

Følgende importløp ble kjørt mot produksjonsdatabasen 21. april 2026:

- `npm run db:import:ts`
- `npm run db:import:companies`
- `npm run db:import:ownership`
- `npm run db:import:persons`
- `npm run db:import:actors`
- `npm run db:import:transcripts`
- `npm run db:import:market`
- `npm run db:import:session5`
- samt dokumentimporter og tidligere `db:import:docs` / `db:import:root`

### 3. Schema-drift i produksjon ble reparert

`db:import:companies` feilet først fordi produksjon manglet nullable kolonner som finnes i Prisma-modellen for `Subsidy`.

Kolonnene som manglet i produksjon:

- `scheme`
- `kommuneNr`
- `source`

Disse ble lagt til direkte i produksjonsdatabasen med additiv SQL 21. april 2026. Senere samme dag ble endringen kodifisert som en idempotent migrasjon i `prisma/migrations/20260421_subsidy_nullable_columns/migration.sql`, slik at nye miljøer kan bringes i samsvar med Prisma-skjemaet uten ny ad hoc-SQL.

## Verifisert status etter opprydding

Målt i produksjon etter deploy og importkjede:

| Tabell | Antall |
|---|---:|
| `Document` | 955 |
| `SourceDoc` | 170 |
| `Report` | 108 |
| `Insight` | 117 |
| `Thesis` | 72 |
| `Company` | 60 |
| `BoardMember` | 339 |
| `PersonProfile` | 38 |
| `CompanyOwnership` | 12 |
| `BusinessRelationship` | 50 |
| `CompanyProperty` | 86 |
| `Meeting` | 7 |
| `Communication` | 0 |
| `MediaTheme` | 6 |
| `MediaOutlet` | 8 |
| `MediaEntry` | 10 |
| `TeamMember` | 9 |
| `Deliverable` | 6 |
| `Actor` | 169 |

Viktig tolkning:

- `Communication = 0` er per nå ikke en produksjonsfeil alene
- `db:import:ts` importerer også `0 communications` fra seedlaget slik repoet står nå
- kommunikasjonssiden er derfor foreløpig avhengig av dokumentfallback

## Driftsregel fremover

En grønn Coolify-deploy betyr bare at appen bygger og starter. Den betyr ikke at produksjonsinnholdet er oppdatert.

For dette prosjektet skal en "full deploy" forstås som:

1. kode deployet i Coolify
2. relevante data-importer kjørt mot produksjonsdatabasen
3. schema verifisert mot Prisma dersom importer feiler
4. nøkkeltabeller kontrollmålt etterpå

## Standard prosedyre ved større innholdsoppdateringer

Bruk denne rutinen når prosjektet er oppdatert betydelig, særlig etter nye dokumentimporter, nye typed lag eller flere samtidige endringer i samme workflow.

### A. Deploy kode

1. Push til `main`
2. Vent til Coolify-deploy er `finished`
3. Les buildlogg hvis status er `failed`

Eksempel:

```bash
coolify app deployments list so8ko44goccc8gcgswwscgco --format json
```

### B. Kjør relevante importer mot prod

Minimum ved større innholdsoppdateringer:

```bash
npm run db:import:ts
npm run db:import:docs
npm run db:import:root
```

Hvis selskaps-, eiendoms- eller relasjonslag er oppdatert:

```bash
npm run db:import:companies
npm run db:import:ownership
npm run db:import:persons
npm run db:import:actors
npm run db:import:market
npm run db:import:session5
```

Hvis man er usikker og schemaet er kompatibelt, er standard kjede:

```bash
npm run db:import
```

For å kjøre den anbefalte prod-sync-sekvensen (som matcher det som ble kjørt 21. april 2026) i én kommando, og få count-verifisering helt til slutt:

```bash
npm run db:prod-sync
```

### C. Kontroller nøkkeltabeller

Foretrukket metode — kjør det automatiske verify-skriptet, som måler mot baselines fra 21. april 2026 og rapporterer OK/WARN/FAIL per tabell:

```bash
npm run db:verify
```

Skriptet returnerer exit-kode 1 hvis noen tabell er under baseline eller tom (unntatt `Communication`, som er forventet tom i seedlaget).

Alternativt kan samme kontroll gjøres rent i SQL:

```sql
select 'Document', count(*) from "Document"
union all select 'SourceDoc', count(*) from "SourceDoc"
union all select 'Report', count(*) from "Report"
union all select 'Insight', count(*) from "Insight"
union all select 'Thesis', count(*) from "Thesis"
union all select 'Company', count(*) from "Company"
union all select 'PersonProfile', count(*) from "PersonProfile"
union all select 'CompanyOwnership', count(*) from "CompanyOwnership"
union all select 'BusinessRelationship', count(*) from "BusinessRelationship"
union all select 'CompanyProperty', count(*) from "CompanyProperty"
union all select 'Meeting', count(*) from "Meeting"
union all select 'Communication', count(*) from "Communication"
union all select 'MediaEntry', count(*) from "MediaEntry";
```

### D. Kontroller brukerflater som ofte avslører drift

Disse sidene bør sjekkes visuelt etter større oppdateringer:

- `/kilder`
- `/rapporter`
- `/innsikt`
- `/personer`
- `/kommunikasjon`
- `/media`
- `/eiendommer`
- `/selskap`
- `/relasjoner`

## Hvis en import feiler

Ikke anta at problemet er selve datafilen. Sjekk først om produksjonsschemaet matcher Prisma.

Rask kontroll:

1. les modell i `prisma/schema.prisma`
2. sammenlign mot faktisk tabell i prod
3. se etter manglende nullable kolonner, indekser eller tabeller

Eksempel fra 2026-04-21:

- Prisma forventet `Subsidy.scheme`, `Subsidy.kommuneNr`, `Subsidy.source`
- produksjon hadde bare `id`, `companyId`, `subsidyType`, `project`, `amountNok`, `year`
- resultatet var `P2022` og stopp i `db:import:companies`

## Kjente svakheter vi fortsatt må eie

### 1. Schema-endringer er ikke godt nok operasjonalisert

Repoet bruker en idempotent "additiv SQL"-stil for schema-endringer. Fra 21. april 2026 finnes to migrasjoner i `prisma/migrations/`:

- `20260421_media_evidence_corpus/migration.sql` — MediaOutlet / MediaEntry / MediaEntryCoding (med `CREATE TABLE IF NOT EXISTS`)
- `20260421_subsidy_nullable_columns/migration.sql` — nullable kolonner på `Subsidy` (med `ALTER TABLE … ADD COLUMN IF NOT EXISTS`)

Begge er skrevet idempotent, så de kan kjøres trygt flere ganger. De er foreløpig ikke satt opp til å kjøre gjennom `prisma migrate deploy` som en del av deployen, men kan kjøres mot prod med `psql` eller importeres manuelt før `prisma db push`.

Det betyr fortsatt:

- schema-drift kan oppstå uten at teamet ser det med en gang
- prod kan henge etter Prisma selv om appen bygger lokalt
- importer kan være første sted feilen oppdages

### 2. Ikke alle sider har komplette typed lag

Selv etter oppryddingen er det fortsatt noen steder hvor `Document` er rikere enn typed tabellene.

Det er akseptabelt så lenge:

- fallbackene fungerer
- vi vet hvilke flater som er avhengige av dem
- vi ikke tolker en grønn deploy som "alt innhold er oppdatert"

### 3. `Communication` er fortsatt seed-svakt

Kommunikasjonssiden er ikke tom fordi deployen er ødelagt, men fordi seed/importlaget foreløpig ikke oppretter egne `Communication`-rader.

## Anbefalt oppfølging

Oppfølgingspunktene fra første versjon av denne runbooken er nå delvis lukket:

1. ✅ Schema-fiksen for `Subsidy` er kodifisert som `prisma/migrations/20260421_subsidy_nullable_columns/migration.sql`.
2. ✅ Post-deploy prod-sync kjøres med `npm run db:prod-sync` (importsekvens + `db:verify`).
3. ✅ Count-sjekken er automatisert i `npm run db:verify`; checklisten under "Standard prosedyre" viser deploy → import → verify → visuell sjekk.
4. Fortsatt åpent: promotere flere dokumenter til typed lag (`Report`, `Insight`, `SourceDoc`) der det gir varig verdi, uten å fjerne fallbackene.

Ytterligere punkter som står åpne:

- Bygg inn `prisma migrate deploy` eller tilsvarende som del av Coolify-deployen, slik at schema-migrasjonene ikke må kjøres manuelt mot prod.
- Seed `Communication`-laget når det finnes reelle kommunikasjonsdata (i dag er `src/lib/data/communications.ts` en tom array per design — dokumentfallback dekker UI).
- Vurder en `db:prod-sync --dry-run` som bare teller delta mot baselines og varsler om import trengs, uten faktisk å kjøre.

## Kortversjon for teamet

Hvis siden ser utdatert ut etter en stor oppdatering, sjekk dette i rekkefølge:

1. Er riktig commit faktisk deployet i Coolify?
2. Er relevante importskript kjørt mot produksjonsdatabasen?
3. Matcher produksjonsschemaet `prisma/schema.prisma`?
4. Har nøkkeltabellene faktisk fått nye rader?
5. Er det seedlaget som er tynt, eller er det en reell prod-feil?

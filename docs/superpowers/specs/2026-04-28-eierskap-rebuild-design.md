# Eierskap-portal — design

**Dato**: 2026-04-28
**Branch**: `food-tg/eierskap-analysis-2026-04-28`
**Status**: Godkjent design, klar for implementasjonsplan

## Bakgrunn

`/eierskap` er per i dag en tynn visning (~46 linjers UI + 138 linjers query). Den viser konserntrær fra `CompanyOwnership`-tabellen og en kontrollerende eier-node fra `Shareholder`. Sist endret 2026-03-20 og lite videreutviklet, mens datalaget under (185 ownership-rader, 66 controlling shareholders, 14 manuelle tree-importskript for de største nordiske matkonsernene) er omfattende.

Eierskap er kjernen i Food TG-mandatet (markedsmakt, konsentrasjon, governance). Dagens side fungerer ikke som analytisk inngang fordi den mangler:
- Filtrering, søk og fokus per konsern
- Aggregering på konsernnivå (omsetning, ansatte, tilskudd inn, eiendomsbase)
- Tids-/M&A-dimensjon (data finnes i `metadata` men vises ikke)
- Tverrkoblinger til styremedlemmer, leverandørrelasjoner, dokumenter
- Eksplisitt gap-markering

## Mål

Gjøre `/eierskap` til den analytiske inngangen til konsentrasjon, eierskap og governance. Surface alt vi har om hvert konsern, marker eksplisitt hvor data mangler, og kjør Brreg-refresh på de ~230 sporede selskapene som første berikelsesfase.

## Out of scope (fase 2+)

- Aksjonærregisteret-import (Skatteetaten)
- Nordiske eierregistre (Bolagsverket SE, CVR DK, PRH FI)
- Automatisert M&A-monitoring
- HHI/konsentrasjonsmål per verdikjedeledd (hører på `/verdikjede`)
- Automatisert cron for Brreg-refresh

Disse er flagget som "foreslåtte berikelseskilder" i UI på datakvalitet-seksjonen.

## Arkitektur

### A. Datalag

**`scripts/refresh-brreg-tracked.ts`** (ny)
Henter Enhetsregisteret-data via `data.brreg.no/enhetsregisteret/api/enheter/{orgnr}` for sporede selskap (de som er i `Company`-tabellen). Oppdaterer NACE-kode, NACE-beskrivelse, adresse, ansatte (siste registrerte), status (`konkurs`, `under avvikling`, etc.), `lastBrregRefreshAt`-felt.

Kjøring: manuell (`npm run refresh:brreg`). Skal være idempotent og dry-run-bar.

**`scripts/audit-konsern-coverage.ts`** (ny)
Genererer `data/konsern-coverage.json` med per-konsern gap-rapport. Skrives som del av `npm run compute-metrics` (allerede i `npm run build`-pipeline). Outputstruktur:

```ts
type KonsernCoverage = {
  slug: string
  rootCompanyId: string
  rootName: string
  ownershipType: string | null
  controllingOwner: { name: string; pct: number | null; source: string | null } | null
  qualityScore: number  // 0-10
  metrics: {
    treeSize: number
    childrenWithLatestFinancial: number
    childrenWithoutFinancial: number
    childrenWithBoardMembers: number
    childrenWithoutBoardMembers: number
    ownershipEdgesWithSource: number
    ownershipEdgesWithoutSource: number
    propertyCount: number
    relationshipCount: number
    maEventCount: number
    maEventsWithDealValue: number
    daysSinceBrregRefresh: number | null
  }
  gaps: string[]  // human-readable list
}
```

**Eksisterende `import-*-tree.ts`-skript** (manuell revisjon)
14 skript revideres mot 2025/2026-kilder. TODO-liste i `research/data-readiness/eierskap-tree-revisjon.md` (ny). Ikke en del av dette designet å bestemme rekkefølge — legges som backlog.

**Prisma-skjema**
Ett nytt felt på `Company`:
```prisma
model Company {
  // ...
  lastBrregRefreshAt DateTime?  // ny
}
```

### B. Indeksside `/eierskap`

URL: `/eierskap`

Komponenter:
- `src/app/eierskap/page.tsx` (server component) — henter `getKonsernIndex()` og rendrer `EierskapContent`
- `src/app/eierskap/EierskapContent.tsx` (client) — filtrerbar tabell + aggregat-strip

Aggregat-strip øverst:
- Antall konserner totalt
- Eier-typologi-fordeling (familie / samvirke / stat / utenlandsk / børsnotert / privat) — som horisontalbar
- Totalt antall datterselskap kartlagt
- Totalt antall gap (sum av alle konserners gap-counts)

Tabell:
| Konsern | Eier-typologi | Kontr. eier (land) | Selskap i tre | M/regnskap | Total omsetning | M&A 24mnd | Score | Sist refreshet |

- Score 0–10 vises som tall + farge (rød 0–4, gul 5–7, grønn 8–10)
- Klikk på rad → `/eierskap/{slug}`
- Filtre: verdikjedeledd (multi-select), eier-typologi (multi-select), kontrollerende-eier-land (multi-select), score-grense (slider), søk (fritekst på konsernnavn og kontrollerende eier)
- Default sortering: score asc (verst først, audit-fokus)

Empty state hvis ingen konserner matcher: standard `EmptyState`-komponent.

### C. Detaljside `/eierskap/{slug}`

URL: `/eierskap/{slug}` der `{slug}` er en av `KONSERN_REGISTRY` (hardkodet konstant).

Komponenter:
- `src/app/eierskap/[slug]/page.tsx` (server) — henter `getKonsernDossier(slug)` og rendrer `KonsernDossier`
- `src/app/eierskap/[slug]/KonsernDossier.tsx` (client) — orchestrerer alle seksjonene
- Mindre seksjoner kan eventuelt deles ut til egne filer hvis `KonsernDossier` blir > 300 linjer

Hvis slug ikke finnes → `notFound()` (404).

Slug-konstant i `src/lib/queries/ownership.ts`:
```ts
type KonsernConfig = {
  slug: string
  expectsMaActivity: boolean  // brukes i score-beregningen
}

export const KONSERN_REGISTRY: Record<string, KonsernConfig> = {
  '819731322': { slug: 'norgesgruppen', expectsMaActivity: true },
  '914526647': { slug: 'reitan-retail', expectsMaActivity: true },
  '936560288': { slug: 'coop',          expectsMaActivity: false },
  '910747711': { slug: 'orkla',         expectsMaActivity: true },
  '914224314': { slug: 'bama',          expectsMaActivity: false },
  '929228723': { slug: 'asko',          expectsMaActivity: false },
  '947942638': { slug: 'tine',          expectsMaActivity: false },
  '938752648': { slug: 'nortura',       expectsMaActivity: false },
  '964118191': { slug: 'mowi',          expectsMaActivity: true },
  '960514718': { slug: 'salmar',        expectsMaActivity: true },
  '975350940': { slug: 'leroy',         expectsMaActivity: true },
  '911608103': { slug: 'felleskjopet',  expectsMaActivity: false },
  // Implementasjonsplanen skal liste opp alle CompanyOwnership-rotnoder mot dette
  // registeret, og legge inn slug/expectsMaActivity for de som mangler (inkl.
  // Kavli, Seafood holdings, og evt. nye konserner som dukker opp i datasettet).
}
```

Reverse mapping (slug → orgnr) brukes til å løse `/eierskap/{slug}` → konsernrotens companyId.

**Konsernrøtter som ikke er i `KONSERN_REGISTRY`**: ekskluderes fra `/eierskap`-indeksen (vises ikke som rad), og deres `/eierskap/{slug}` returnerer 404. `/selskap/{id}` for selskap i slike trær viser ikke "Se konsern →"-lenken. Implementasjonsplanen produserer en revisjonsrapport over alle rotnoder uten registry-entry, så manglende registreringer kan rettes opp eksplisitt.

#### Seksjon 1: Header
Konsernrotnavn (h1), eier-typologi-badge, kontrollerende eier med navn + prosent + kilde-chip (lenker til kildedokument hvis registrert), nøkkeltall som inline-strip:
- Antall selskap i tre
- Total konsern-omsetning (siste år)
- Total ansatte (siste år)
- Sist Brreg-refreshet (relativ dato)

#### Seksjon 2: Konsernstruktur
Eksisterende `OwnershipTreeDiagram` brukes uendret. Hvis treet har > 30 noder, legg til en "Vis som tabell"-toggle som rendrer en flat tabell med parent/child/pct/type/source.

#### Seksjon 3: M&A-historikk
Tidslinje (kronologisk, nyeste først) av events fra `CompanyOwnership.metadata`. Hvert event:
- Dato (`effectiveFrom`)
- Type (`dealType`: acquisition, merger, divestment, partial-sale)
- Target (datterselskap)
- Verdi (`dealValue`)
- Kilde (`source`)
- Notater (`metadata.notes`)

Eventer uten `effectiveFrom` listes nederst som "Udatert".

#### Seksjon 4: Aggregert økonomi
Kort med:
- Tabell: år | sum revenue | sum EBITDA | sum ansatte (over alle konsernselskap)
- Top 5 datterselskap etter omsetning siste år (linkable til `/selskap/{id}`)
- Manglende regnskap (datterselskap uten siste års regnskap) — tellet, og listet ekspanderbart

Bruker `Financial`-data koblet til alle selskap i treet.

#### Seksjon 5: Styre & interlocks
Tabell: alle styremedlemmer i konsernselskap (sum), normalisert via `personKey`. Marker:
- Sitter i flere konsernselskap (interlock internt) — badge "intern interlock"
- Sitter også i andre konsern (interlock eksternt) — badge "ekstern interlock", lenke til /styremedlemmer

Klikkbar til `/personer/{personKey}` hvis profilen finnes (samme mønster som /selskap/{id}).

#### Seksjon 6: Tilskudd inn
- Sum subsidies per år (siste 5 år) — som søylediagram eller tabell
- Top 5 tilskuddsordninger (`scheme`)
- Top 5 mottakerselskap i konsernet
- Lenke til `/subsidier?konsern={slug}` (utvidelse — filter må implementeres i denne jobben)

#### Seksjon 7: Eiendommer
Tabell aggregert per kommune:
| Kommune | Antall eiendommer | Total m² | Typer |

Lenke til `/eiendommer?konsern={slug}` for kart-visning.

#### Seksjon 8: Forretningsrelasjoner
Aggregert til konsernnivå (alle relationships hvor `fromCompanyId` ELLER `toCompanyId` er i konserntreet):
- Utgående: leverandører konsernet selger til (eksterne)
- Inngående: leverandører konsernet kjøper fra (eksterne)
- Internt: relasjoner innen konsernet — flagges som intra-konsern, separat seksjon (markedsmakt-relevant)

#### Seksjon 9: Datakvalitet & gap
Eksplisitt sjekkliste, hentet fra `data/konsern-coverage.json`:

| Sjekk | Status |
|---|---|
| Kontrollerende eier registrert | ja / nei |
| Datterselskap uten regnskap (siste år) | N |
| Datterselskap uten styremedlemmer | N |
| Ownership-kanter uten source | N |
| M&A-events uten dealValue | N |
| Brreg-refresh-alder | N dager |

**Foreslåtte berikelseskilder** (statisk seksjon):
- Aksjonærregisteret (Skatteetaten) — komplett aksjonærliste, ikke integrert
- Nordiske eierregistre (Bolagsverket, CVR, PRH) — for cross-border, ikke integrert
- Brreg Roller-API — automatisert styre-import, ikke integrert

### Datakvalitet-score (0–10)

Beregnes i `audit-konsern-coverage.ts`:

| Komponent | Poeng |
|---|---|
| Kontrollerende eier finnes på rot | +2 |
| 100% av ownership-kanter har `source` | +2 |
| 100% av datterselskap har siste års regnskap | +2 |
| ≥1 eiendom registrert | +1 |
| ≥1 forretningsrelasjon registrert | +1 |
| Brreg-refresh < 90 dager | +1 |
| ≥1 M&A-event registrert ELLER konsern-er-rolig-flagg | +1 |

`konsern-er-rolig-flagg` bestemmes manuelt i `KONSERN_REGISTRY`-strukturen (utvides):
```ts
{ orgNr, slug, expectsMaActivity: boolean }
```

Konserner som åpenbart har lav M&A-aktivitet (TINE, samvirke) får `expectsMaActivity: false` og scorer +1 uten å trenge events.

### Sammenheng med andre sider

- `/selskap/{id}`: når selskapet er i et konserntre, vis ny lenke "Se konsern →" som peker til `/eierskap/{slug}` for konsernroten. Erstatter dagens "Se eierskapstre →"-lenke som peker til `/eierskap` (uten kontekst).
- `/eiendommer`: legge til support for `?konsern={slug}`-filter (utvidelse i denne jobben — mindre endring).
- `/subsidier`: legge til support for `?konsern={slug}`-filter (utvidelse i denne jobben).
- `/styremedlemmer`: ingen endring i denne jobben; konsern-detail lenker inn med eksisterende interlock-data.
- Sidebar: beskrivelse "Konsernstrukturer og eiertraer" → "Konserndossier og datakvalitet".

## Filer og struktur

**Nye filer:**
- `src/app/eierskap/[slug]/page.tsx`
- `src/app/eierskap/[slug]/KonsernDossier.tsx`
- `src/lib/queries/konsern.ts` (aggregat-queries)
- `scripts/refresh-brreg-tracked.ts`
- `scripts/audit-konsern-coverage.ts`
- `data/konsern-coverage.json` (genereres av `audit-konsern-coverage.ts`, sjekkes inn i git — følger samme mønster som eksisterende metric-filer i `data/`)
- `research/data-readiness/eierskap-tree-revisjon.md` (TODO-liste for manuell tree-revisjon)

**Endrede filer:**
- `src/app/eierskap/page.tsx` — bruker ny `getKonsernIndex()`
- `src/app/eierskap/EierskapContent.tsx` — bytter til indeks-tabell
- `src/lib/queries/ownership.ts` — utvides med `KONSERN_REGISTRY`, `getKonsernIndex()`, slug-resolution-helpere
- `src/app/selskap/[id]/page.tsx` — oppdaterer "Se eierskapstre →"-lenke
- `src/app/eiendommer/` (page.tsx + content) — `?konsern={slug}`-filter
- `src/app/subsidier/` (page.tsx + content) — `?konsern={slug}`-filter
- `src/components/layout/Sidebar.tsx` — beskrivelse oppdateres
- `prisma/schema.prisma` — `lastBrregRefreshAt`-felt på Company
- `package.json` — nye scripts: `refresh:brreg`, `audit:konsern`. `audit:konsern` kjøres som del av `compute-metrics`.

## Datamodell-endringer

```prisma
model Company {
  // ... eksisterende felter
  lastBrregRefreshAt DateTime?
}
```

Migrasjon: `npx prisma migrate dev --name add_last_brreg_refresh`

## Tidsbudsjett og fasing

Implementasjonsplanen vil splitte i atomiske trinn slik at arbeidet kan pauses for Insight Pack v0.1 (frist 08.05). Anbefalt rekkefølge:

1. **Datalag** — Prisma-migrasjon, slug-konstant, `audit-konsern-coverage.ts`. Output: `konsern-coverage.json` brukbar uten UI-endringer.
2. **Indeksside** — refaktorere `/eierskap` til ny tabell + filtre.
3. **Detaljside** — `/eierskap/{slug}` med seksjoner 1–4.
4. **Detaljside fortsetter** — seksjoner 5–8.
5. **Datakvalitet-seksjon** — seksjon 9, surface gap-rapport.
6. **`refresh-brreg-tracked.ts`** — Brreg-pipeline.
7. **Ekstern-side-koblinger** — /selskap, /eiendommer, /subsidier.

Trinn 1–2 kan stå alene som leveranse hvis Insight Pack-arbeidet kommer i veien.

## Testing

- Eksisterende test-strategi i prosjektet brukes (sjekk via `package.json` ved implementasjon).
- `audit-konsern-coverage.ts` skal være enhetstest-bart (ren funksjon over Prisma-data, scoring-logikk er deterministisk).
- Slug-resolution skal ha unit-test (slug ↔ orgNr-mapping).
- `refresh-brreg-tracked.ts` skal ha dry-run-modus som logger uten å skrive.
- Manuell QA av indeks- og detaljside (Next.js-app, ingen automatisert e2e i prosjektet per nå).

## Risiki

- **Brreg-API rate limits** — 230 selskap × 1 request er trivielt, men dokumentere i scriptet.
- **Score-formelen kan oppleves urettferdig** for små konserner. Aksepteres — score er en audit-indikator, ikke en kvalitetsdom.
- **Sirkulære eierskaps-relasjoner** i `CompanyOwnership` (selskap A eier B som eier A) ville bryte rotnode-deteksjonen i `getOwnershipMap`. Eksisterende kode har ingen sykel-deteksjon. Audit-skriptet bør logge varsel hvis sykler oppdages; UI tar ikke hensyn til det i fase 1.

## Memory-oppdateringer etter implementasjon

- Opprette/oppdatere `project_eierskap_portal_rebuild.md` i memory med status og lenker.
- Memory-pekning fra MEMORY.md.

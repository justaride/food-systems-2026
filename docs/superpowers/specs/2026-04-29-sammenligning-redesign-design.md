# Sammenligning-side — design

**Dato**: 2026-04-29
**Branch**: TBD (opprettes ved implementering)
**Status**: Godkjent design, klar for implementeringsplan

## Bakgrunn

`/sammenligning` er per i dag en flat 2-kol grid med 13 søylediagrammer (`SammenligningContent.tsx`, 462 linjer). Den fetcher `value-chain.json` og `chart-metrics.json` per land client-side, noe som gir flere sekunders "Laster data..."-flicker på første render.

Problemer i dagens versjon:

- **Island er filtrert vekk** av en `CHART_COUNTRIES`-konstant, til tross for at IS-data finnes (243 butikker, HHI 2965, Gini 0.355).
- **Mye prosjektdata vises ikke**: produksjonsverdi, value-added, eksport-/import-verdier, sysselsetting (NACE 01/03/10/11), retail-format-mix (discount/super/conv), horeca, pant-returrate, Matsentralen, TGTG, foredlings-omsetning, food_waste_by_category, key_policies-tidslinje, FI sin 9-mnd kornreserve, fôr-import-andel, biogass-mål.
- **Misvisende framstilling**: CO₂e-grafen viser tilnærmet bare NO-data fordi øvrige land mangler tall, uten å si fra. EMV-andel bruker hardkodede fallbacks (`EMV_FALLBACK_PCT`) for NO/DK.
- **Ingen kobling til resten av plattformen**: ingen lenker til `/eierskap`, `/sirkularitet`, `/forsyningskjede`, `/politikk` eller landsdetaljer.
- **Ingen kilder eller metadata** per visning.
- **Norske skrivefeil**: «pa tvers», «Arlig», «manure», «for» (= fôr) — ASCII-fallback fra eldre versjon.
- **Ingen tematisk gruppering**, ingen filter, ingen tid-/per-capita-toggle.

Sammenligning er en av plattformens hovedinnganger ved siden av `/eierskap`, `/sirkularitet`, `/politikk`, `/forsyningskjede`. Den må fungere som den kanoniske kryss-nasjonale linsen og som launchpad inn til temasider.

## Mål

Gjøre `/sammenligning` til en tematisk strukturert nordisk komparativ analyse i 5 bolker som hver svarer på ett kjernespørsmål, viser komplette datapunkter fra `value-chain.json` + `chart-metrics.json` + `CountryMetric`-DB, gjør Island synlig i alle visualiseringer (med eksplisitte data-gaps), og krysslenker til relevante temasider.

## Out of scope (fase 2+)

- Tidsserier per land (verdikjede-JSON har stort sett ett år per felt).
- Year-velger / interaktiv tidsfilter.
- Land-on/off-toggle (alle 5 nordiske land alltid synlige).
- Geografisk visualisering (hører på `/kart` om opprettet).
- Margins per ledd — data finnes i `CountryMetric.margins`, men venter til vi vet hvordan vi vil fortelle om det.
- Lorenz/Zipf-detaljer (allerede grundig dekket på `/eierskap`).
- Nordic-aggregering / "totalt for Norden" (kan være misvisende fordi IS-data er ujevnt).
- CO₂e-utvidelse til SE/DK/FI/IS (vises som data-gap).

## Arkitektur

### A. Datalag

**`src/lib/queries/sammenligning.ts`** (ny)

Server-side aggregeringsmodul. Henter alle 5 land i parallell:

- `value-chain.json` (FS-read) for alle 8 ledd (`primary`, `seafood`, `processing`, `distribution`, `retail`, `horeca`, `household`, `waste`), `selfSufficiency`, `key_policies`, `food_waste_by_category`, `population`.
- `chart-metrics.json` (FS-read) for `parentCompany.parentHHI`, `lorenzCurve.gini`, `totalStores`.
- `getCountryChartData(code)` for `selfSufficiency`/`marketShare`/`margins`-DB-aggregater.

Returnerer ett typet objekt:

```ts
type SammenligningData = {
  generatedAt: string
  countries: Record<CountryCode, CountrySammenligning | null>
}

type CountrySammenligning = {
  code: CountryCode
  population: number
  market: {
    hhi: number | null
    cr3: number | null
    gini: number | null
    totalStores: number | null
    emvSharePct: number | null
    retailFormatMix: { discount: number; supermarket: number; convenience: number } | null
    parents: Array<{ name: string; sharePct: number }>
  }
  preparedness: {
    selfSufficiencyCaloricPct: number | null
    selfSufficiencyTargetPct: number | null
    selfSufficiencyTargetYear: number | null
    importTonnes: number | null
    importValueBn: number | null
    exportTonnes: number | null
    exportValueBn: number | null
    feedImportPct: number | null
    grainReserveMonths: number | null  // null for alle utenom FI
  }
  valueChain: {
    primaryVolumeTonnes: number | null
    seafoodExportValueBn: number | null
    processingTurnoverBn: number | null
    employmentByNace: { nace01: number; nace03: number; nace10: number; nace11: number } | null
    valueAddedByStep: Record<string, number | null>
    co2ePerStep: Record<string, number | null> | null  // null for SE/DK/FI/IS i dag
  }
  circularity: {
    totalWastePerCapitaKg: number | null
    householdWastePerCapitaKg: number | null
    wasteReductionSince2015Pct: number | null
    biogasGwh: number | null
    biogasTargetGwh: number | null
    biogasPlants: number | null
    depositReturnRatePct: number | null
    foodWasteByCategory: Record<string, Record<string, number | null>> | null
  }
  policies: Array<{
    name: string
    year: number
    type: 'lov' | 'forskrift' | 'avtale' | 'mål'
    summary: string
  }>
}
```

Hvorfor server-side: fjerner duplisert client-fetching (`useChartMetrics × 5 + useValueChainData`), fjerner load-flicker, gir bedre Lighthouse, enklere testing.

### B. Side-orchestrering

**`src/app/sammenligning/page.tsx`** (rewrite, tynt)

```ts
const data = await getSammenligningData()
return <SammenligningContent data={data} />
```

**`src/app/sammenligning/SammenligningContent.tsx`** (rewrite)

Pure orchestrator — ingen egen fetch. Renderer:

```
SammenligningContent
├── PageHeader (tittel + 1-setn ingress + lenke /metodikk)
├── BolkSection #1 — Markedsstruktur & makt
├── BolkSection #2 — Selvforsyning & beredskap
├── BolkSection #3 — Verdikjedevolum & verdiskaping
├── BolkSection #4 — Sirkularitet & matsvinn
├── BolkSection #5 — Politikk & regulering
└── FooterMetodikk (begrensninger + lenke /metodikk + sist oppdatert)
```

### C. Komponenter

Nye gjenbrukbare komponenter under `src/components/sammenligning/`:

| Komponent | Ansvar |
|-----------|--------|
| `BolkSection` | Wrapper: heading, narrativ, key takeaway, chart-grid, mini-tabell, "Se også"-lenke |
| `KeyTakeaway` | Stort tall + kort frase (lead-element per bolk) |
| `ChartCard` | Wrapper rundt `ComparisonBarChart` med info-popover (år+kilde), data-gap-badge, valgfri per-capita-toggle |
| `PerCapitaToggle` | Lokal state-toggle som re-renderer chart med normalisert verdi (verdi / population) |
| `DataGapBadge` | «N/M land mangler» — synlig når én eller flere land har `null` for chartens primærverdi |
| `InfoPopover` | «i»-ikon med popover som viser år + kildetekst |
| `ComparisonTable` | Generisk sticky-header tabell med flag-rad |
| `PolicyTimeline` | Horisontal år-akse 2015–2030 med markører fargekodet per land og type (lov/forskrift/avtale/mål) |

Eksisterende `ComparisonBarChart` beholdes uendret og brukes inni `ChartCard`. Eksisterende `Card` brukes som container.

### D. Per-bolk innhold

#### Bolk 1 — Markedsstruktur & makt

**Spørsmål**: Hvor konsentrert er nordisk dagligvare?
**Narrativ**: Norge har Nordens mest konsentrerte dagligvaremarked. HHI 3445 er ~60 % over Danmark.
**Key takeaway**: HHI 3445 (NO høyest) vs 2157 (DK lavest)
**Charts**: HHI · CR3 · Gini · Antall butikker · EMV-andel foredling · Retail-format mix (stacked: discount/super/conv)
**Tabell**: Parent-aktører & andeler per land
**Se også**: `/eierskap`

#### Bolk 2 — Selvforsyning & beredskap

**Spørsmål**: Hvor sårbar er hvert land for import-stopp?
**Narrativ**: Selvforsyningsgraden spenner fra 47 % (NO) til 300 % (DK). Finland har 9 mnd kornreserve via HVK-modellen.
**Key takeaway**: 300 % DK vs 47 % NO (kalori-basert)
**Charts**: Kalori-SS + mål · Import (per capita) · Eksport (per capita) · Fôr-import-andel · Kornreserve mnd (kun FI, andre = data-gap)
**Tabell**: SS, mål, mål-år, reservetid per land
**Se også**: `/forsyningskjede`

#### Bolk 3 — Verdikjedevolum & verdiskaping

**Spørsmål**: Hvor mye produseres, og hvem tjener pengene?
**Narrativ**: Norsk matsystem produserer 622 mrd NOK; sjømateksport (175 mrd) er ~4× landbruk.
**Key takeaway**: 622 mrd NOK total prod (NO)
**Charts**: Primærvolum (per capita) · Sjømat eksport-verdi · Foredlings-omsetning · Sysselsetting NACE 01/03/10/11 · CO₂e per ledd (med eksplisitt data-gap-badge for SE/DK/FI/IS)
**Tabell**: Value-added per ledd
**Se også**: `/verdikjede`, `/havbruk`

#### Bolk 4 — Sirkularitet & matsvinn

**Spørsmål**: Hvor langt er hvert land i sirkulær omstilling?
**Narrativ**: Norge har redusert matsvinn 24 % siden 2015; pant-returrate på 92 % er Nordens høyeste.
**Key takeaway**: −24 % matsvinn NO siden 2015
**Charts**: Total svinn/capita · Husholdningssvinn/capita · Svinn-reduksjon siden 2015 · Biogass GWh (absolutt + per capita-toggle) · Biogass-anlegg · Pant-returrate
**Tabell**: `food_waste_by_category` (kjøtt/melk/korn × ledd)
**Se også**: `/sirkularitet`

#### Bolk 5 — Politikk & regulering

**Spørsmål**: Hvordan styres systemet ulikt?
**Narrativ**: Norden konvergerer på matsvinn, biogass og emballasje, men i ulikt tempo.
**Key takeaway**: 2017–2030 — bransjeavtale → matsvinnlov → PFAS-forbud
**Charts**: `PolicyTimeline` (år-akse 2015–2030, markører fargekodet per land/type)
**Tabell**: Lover & avtaler per land
**Se også**: `/politikk`

### E. UX-defaults

1. **Island alltid synlig** i alle visualiseringer og tabell. Mangelende verdier vises som «—» med `DataGapBadge` aktivert på chartet.
2. **Per-capita-toggle** der relevant (volumer, butikker, biogass, svinn). Default-modus avhenger av indikator (matsvinn → per capita, butikker → absolutt, etc., spesifiseres per chart).
3. **Klikkbart land-flagg** → drilldown til relevant temaside (henviser via lenke i tooltip eller flag-meny — eksakt mekanikk avgjøres i implementeringsplan).
4. **Kilde-popover per chart** via `InfoPopover` («i»-ikon → år + `source`-felt fra `value-chain.json`).
5. **Footer-seksjon** lenker til `/metodikk` for utdypende beskrivelser av indikatorene.

### F. Språk & tekstfix

Norske skrivefeil rettes i samme PR:

- «pa tvers» → «på tvers»
- «Arlig» → «Årlig»
- «manure» → «husdyrgjødsel»
- «for» (når brukt om dyrefôr) → «fôr»
- Andre ASCII-fallbacks oppdages og rettes underveis.

Disse stammer trolig fra eldre versjoner uten Unicode-støtte.

## Datakilder per bolk

Alle datapunkter hentes fra eksisterende kilder — ingen nye importskript, ingen DB-endringer:

- **`value-chain.json`** (`public/data/food-systems/{no,se,dk,fi,is}/`): alt per `steps[].id` × felt, `selfSufficiency`, `key_policies`, `food_waste_by_category`, `population`.
- **`chart-metrics.json`** (`public/data/food-systems/{no,se,dk,fi,is}/`): `parentCompany.parentHHI`, `lorenzCurve.gini`, `totalStores`, parent-andeler.
- **`getCountryChartData(code)`** fra `src/lib/queries/country-metrics.ts`: DB-aggregater (`selfSufficiency`, `marketShare`, `margins`).

IS er allerede i kildedataene. Det som mangler markeres som data-gap, ikke skjules.

## Verifisering

Prosjektet har per i dag ingen test-runner (ingen vitest/jest/scripts). Vi følger eksisterende konvensjon og verifiserer via:

- **`npm run lint`** — ESLint passerer.
- **`npm run build`** — inkluderer Prisma generate + chart-metrics-compute + Next.js typecheck/bygg. Skal passere uten warnings i ny kode.
- **Type-stramning**: `SammenligningData` og `CountrySammenligning` skal ikke ha `any`-felter. `unknown` med narrowing er OK.
- **Manuell røyktest** med `npm run dev`:
  - Alle 5 bolker rendres uten "Laster data..."-flicker.
  - Island er synlig i alle charts og tabellrader.
  - Data-gap-badges vises korrekt for CO₂e (SE/DK/FI/IS) og kornreserve (alle utenom FI).
  - `InfoPopover` viser år + kilde per chart.
  - `PerCapitaToggle` re-renderer chartet med normaliserte verdier.
  - "Se også"-lenker per bolk navigerer til riktig temaside.

Å innføre en test-runner faller utenfor scope og kan vurderes i egen sesjon.

## Implementeringsrekkefølge (kort skisse)

Detaljert plan kommer i neste fase via `writing-plans`-skill. Grovt:

1. Skriv `getSammenligningData()` + types i `src/lib/queries/sammenligning.ts`.
2. Bygg gjenbrukbare komponenter i `src/components/sammenligning/`.
3. Rewrite `SammenligningContent.tsx` til orchestrator med 5 `BolkSection`-instanser.
4. Verifiser data-coverage per land, fyll inn data-gap-badges der relevante felter er `null`.
5. Tekstkorrektur og krysslenker.
6. Snapshot-test + manuell røyktest.

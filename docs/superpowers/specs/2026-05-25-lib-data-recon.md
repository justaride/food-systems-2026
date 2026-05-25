# lib/data inventory — recon

Date: 2026-05-25
Scope: `src/lib/data/*.ts` (28 filer, 19 869 linjer)

## Funn

Filene faller i tre klare kategorier basert på hvem som importerer dem.

### A. Rene seed-filer (kun brukt av `scripts/`, ikke runtime UI)

| Fil | Linjer | scriptUsers | srcUsers |
|---|---|---|---|
| `actors.ts` | 3 798 | 3 | 1 (kommentar) |
| `reports.ts` | 3 318 | 13 | 0 |
| `sources.ts` | 1 881 | 9 | 0 |
| `sustainability-country-metrics.ts` | 1 863 | 1 | 0 |
| `theses.ts` | 1 860 | 9 | 0 |
| `research-prompts.ts` | 1 294 | 1 | 0 |
| `media-corpus.ts` | 448 | 2 | 0 |
| `deliverables.ts` | 40 | 1 | 0 |
| **Sum** | **~14 502** | | |

Disse er **import-seeds for Prisma-modeller** (Actor, Report, SourceDoc, Thesis, Insight, ResearchPrompt, MediaEntry, Deliverable, CountryMetric — alle finnes i schema). De ligger feilplassert i `src/lib/data/` siden de aldri brukes i runtime — kun av `scripts/import-*.ts`.

**Anbefaling:** flytt til `prisma/seed-data/` (eller `data-seeds/`). Reduserer `src/lib/data` med ~73 %.

### B. Runtime-konfigurasjon (små, hører hjemme i kode)

| Fil | Linjer | Notat |
|---|---|---|
| `nav.ts` | 54 | Site-navigasjon |
| `food-tg-mandate.ts` | 445 | Statisk mandat-tekst |
| `food-tg-control-layer.ts` | 427 | Kontrollag-spec |
| `r-ladder.ts` | 212 | R-ladder definisjon |
| `circular-leverage.ts` | 351 | Hev-punkt-katalog |
| `country-chart-data.ts` | 166 | Land-konstanter |
| `verdikjede.ts` | 345 | Verdikjede-struktur |
| `property-companies.ts` | 87 | Manuell mapping |
| `circularity-questions.ts` | 296 | Spørsmåls-katalog |
| `circularity-actor-map.ts` | 75 | Mapping |
| `media-landscape.ts` | 381 | UI-konfig |

Beholdes som er. Dette er kode-konstanter.

### C. Hybrid: brukt som DB-fallback i `queries/project.ts`

| Fil | Linjer | Rolle |
|---|---|---|
| `insights.ts` | 1 757 | DB-fallback (mistenkelig stor — bør verifiseres om alt brukes) |
| `applications.ts` | 63 | DB-fallback |
| `evidence-pack.ts` | 94 | DB-fallback |
| `kpis.ts` | 39 | DB-fallback |
| `phases.ts` | 52 | DB-fallback |
| `team.ts` | 67 | DB-fallback |
| `ten-step-start.ts` | 89 | DB-fallback |
| `meetings.ts` | 364 | DB-fallback + UI |
| `communications.ts` | 3 | Type-only |

De små er greie fallbacks. `insights.ts` (1 757 linjer) er stor for en fallback — bør sjekkes om innholdet faktisk speiler `Insight`-modellen og kan stripes til et minimum.

## Anbefalt rekkefølge

1. **Flytt kategori A** (`actors`, `reports`, `sources`, `theses`, `sustainability-country-metrics`, `research-prompts`, `media-corpus`, `deliverables`) fra `src/lib/data/` til `prisma/seed-data/`. Oppdater alle `scripts/import-*.ts`-importer. Verifiser `npm run build` + `npm run db:import`.
2. **Strip `insights.ts`** til minimum fallback (eller fjern hvis DB alltid har data).
3. Behold kategori B og resten av C.

Resultat: `src/lib/data` går fra ~20k → ~5.5k linjer uten å røre DB-skjema, ren mekanisk flytting.

# Datakvalitet-merking: evidens-/proveniens-primitiv + overclaim-gate

- **Dato:** 2026-05-29
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** Spec 1 av 2. Denne spec-en dekker *merking* (overclaim-risiko). Spec 2 (sirkulær flyt-/materialflytmodell) brainstormes separat og **gjenbruker primitivet** definert her.
- **Linje:** Fortsetter [`2026-05-26-typed-citation-design-decision.md`](2026-05-26-typed-citation-design-decision.md), [`2026-05-20-citable-knowledge-base-hardening.md`](../plans/2026-05-20-citable-knowledge-base-hardening.md), [`2026-05-19-source-provenance-closeout.md`](../plans/2026-05-19-source-provenance-closeout.md).

## 1. Bakgrunn og problem

En kritisk analyse (2026-05-28) av databasen og biblioteket fant at prosjektets største risiko foran juni-hvitboken er **overclaim**: Norge-tunge, ett-års, ~5 %-menneskeverifiserte data presenteres med autoriteten til et harmonisert nordisk, akademisk datasett. Prosjektets egen interne gjennomgang (`docs/project/analysis/DATAKVALITET-FAGLIG-ANALYSE-2026-05-15.md`) nådde samme konklusjon.

Konkret:
- **Temporal:** `Subsidy` er 100 % år 2025, `DeliveryVolume` 100 % år 2024 — enkeltsnapshots presentert/oppfattet som tidsserier.
- **Geografisk:** flere nordisk-merkede tall hviler på NO-only grunnlag (proxy).
- **Verifikasjon:** `SourceCitation` er ~4,5 % menneskeverifisert; `FieldCitation` (244k) er ~98 % auto-stemplet på registerrader.

Infrastrukturen finnes allerede, men signalene er ustrukturerte og vises ujevnt. Dette tiltaket gjør dekning til **typede, beregnede, etterprøvbare data** som vises konsekvent og håndheves ved build.

## 2. Beslutninger låst i brainstorming

1. **To specs, merking først.** Flytmodellen er Spec 2.
2. **Håndheving: build-time gate.** En automatisk revisjon fanger påstander som hevder `nordisk`/`tidsserie`/`verifisert` uten faktisk dekning og blokkerer dem fra `citable_external` til de rettes, nedjusteres eller får forbehold.
3. **Arkitektur: Approach A — beregnet dekning + deklarert påstand + audit-koder.** Dekning beregnes fra faktiske data (sann ved konstruksjon), ikke kuratert (kan drive/lyve) eller heuristisk prosa-skanning (for upålitelig som gate).

## 3. Arkitektur

### 3.1 `CoverageProfile`-primitivet

Utvider `VisualizationDataContract` (`src/lib/visualization/types.ts`) — `period`/`coverageNote`/`evidenceStatus` blir avledet/beholdt for visning; `coverage` blir den audit-sjekkbare sannheten.

```ts
type TemporalCoverage =
  | { kind: 'snapshot'; year: number }
  | { kind: 'multi_year'; years: number[] }
  | { kind: 'time_series'; from: number; to: number; cadence: 'monthly' | 'yearly' }
  | { kind: 'unknown' }

type GeographicScope = {
  countries: string[]            // FAKTISK dekkede landkoder, utledet fra data
  presentedAs: 'no' | 'nordic'   // hvordan datasettet brukes/merkes (fra registeret)
  noAsNordicProxy: boolean       // badge-flagg: presentedAs='nordic' men countries dekker ikke hele Norden {NO,SE,DK,FI,IS}
}

type VerificationCoverage = {
  total: number
  humanVerified: number          // verificationStatus ∈ {verified, human_verified}
  machineVerified: number
  needsReview: number
  humanVerifiedPct: number
  rollup: 'human_grade' | 'machine_grade' | 'needs_review' | 'mixed'
}

type CoverageProfile = {
  datasetId: string
  temporal: TemporalCoverage
  geographic: GeographicScope
  verification: VerificationCoverage
  sourceClass: SourceClass       // gjenbruker eksisterende enum (registry_snapshot, …)
  computedAt: string
  computedEnv: 'prod' | 'local'
}
```

`rollup`-terskel: `human_grade` krever `humanVerifiedPct ≥ TERSKEL` (foreslått default **80 %**, konfigurerbar i implementering). Denne terskelen definerer hva som kan påstå `verified:true`.

### 3.2 Beregning — «sann ved konstruksjon»

Ny modul `src/lib/coverage/compute-coverage.ts` + et script som kjøres i `compute-metrics`-steget (`package.json`: `compute-metrics` → `compute-chart-metrics.ts && audit:konsern`; selv kalt fra `build`). Presedens: eksisterende `compute-file-coverage`.

Et **datasett-register** (`src/lib/coverage/datasets.ts`) kuraterer *hvordan man måler* — ikke resultatet:

```ts
type DatasetSpec = {
  id: string                     // datasetId som embeds/charts refererer
  label: string
  table: string                  // Prisma-modell
  yearField?: string             // temporal-skann (DISTINCT year)
  countryField?: string          // geografisk skann (DISTINCT country)
  presentedAs: 'no' | 'nordic'   // proxy-sjekken
  citationScope?: { entityType: string }  // verifikasjons-rollup via FieldCitation
}
```

Per datasett spør beregningen faktiske data: `DISTINCT year` → temporal-klasse; `DISTINCT country` → `countries[]` + `noAsNordicProxy` (kun NO, men `presentedAs:'nordic'`); aggreger `verificationStatus` over `SourceCitation`/`FieldCitation` (via `entityType`) → rollup.

**Output:** `public/data/coverage/profiles.json` (samme mønster som genererte chart-data, f.eks. `circularity-loops.json`).

**Prod vs. lokal (kritisk):** dekning må beregnes i miljøet som serverer artefakten (prod/CI), ikke på den mindre lokale DB-en — ellers kan badgen selv ta feil. Derav `computedEnv`-stempelet; beregningen knyttes til prod-metrics-refresh.

### 3.3 Gaten

**Deklarert rekkevidde på hvitbok-embeds** (`src/lib/hvitbok/embeds.ts`):

```ts
type AssertedScope = {
  datasetId: string             // hvilken CoverageProfile figuren hviler på (kreves for gating)
  geo?: 'no' | 'nordic'         // default 'no'
  temporal?: 'point' | 'trend'  // default 'point'; 'trend' påstår tidsserie
  verified?: boolean            // default false; true påstår citable_external / human-grade
}
// + assertedScope?: AssertedScope på NokkeltallEmbed og VizEmbed
```

**Nye blokkerende audit-koder** i `src/lib/citations/report-claim-audit.ts` (samme `severity:'blocking'`-mønster, men *deterministisk* sammenligning). Prinsipp: **en kode utløses når påstanden (`assertedScope`) er sterkere enn den beregnede dekningen** — sammenligningen går mot `profile.geographic.countries`/`temporal`/`verification`, ikke mot badge-flagget:

| Kode | Utløses når |
|---|---|
| `geographic_overclaim` | `geo:'nordic'` men `profile.geographic.countries` dekker ikke hele Norden {NO,SE,DK,FI,IS} (inkl. NO-only og `unknown`) |
| `temporal_overclaim` | `temporal:'trend'` men `profile.temporal.kind ∈ {snapshot, unknown}` |
| `verification_overclaim` | `verified:true` men `profile.verification.rollup !== 'human_grade'` |
| `coverage_profile_missing` | `datasetId` finnes ikke i `profiles.json` → **fail-closed** |

**Integrasjon:** utvid `CitableReportAuditInput` med `embeds` + `coverageProfiles`. `scripts/audit-citable-reports.ts` (eneste caller, wiret via `audit:citable-reports` → paraply `audit:citable`) laster `profiles.json` + embeds og sender dem inn. Legges til som CI-sjekk (GitHub) før Coolify-deploy, slik at en overclaim blokkerer pipelinen.

**Fail-closed-semantikk:** ukjent dekning eller manglende `datasetId` → enhver sterk påstand (`nordic`/`trend`/`verified`) blokkeres. Eldre embeds uten `assertedScope` defaulter til svakest (`no`/`point`/`verified:false`): blokkeres ikke, men får heller ikke nordisk/trend/verifisert-badge.

**Tre måter å løse en blokkering:** rett dataene; nedjuster `assertedScope` til sannheten; eller legg til forbehold (→ `citable_with_note`).

### 3.4 Synliggjøring

1. **`CoverageBadge`** (`src/components/coverage/CoverageBadge.tsx`, søsken til `Citation`) — tar et `CoverageProfile`, viser tre chips med samme stilspråk (stone/amber/emerald/rose), `compact`-modus:

   ```
   [ 2025 · øyeblikksbilde ]   [ NO → nordisk ⚠ ]   [ 5 % verifisert ]
   [ 2015–2026 · tidsserie  ]   [ Norden (5)     ]   [ 88 % verifisert ]
   ```

   Warning-varianten («NO → nordisk») er det synlige motstykket til `geographic_overclaim`: selv der en påstand nedjusteres og slipper gjennom, ser leseren at grunnlaget er NO-only. Plasseres på charts (via `VisualizationDataContract.coverage`), nøkkeltall-embeds, Nordisk-benchmark-kortet, selskaps-finanser.

2. **Dekningsoversikt i `/kilder`** («Kunnskapsgrunnlag») — ny seksjon som aggregerer alle `CoverageProfile` fra `profiles.json`: datasett → temporal / geografi / verifikasjon / `computedAt`. Det ærlige kartet over hele basen, ett sted.

3. **Hvitbok proveniens-vedlegg** — auto-generert fra `profiles.json` + embeds' `assertedScope` til et vedlegg `hvitbok`-ruten rendrer. Lister hvert sitert datasett med faktisk dekning og flagger `citable_with_note`-poster. Auditen tar allerede et `appendix`-input, så dette er en reell artefakt i pipelinen.

## 4. Dataflyt

```
DB (faktiske rader)
   │  compute-metrics (build-steg, prod/CI)
   ▼
compute-coverage.ts ── leser datasett-register ──► CoverageProfile[] ──► public/data/coverage/profiles.json
   │                                                                          │
   │                                                                          ├─► CoverageBadge (per figur)
   │                                                                          ├─► /kilder dekningsoversikt
   │                                                                          └─► hvitbok proveniens-vedlegg
   ▼
report-claim-audit ◄── hvitbok-embeds (assertedScope) ──────────────────────────┘
   │  sammenligner assertedScope vs CoverageProfile (deterministisk)
   ▼
blokkerende issues → feiler CI/build → blokkerer citable_external
```

## 5. Juni-omfang og prioritering

Gaten blokkerer bare datasett som har **både** en profil og en embed med sterk påstand. Arbeidet avgrenses derfor til «datasett som siteres i hvitboken», ikke alle 49 modeller.

1. **Må-ha:** figurene embeddet i juni-kapitlene (`chapterEmbeds` i `embeds.ts`) — gates + badges.
2. **Høyrisiko-datasett bak dem:** `Subsidy` (snapshot 2025) + `DeliveryVolume` (snapshot 2024) → temporal; nordisk-presenterte tall på NO-only (sirkularitets-benchmark m.fl.) → geografisk proxy; `CompanyFinancial` (32/51) + kuratert graf → verifikasjon.
3. **Utsettes (logges eksplisitt, ingen stille kutt):** lavtrafikk-datasett → `unknown`/svak default til de merkes.

## 6. Feilhåndtering / edge cases

- **Tomt datasett** → temporal `unknown`, verifikasjon total 0 → badge «ukjent dekning»; sterke påstander fail-closed.
- **Embed med ukjent `datasetId`** → `coverage_profile_missing` (blokkerende) — ingen figur slipper stille forbi gaten.
- **Foreldet profil** → `computedAt` vises; eldre enn data → warning.
- **Eldre embeds uten `assertedScope`** → svakest default (fail-safe, ikke fail-open på sterke påstander).

## 7. Testing

- **Unit — `compute-coverage`:** klassifisering snapshot/multi_year/time_series; `noAsNordicProxy`-deteksjon; verifikasjons-rollup (fixture-rader). Skrives test-først.
- **Unit — audit-koder:** sannhetstabell (`assertedScope` × profil) → forventet issue/ingen, inkl. fail-closed (ukjent dekning, manglende `datasetId`). Utvider `tests/lib/report-claim-audit.test.ts`. Skrives test-først.
- **Komponent — `CoverageBadge`:** riktige chips/varianter, inkl. proxy-warning.
- **Guard:** test som kjører den utvidede auditen over *dagens faktiske* embeds + profiler og krever null uventede blokkerende overclaims — den levende «hvitboken-er-forsvarlig»-vakten.

## 8. Suksesskriterier

1. Hvert nøkkeltall/figur i juni-hvitbok-kapitlene har et beregnet `CoverageProfile` og viser en `CoverageBadge`.
2. En påstand som hevder `nordisk`/`tidsserie`/`verifisert` uten dekning feiler `audit:citable-reports` (blokkerende) i CI før deploy.
3. `/kilder` viser en dekningsoversikt over alle profilerte datasett.
4. Hvitboken har et auto-generert proveniens-vedlegg.
5. Dekning beregnes i prod/CI-miljøet (`computedEnv:'prod'`), ikke lokalt.

## 9. Filer som berøres

**Nye:**
- `src/lib/coverage/compute-coverage.ts`, `src/lib/coverage/datasets.ts`, `src/lib/coverage/types.ts`
- `scripts/compute-coverage.ts` (chains inn i `compute-metrics`)
- `src/components/coverage/CoverageBadge.tsx`
- `public/data/coverage/profiles.json` (generert)
- tester: `tests/lib/compute-coverage.test.ts`, `tests/components/CoverageBadge.test.tsx`

**Endres:**
- `src/lib/visualization/types.ts` (legg `coverage?: CoverageProfile` på `VisualizationDataContract`)
- `src/lib/hvitbok/embeds.ts` (`AssertedScope` + felt)
- `src/lib/citations/report-claim-audit.ts` (nye koder + utvidet input)
- `scripts/audit-citable-reports.ts` (last profiler + embeds)
- `tests/lib/report-claim-audit.test.ts` (nye koder)
- `src/app/kilder/KilderContent.tsx` (dekningsoversikt)
- `src/app/hvitbok/*` (proveniens-vedlegg)
- `package.json` (`compute-metrics`-kjeden + CI-gate)

## 10. Utenfor omfang

- Sirkulær flyt-/materialflytmodell (Spec 2 — gjenbruker `CoverageProfile`).
- Dokument-embeddings og bred data-backfill (egne spor).
- Faktisk re-verifisering av kilder / BRREG-refresh (datakvalitet-arbeid, ikke merking).

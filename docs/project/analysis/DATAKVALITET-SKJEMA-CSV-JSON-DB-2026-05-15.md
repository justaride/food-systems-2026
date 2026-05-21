# Datakvalitetsskjema for CSV JSON og DB

Dato: 2026-05-15  
Status: kanonisk arbeidsstandard  
Gjelder: nye og promoterte data i `research/`, `public/data/food-systems/`, `src/lib/data/` og Prisma/DB-importer.

## Formaal

Dette skjemaet skal hindre at prosjektet blander observerte data, proxyer, interne synteser og uvaliderte kandidatkilder.

Ingen datapunkt skal promoteres til analyse, UI, rapport eller KI-svar uten eksplisitt kvalitetsstatus, metodeklasse, kildehenvisning og sammenlignbarhetsflagg.

## Hovedregel

| Bruk | Minimumsstatus |
|---|---|
| Intern research | `backlog_candidate` eller bedre |
| Analysearbeid | `staged_analysis` og komplett minimumsfeltsett |
| UI | `promoted_ui` eller eksplisitt statuskort som viser svakere status |
| Rapport | `promoted_analysis` med `validated` eller `primary_snapshot` |
| KI-svar | `promoted_ki` og source-to-claim-kjede |

## Obligatoriske felt

Alle nye CSV-er, JSON-records og DB-promoteringer skal enten ha feltene direkte eller peke til en metadatafil som har dem.

| Felt | Krav | Forklaring |
|---|---|---|
| `schema_version` | ja | Versjon av kvalitetsskjemaet. Start med `dq-2026-05-15`. |
| `record_id` | ja | Stabil ID for datapunkt eller claim-rad. |
| `dataset_id` | ja | Stabil ID for datasett eller arbeidsko. |
| `source_id` | ja | Stabil kilde-ID. Bruk eksisterende `SRC-*` der mulig. |
| `source_title` | ja | Lesbar kildetittel. |
| `source_ref` | ja | Kort referanse til fil, URL, tabell eller DB-kilde. |
| `source_owner` | ja | Kildeeier som SSB, SCB, Matvett, aktor, intern osv. |
| `source_class` | ja | Hva slags kilde dette faglig er. |
| `source_format` | ja | Hvordan kilden er tilgjengelig eller lagret. |
| `source_type` | legacy | Bakoverkompatibelt felt. Bruk `source_class` og `source_format` i nye filer. |
| `source_url` | anbefalt | Direkte URL eller landingsside. |
| `source_file` | anbefalt | Lokal filsti naar kilden finnes i repoet. |
| `source_locator` | ja for claims | Side, tabell, kapittel, avsnitt, chunk eller rad. |
| `persistent_id_type` | ja eller unntak | DOI, Handle, URN, ISBN, ISSN, permalink, archived_url eller canonical_source_id. |
| `persistent_id` | ja eller unntak | Selve persistent ID-en. |
| `persistent_id_exception_reason` | ja ved manglende ID | Hvorfor persistent ID ikke finnes. |
| `retrieved_at` | ja | Dato kilden ble hentet eller sist speilet. |
| `last_verified` | ja | Dato datapunkt eller claim sist ble kontrollert. |
| `country` | ja der relevant | `NO`, `SE`, `DK`, `FI`, `IS`, `Nordic`, `EU`, `Global` eller `NA`. |
| `theme` | ja | Tema som `trade_imports`, `matsvinn`, `scope3`, `nutrient_flows`. |
| `domain` | ja | Overordnet domene som `supply_chain`, `policy`, `market`, `circularity`. |
| `metric` | ja for datapunkt | Hva maales. |
| `value` | ja for datapunkt | Tallverdi. Tomt bare for kvalitative claims. |
| `unit` | ja for datapunkt | Enhet. Ikke bland indeks, prosent, tonn og NOK uten felt. |
| `year_or_period` | ja | Aar, periode eller `current`. |
| `method_status` | ja | Hvordan datapunktet er laget. |
| `evidence_status` | ja | Hvor sterkt kildestatusen er. |
| `quality_flag` | ja | Operativ kvalitet. |
| `comparability_flag` | ja | Om data kan sammenlignes mellom land eller serier. |
| `comparison_scope` | ja | Hva sammenligningen gjelder og ikke gjelder. |
| `confidence` | ja | Arbeidskonfidens: `high`, `medium`, `low`. |
| `review_status` | ja | Hvor langt review/proveniens-kontroll er kommet. |
| `provenance_type` | ja | Kildeproveniens. |
| `supporting_sources` | anbefalt | Ekstra kilder eller triangulering. |
| `claim_id` | ja for claims | `CL-*`, gap-ID eller stabil slug. |
| `claim_scope` | ja for claims | Hva paastanden kan brukes til. |
| `claim_strength` | ja for claims | Styrken paa paastanden. |
| `risk_if_wrong` | ja for claims | Hva som gaar galt hvis paastanden er feil. |
| `validation_need` | ja | Primaerkildesjekk, aktorvalidering eller metodebeslutning. |
| `promotion_status` | ja | Hvor i promoteringsloepet raden er. |
| `allowed_surfaces` | ja | `research`, `analysis`, `ui`, `report`, `ki` eller kombinasjon. |
| `ki_usage_rule` | ja | Hvordan KI kan bruke raden. |
| `owner` | ja | Hvem eller hvilket worker-spor eier neste handling. |
| `next_action` | ja | Konkret neste handling. |
| `notes` | anbefalt | Kort forbehold eller neste handling. |

## Enum-verdier

### `source_class`

```text
official_statistics
official_report
official_policy
academic_review
research_report
industry_statistics
company_report
actor_registry
declaration
local_record
internal_register
internal_synthesis
composite_source
blocked_source
unknown
```

### `source_format`

```text
api
portal
download
pdf
local_csv
local_json
local_geojson
prisma_db
markdown
workbook
external_url
unknown
```

### `source_type` legacy mapping

`source_type` finnes allerede i flere lokale filer og kan bety baade filformat og kildeklasse. Nye filer skal bruke `source_class` og `source_format`. Eldre `source_type` skal mappes slik:

```text
official_pdf -> source_class=official_report source_format=pdf
official_dataset -> source_class=official_statistics source_format=api|download|portal
industry_report -> source_class=industry_statistics source_format=pdf|external_url
actor_report -> source_class=company_report source_format=pdf|external_url
registry -> source_class=actor_registry source_format=api|portal|download
local_csv -> source_class=local_record source_format=local_csv
local_json -> source_class=local_record source_format=local_json
prisma_db -> source_class=local_record source_format=prisma_db
internal_synthesis -> source_class=internal_synthesis source_format=markdown
blocked_source -> source_class=blocked_source source_format=unknown
```

### `method_status`

```text
direct_observation
official_statistical_extract
calculated
normalized
modelled
proxy_model
internal_synthesis
actor_reported
benchmark_only
not_started
```

### `evidence_status`

```text
validated
primary_snapshot
observed_unreviewed
proxy_model
local_research_needs_primary_check
fetched_not_reviewed
candidate_backlog
missing
blocked
```

### `quality_flag`

```text
ok
partial
proxy
weak
request_needed
blocked
reject
```

### `comparability_flag`

```text
directly_comparable
comparable_with_flags
definition_diff
country_only
country_specific
case_only
proxy_model
not_comparable
not_started
```

### `review_status`

```text
not_started
fetched_not_reviewed
needs_primary_check
in_progress
partial_primary_snapshot
needs_harmonization
needs_ui_method_note
method_decision_needed
method_decision_recorded
ready_to_use
rejected
archived
```

### `provenance_type`

```text
external_report
external_article
official_data
official_registry
actor_source
actor_validated
internal_synthesis
internal_register
composite_source
blocked_source
unknown
```

### `promotion_status`

```text
backlog_candidate
fetched_not_reviewed
review_ready
needs_primary_check
needs_actor_validation
staged_analysis
promoted_analysis
promoted_ui
promoted_ki
rejected
archived
```

### `allowed_surfaces`

```text
research
analysis
ui
report
ki
research+analysis
research+analysis+ui
research+analysis+report
analysis+ui
analysis+report
analysis+ui+report
analysis+ui+report+ki
none
```

### `ki_usage_rule`

```text
cite_directly
cite_with_underlying_sources
background_only
warn_user
exclude
```

### `claim_strength`

```text
high
medium
low
hypothesis
not_claim
```

### `validation_need`

```text
none
primary_source_check
actor_validation
method_decision
legal_check
persistent_id_backfill
source_to_claim_mapping
external_validation
reject_or_archive
```

## Promoteringsregler

### Backlog til reviewklar

Krav:

- `source_id`
- tittel eller `metric`
- `source_owner`
- URL eller lokal fil
- land og tema
- foreslaatt analysebruk
- `promotion_status=review_ready`

Ikke nok:

- fuzzy DB-match
- bare kilde-navn
- arbeidsnotat uten primaerkilde

### Reviewklar til research artefakt

Krav:

- kilden er hentet eller lokalt resolvbar
- `retrieved_at`
- `source_type`
- `persistent_id_type` og `persistent_id` eller unntak
- kildeklasse er vurdert

### Research til analyse

Krav:

- komplett datapunktfeltsett
- `method_status`
- `evidence_status`
- `quality_flag`
- `comparability_flag`
- `last_verified`

### Analyse til UI

Krav:

- `allowed_surfaces` inkluderer `ui`
- status vises i UI eller metodekort
- `proxy_model`, `missing` og `local_research_needs_primary_check` maa ikke fremstilles som fakta

### Analyse til rapport

Krav:

- `allowed_surfaces` inkluderer `report`
- `evidence_status` er `validated` eller `primary_snapshot`
- proxyer kan bare brukes analytisk med tydelig metodeforbehold

### Analyse til KI

Krav:

- `allowed_surfaces` inkluderer `ki`
- `ki_usage_rule` er ikke `exclude`
- source-to-claim-kjede finnes:

```text
source_id -> document_id/report_id -> source_locator/chunk_id -> evidence_id -> claim_id
```

## CSV-validering

Foer en CSV regnes som promoterbar:

1. Alle rader har lik kolonnebredde.
2. Definert primaernoekkel har ingen duplikater.
3. Alle tall har `unit`.
4. Alle land har eksplisitt `country`.
5. Alle tidsserier har `year_or_period`.
6. Alle proxyer har `method_status=proxy_model` eller `quality_flag=proxy`.
7. Alle mangler er merket `missing` eller `not_started`, ikke fylt med antakelser.
8. Alle kilder har URL, lokal fil eller documented exception.
9. Alle nordiske sammenligninger har `comparability_flag`.
10. Alle KI-kandidater har `source_locator`.
11. Ukjente enum-verdier skal stoppe import, ikke tolkes best effort.

## JSON-validering

JSON-records som inngaar i appdata skal ha:

- stabil `id`
- `sourceRef` eller `source_refs`
- `methodStatus`
- `evidenceStatus`
- `qualityFlag`
- `comparabilityFlag`
- `lastVerified`
- `reviewStatus`

Hvis eksisterende appformat ikke kan endres direkte, skal metadata ligge i parallell statusfil og UI skal lese status fra den.

## DB-promotering

Foer DB-import:

- datafilen er validert
- `promotion_status` er minst `staged_analysis`
- importscript peker til kildefil og metode
- etter import skal `db:verify` eller relevant audit bekrefte counts/integritet
- importbatch skal logges i `research/_plans/data-quality-baseline-2026-05-15.csv` eller senere baseline

## Legacy mapping

Eksisterende filer skal ikke omskrives mekanisk foer det trengs. Ved lesing og promotering skal de mappes slik:

| Eksisterende verdi | Ny tolkning |
|---|---|
| gap-master `initial-card-created` | `promotion_status=review_ready`, `evidence_status=local_research_needs_primary_check` |
| gap-master `lokalt-verifisert-kildedokument` | `evidence_status=primary_snapshot`, ikke `validated` uten locator/review |
| gap-master `data-artifact-created` | `promotion_status=staged_analysis` |
| gap-master `partial-data-artifact-created` | `quality_flag=partial` |
| gap-master `krever-ekstern-validering` | `validation_need=actor_validation` |
| PCQ `ready_to_use` + `closed_for_annual_panel` | kan bli `validated` etter locator/metodenote |
| PCQ `partial_local_api_snapshot` | `evidence_status=primary_snapshot`, `quality_flag=partial` |
| PCQ `proxy_sources_found` | `evidence_status=proxy_model`, `method_status=proxy_model` |
| coverage `observed` | `primary_snapshot` eller `validated`, avhengig av review/proveniens |
| source registry `status=ready` | maksimalt `review_ready`, ikke analyseklar alene |

## Stop-regler

- Ikke marker `validated` uten primaerkilde eller faktisk ekstern validering.
- Ikke marker `promoted_ki` uten source-to-claim-kjede.
- Ikke bruk `internal_synthesis` som primær sitert kilde.
- Ikke bruk `blocked_source` uten advarsel eller ekskludering.
- Ikke bruk `Nordic` som label for harmonisert data hvis landene har ulik metode.

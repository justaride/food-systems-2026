# Circular Food Actor Registry Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: seed registry; not full census
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for circular food actor registry evidence.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- research/_status/circular-food-actor-registry/CAR-final-report.md
- research/_status/circular-food-actor-registry/CAR-coverage-map.md
- research/_status/circular-food-actor-registry/CAR-000-schema-and-rules.md

## Source Excerpts

### research/_status/circular-food-actor-registry/CAR-final-report.md

````markdown
# CAR Final Report

Date: 2026-06-24
Status: CAR-012 final QC/export complete for current workspace pass

## What Was Completed

- CAR-004 through CAR-011 were written as source-backed batch artifacts under `research/_status/circular-food-actor-registry/`.
- `CAR-registry-verified.csv` was regenerated from existing verified rows plus source-backed ready-for-import deltas, with CAR-010 person/ownership overlays applied where source basis was strong enough.
- `CAR-coverage-map.md` was created with verified export counts, candidate/context coverage and dedupe notes.
- Secondary-source or actor-gated rows were kept as candidate/context rather than promoted to verified.

## Final Export State

Verified export rows: 31

The export is strongest for:

- matsvinn/prevention and redistribution anchor actors
- side-stream/upcycling and alternative-protein actors with actor-primary plus registry sources
- biogas/digestate/compost facility and support actors with official facility/company pages
- research/support actors where the row is explicitly support/research, not output

## What Still Cannot Be Called Complete

- A complete Norwegian market registry.
- A complete active-farm or market-garden register.
- A Norway-wide quantified food-waste impact map.
- A complete biogas/nutrient-return capacity and realized-volume database.
- A complete founder/ownership database.
- Nordic/global failure-case coverage beyond selected context rows.

## Claim Discipline

Use CAR as an intake/export control surface, not as a public claim-lock. Every row keeps an `ikke_si` warning because row identity and mechanism evidence are not the same as verified impact, scale, profitability or market coverage.

## Recommended Next Gates

- PCQ for top verified rows before using any volume, revenue, capacity or impact figures.
- Actor-gate for small-scale producers, CSA/direct-sale farms and directory-only rows.
- Legal/source follow-up for failure rows before using bankruptcy language externally.
- Separate claim-lock work if any CAR row becomes public-facing narrative evidence.
````

### research/_status/circular-food-actor-registry/CAR-coverage-map.md

````markdown
# CAR Coverage Map

Date: 2026-06-24
Status: CAR-012 final QC/export artifact

## Verified Export Counts

Total verified rows in `CAR-registry-verified.csv`: 31

### By Category

| Category | Rows |
|---|---|
| FoU/nettverk | 5 |
| alternativt protein | 1 |
| biogass/digestat | 7 |
| finansiering/støtte | 1 |
| insekter | 3 |
| kompost/jord | 1 |
| matsvinn/prevention | 2 |
| redistribusjon | 1 |
| regenerativ/lokal praksis | 3 |
| sidestrøm/upcycling | 4 |
| tang/tare | 3 |

### By Country

| Country | Rows |
|---|---|
| NO | 31 |

### Norwegian Verified Rows By County

| County | Rows |
|---|---|
| Agder | 1 |
| Akershus | 5 |
| Buskerud | 1 |
| Innlandet | 3 |
| More og Romsdal | 2 |
| Møre og Romsdal | 1 |
| Oslo | 4 |
| Ostfold | 2 |
| Rogaland | 1 |
| Troms | 1 |
| Trondelag | 3 |
| Vestfold | 2 |
| Vestland | 5 |

## Candidate And Context Coverage

All parsed candidate/delta rows across CAR seeds and batches: 162

### All Rows By Category

| Category | Rows |
|---|---|
| CEA/vertical farming | 4 |
| FoU/nettverk | 16 |
| alternativt protein | 3 |
| biogass/digestat | 16 |
| finansiering/støtte | 9 |
| insekter | 12 |
| kompost/jord | 5 |
| konkurs/failure case | 9 |
| matsvinn/prevention | 12 |
| mykoprotein/fermentering | 7 |
| redistribusjon | 2 |
| regenerativ/lokal praksis | 20 |
| sidestrøm/upcycling | 19 |
| sirkulært fôr | 5 |
| tang/tare | 23 |

## Dedupe Notes

Actor IDs seen in multiple source files were treated as update/dedupe candidates, not separate actors. Important cases:

- `car-no-pronofa-asa` supersedes the older Pronofa seed where current primary source supports Ciona/Purply and historical insect assets are separated.
- `car-no-biomega-group-as` is the export row; `car-no-biomega-norway-as` stays an entity/site mapping candidate.
- `car-no-greve-biogass-as`, `car-no-lindum-as` and `car-no-den-magiske-fabrikken-as` replace the combined Greve/Lindum seed logic.
- CAR-008 practice rows stay candidate/context because maps and directories are not verified active producer registers.
- CAR-011 Nordic/global failure rows stay context unless a direct legal/source basis is strong enough for a future verified context export.

## Open Coverage Gaps

- Small-scale/regenerative producer coverage is not complete.
- Food-waste prevention still lacks municipal/HORECA participant-level rows.
- Biogas/nutrient-return rows need current owner/operator and realized annual volume checks for several facilities.
- Founders/key people remain intentionally partial.
- Nordic/global context is illustrative only and not Norwegian coverage.
````

### research/_status/circular-food-actor-registry/CAR-000-schema-and-rules.md

````markdown
# Circular Food Actor Registry - schema and rules

## Purpose

Circular Food Actor Registry (`CAR`) is a controlled intake layer for circular food-system actors. It is not a whitepaper, not a claim-lock surface, and not a complete market database in v1.

The goal is to build a Norway-first, source-classified register over:

- circular food producers and small companies
- founders, innovators and key people where openly sourced
- side-stream, feed, biogas, digestate, seaweed, insect and alternative-protein actors
- networks, research environments, support actors and funding/infrastructure nodes
- dormant, restructured, acquired and bankrupt cases as learning cases

Nordic and global actors can be stored as context, but v1 completeness language applies only to defined Norwegian source universes.

## File contract

All CAR work lives under:

`research/_status/circular-food-actor-registry/`

Core files:

- `CAR-000-schema-and-rules.md`
- `CAR-registry-candidates.csv`
- `CAR-registry-verified.csv`
- `CAR-source-search-log.csv`
- `prompts/CAR-promptpack.md`
- `decisions/CAR-batch-XX.jsonl`
- `reports/CAR-batch-XX.md`

## CSV schema

Required columns, in order:

```csv
actor_id,canonical_name,aliases,org_number,country,county,municipality,website,actor_kind,circular_category,value_chain_stage,r_ladder_level,circular_mechanism,product_or_stream,status,founding_year,founders_or_key_people,employee_count,revenue_latest,strongest_source,weakest_point,source_class,gap_type,gate,registry_decision,confidence,ikke_si,last_checked
```

## Field rules

| Field | Rule |
|---|---|
| `actor_id` | Stable CAR slug, e.g. `car-no-holdbart-as`. Never recycle IDs. |
| `canonical_name` | Legal/entity name when known; otherwise public actor name. |
| `aliases` | Semicolon-separated aliases; blank if none. |
| `org_number` | Brreg/org registry number only when source-backed. |
| `country` | ISO-like short code (`NO`, `SE`, `DK`, `FI`, `IS`, `FO`, `Nordic`, `Global`). |
| `county`, `municipality` | Use registry/source language. Blank is allowed. |
| `website` | Official site if known; blank if not source-backed. |
| `actor_kind` | `company`, `cooperative`, `foundation`, `public`, `research`, `network`, `project`, `municipal`, `platform`, `farm`, `unknown`. |
| `circular_category` | Must use one of the allowed categories below. |
| `value_chain_stage` | `input`, `primary`, `processing`, `distribution`, `retail`, `consumption`, `waste`, `research`, `support`, `multi`. |
| `r_ladder_level` | `R0`-`R9`, `multi`, or `unknown`. Do not infer without mechanism. |
| `circular_mechanism` | Plain mechanism, e.g. `surplus food resale`, `side-stream feed`, `anaerobic digestion`. |
| `product_or_stream` | Material/product stream, e.g. `spent coffee grounds`, `macroalgae`, `food waste`. |
| `status` | `active`, `pilot`, `scaling`, `dormant`, `restructured`, `bankrupt`, `acquired`, `unknown`. |
| `founding_year` | Registry/source-backed year only. |
| `founders_or_key_people` | Public role names only when source-backed and relevant. No private contact details. |
| `employee_count`, `revenue_latest` | Registry/annual report/source-backed only; include year if in text. |
| `strongest_source` | Local file or URL. Must be non-empty for `verified`. |
| `weakest_point` | The main caveat or missing verification step. |
| `source_class` | `A`, `B`, `C`, or mixed form like `A/B`. |
| `gap_type` | `Type A`, `Type B`, `Type C`, or mixed form. |
| `gate` | `verified`, `source-shortlist`, `actor-gate`, `PCQ`, `internal`, `parkert`. |
| `registry_decision` | `verified`, `candidate`, `context`, `needs_brreg`, `needs_actor_check`, `parked`. |
| `confidence` | `high`, `medium`, `low`. Confidence is about registry row quality, not actor impact. |
| `ikke_si` | Short overclaim warning. |
| `last_checked` | ISO date for this registry pass. |

## Allowed categories

- `matsvinn/prevention`
- `redistribusjon`
- `sidestrøm/upcycling`
- `alternativt protein`
- `sirkulært fôr`
- `tang/tare`
- `insekter`
- `mykoprotein/fermentering`
- `biogass/digestat`
- `kompost/jord`
- `regenerativ/lokal praksis`
- `CEA/vertical farming`
- `emballasje`
- `FoU/nettverk`
- `finansiering/støtte`
- `konkurs/failure case`

## Inclusion rules

Include an actor when at least one is true:

- It handles or prevents food-system waste, side-streams, surplus food or nutrient return.
- It produces or enables circular food, feed, ingredients, soil, digestate, biogas or biomass.
- It is a producer, startup, small company, cooperative, project, network, research environment or support actor with a circular food-system role.
- It is a relevant failure/survival case that explains why circular food initiatives do or do not scale.
- It is a Nordic/global context actor explicitly needed to compare or understand a Norwegian actor.

Exclude or park when:

- The circular link is only branding and no food-system mechanism is visible.
- It is only general climate/energy/infrastructure unless it directly touches food-system streams.
- It is a person-only lead with no public professional/source basis.
- The source is too thin to distinguish actor, project, product or media mention.

## Source hierarchy

| Class | Examples | Registry use |
|---|---|---|
| A | Brreg/registry, annual report, official company page, public project page, government/research source | Can support `verified` if row fields match the source. |
| B | Investor page, accelerator profile, media, secondary research note, actor-reported KPI outside primary filing | Can support `candidate` or `source-shortlist`; mark caveat. |
| C | Not public, not found, non-deduplicated social/community data, unclear entity match | Keep as gap, not fact. |

## Dedupe rules

1. Match exact org number first.
2. Then match canonical name plus country.
3. Then inspect aliases, acquisitions and old names manually.
4. Keep project, company and network as separate rows if they have different owners or gates.
5. Never merge a bankrupt/acquired entity into a successor without preserving status and source.

## Ikke-si rules

Every row must carry a short overclaim warning. Use these defaults:

- Do not call a candidate a complete registry entry.
- Do not infer active production from incorporation alone.
- Do not equate capacity, funding, plan or pilot with realized volume.
- Do not infer founder/person claims from secondary summaries.
- Do not use Nordic/global context actors as evidence of Norwegian market coverage.
- Do not treat bankruptcy as proof that the technology cannot work.

## Completion threshold

CAR v1 can be called "coverage-ready" only when:

- all rows parse as CSV
- verified rows have a strongest source and source class A or A/B
- candidates are separated from verified rows
- source coverage is reported per category and region
- open gaps are visible and not turned into zeros
````


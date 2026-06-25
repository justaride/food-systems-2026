---
tittel: Circular Food Actor Registry - schema and rules
status: CAR control artifact - no claims
id: CAR-000
scope: Norge-first actor registry for circular food-system actors, with Nordic/global context only as reference.
createdAt: 2026-06-24
---

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

# Pilot Brief 04: ASKO-Vestby Dependency Model

Status: workshop-start dossier
Last updated: 2026-07-02
Use: define inputs and boundaries for a logistics dependency and disruption-scenario model.

## Evidence base

- `research/bibliotek/bransje/logistikk/asko-infrastruktur-2025.md`
- `research/norden/verdikjede/03-distribusjon-logistikk.md`
- `research/brocode-kart/data/logistics_hubs.geojson`
- `research/bibliotek/beredskap/nordisk-beredskap-logistikk.md`
- `research/external/dro-1206/drr-1206-009-distribusjon-adoption-gate.md`

## What is controlled

- ASKO is NorgesGruppen's wholesale/logistics system and is central to supplying NorgesGruppen chains.
- Local evidence notes ASKO's Vestby central warehouse at about 100,000 m2, a broader ASKO warehouse footprint, and a daily truck fleet scale in the hundreds.
- The logistics hub GeoJSON includes `asko-vestby` and `asko-vestby-kjol` as central-hub points, plus competing/adjacent hub points such as Coop C-Log and REMA Vinterbro.
- The current evidence can support a dependency-scenario model, but not a hard single-point-of-failure claim. Route redundancy, category flows, inventory buffers, supplier allocation, and emergency procedures are not yet fully documented.

## Pilotable question

What happens to delivery coverage, category availability, and fallback routing if a major central or regional grocery logistics hub loses capacity for 24 hours, 72 hours, or two weeks?

The pilot should model exposure and resilience options, not assign fault.

## Data and model inputs

- Hub points and attributes from `research/brocode-kart/data/logistics_hubs.geojson`.
- Store counts and market-share context from `CountryMetric`.
- ASKO, Coop, REMA, BAMA, and Nordic logistics notes from the value-chain library.
- Potential future additions:
  - road travel-time matrix from hubs to municipalities/stores;
  - warehouse category roles by dry/chilled/frozen/fresh;
  - fleet capacity and charging/fuel constraints;
  - emergency substitution rules and supplier direct-delivery capacity;
  - population served by store catchment.

## Decision options for the workshop

- **Scenario model only:** build a reproducible model with transparent assumptions and no actor allegation.
- **Preparedness track:** connect the model to food-security/resilience planning, not competition enforcement.
- **Open-access link:** use the same model to test whether third-party/shared fallback capacity would improve resilience.
- **Defer:** hold until route and category-flow data are available.

## Human validation asks

- Ask logistics experts which disruption durations and category groups are realistic.
- Ask whether model outputs should be municipality-level, chain-level, or anonymized.
- Ask data reviewers whether public map data can support travel-time analysis, or whether a commercial routing source is needed.

## Do not say

- Do not say ASKO Vestby is the single point of failure for Norway without route-level and category-flow proof.
- Do not say centralization is inherently bad; the model should evaluate resilience tradeoffs.
- Do not use the dependency model as proof of market abuse.
- Do not publish commercially sensitive operational inferences as facts without validation.

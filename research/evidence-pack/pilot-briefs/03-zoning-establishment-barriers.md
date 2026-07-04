# Pilot Brief 03: Zoning and Establishment Barriers

Status: workshop-start dossier
Last updated: 2026-07-02
Use: convert property, lease, servitude, and municipal-store-density evidence into a mapping pilot.

## Evidence base

- `research/bibliotek/forskningsrunde-2026-04-20/eiendomsmakt-dagligvaremarkedet-norden-2026-04-20.md`
- `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-2026-04-29.csv`
- `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-summary-2026-04-29.csv`
- `research/regulatory/nordic-regulatorisk-sammenligning-2026.md`
- Norwegian Competition Authority: [Dagligvarerapport 2025](https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf)
- Swedish Competition Authority: [Food Supply Chain report summary 2024:5](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf)

## What is controlled

- Norwegian public sources identify access to attractive store premises as a structural entry barrier in grocery.
- Negative servitudes have been directly documented and regulated in Norway; exclusive leases and side agreements are harder to observe publicly.
- The Swedish Competition Authority also identifies store-location access and planning constraints as entry barriers in grocery.
- The current municipal-HHI dataset is a store-count proxy. It is useful for screening municipalities, but it is not a full market-definition or local-price model.

## Pilotable question

Can a municipality-level barrier map combine store-count concentration, store locations, property ownership/leases where public, planning constraints, and known restrictive mechanisms into a practical screening tool for local competition risk?

## Data and model inputs

- Municipal HHI store-count proxy:
  - Norway: 3,849 assigned store points; 287 municipalities with store-count HHI >= 2,500 among municipalities with at least 3 stores.
  - Sweden: 5,049 assigned store points; 258 high-HHI municipalities by the same proxy.
  - Denmark: 3,855 assigned store points and 14 unassigned; 30 high-HHI municipalities.
  - Finland: weaker geometry coverage; 1,703 assigned and 1,157 unassigned points.
  - Iceland: indicative OSM coverage only.
- Property and group-structure notes for NorgesGruppen, Coop, Reitan, and comparable Nordic retail-property structures.
- Regulatory ledger entries on Norwegian servitudes and Swedish location barriers.

## Decision options for the workshop

- **Municipal screening pilot:** publish a map with clear proxy disclaimers and a shortlist of municipalities for human review.
- **Lease/servitude checklist:** create a non-public due-diligence checklist for municipalities and competition authorities.
- **Planning-rule comparison:** compare Norway, Sweden, Denmark, and Finland on planning/zoning barriers without claiming direct price effects.
- **Do not pilot yet:** wait until store-location data and property ownership are more complete.

## Human validation asks

- Ask municipal planners which lease, zoning, and location data are legally accessible.
- Ask competition-law reviewers which indicators are safe to publish without implying infringement.
- Ask property-data reviewers whether the current store-count proxy should be paired with population, travel-time, floor-area, or revenue weights before workshop use.

## Do not say

- Do not say a high store-count HHI municipality proves unlawful exclusion.
- Do not say zoning reform alone will lower prices.
- Do not treat private exclusive leases as fully mapped from public data.
- Do not use the Finland/Iceland proxy rows without repeating their geometry-coverage caveats.

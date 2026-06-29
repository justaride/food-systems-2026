# CAR-005 Side Streams, Upcycling and Ingredients Actor Memo

Status: first-pass data collection
Date: 2026-06-24
Scope: Norwegian side-stream, upcycling and ingredient actors, with Nordic context rows only where they clarify gaps or analogues.

## What Was Collected

This batch prioritised actors with primary-source evidence for side-stream or residual-resource mechanisms:

- HOFF SA: potato and rest-resource circularity.
- Biomega Group AS / Biomega Norway AS: salmon rest-stream biorefining.
- Hofseth BioCare ASA: salmon off-cuts to bioactive marine ingredients.
- Pelagia AS: trimmings, non-human-consumption fish and marine ingredients across food, health, feed, biofuel and soil products.
- Alginor ASA and PROTEUS: kelp biorefinery and kelp side-stream valorisation.
- Gruten AS: historic coffee-ground oyster-mushroom and coffee-waste reuse case, but now dormant/winding down.
- Arctic Natural Nutrition AS: parked identity row because no primary side-stream mechanism was found.
- Kaffe Bueno and Hailia: Nordic context rows only.
- SINTEF/FHF marine residual raw-material analysis: context/source row, not an actor.

## Strongest Findings

HOFF has an unusually direct primary source for circular potato processing. It states that potatoes, peelings and cuttings are not discarded, and that rest resources are used for products such as potato flour, protein and spirits, with remaining resources mainly becoming fertilizer or animal feed. HOFF also gives an average annual rest-resource handling figure. Keep the exact scope wording attached to any volume use.

Biomega and Hofseth BioCare are strong Norwegian seafood side-stream ingredient actors. Both have actor-primary sources describing salmon rest streams/off-cuts and ingredient outputs for human nutrition, pet nutrition and related markets.

Pelagia is a strong large-scale marine-ingredient actor but needs careful splitting. Its own source covers food, health products, fish oil, protein concentrates, feed ingredients, biofuel and soil improvement. CAR should not collapse these into a single "human-food upcycling" claim.

Alginor belongs partly in `tang/tare` rather than pure `sidestrøm/upcycling`; the PROTEUS project supplies the stronger side-stream/total-utilisation angle.

## Key Gaps

- Arctic Natural Nutrition remains a seed identity, not a circular actor.
- Gruten is valuable as an Oslo coffee-waste case, but not an active producer row.
- Brewery spent grain and bakery side-stream producers in Norway remain weak in this pass.
- Seafood residual coverage needs actor/site split for Hordafor/Pelagia entities, plus separate human-food versus feed/biofuel/soil pathways.
- HOFF's 40 000-tonne figure needs exact preservation and later product-split if used beyond registry identity.

## Import Recommendation

Ready for verified import after final dedupe:

- `car-no-hoff-sa`
- `car-no-biomega-group-as`
- `car-no-hofseth-biocare-asa`
- `car-no-pelagia-as`

Candidate enrichment/context:

- `car-no-biomega-norway-as` should be deduped against the group row.
- `car-no-alginor-asa` should be enriched but classified carefully as kelp/tare biorefinery.
- `car-no-proteus-kelp-project` should remain a project context row.
- `car-no-gruten-as` should remain a failure/dormant/context case.
- `car-no-arctic-natural-nutrition-as` should remain parked until actor evidence appears.

## Ikke-Si Rules Added By This Batch

- Do not equate "utilized" residual raw material with high-value human-food utilization.
- Do not count group and production-entity rows as duplicate capacity.
- Do not present project targets as realized production.
- Do not classify dormant/historic coffee-ground production as active food production.
- Do not include nutrition-product companies as circular actors without side-stream evidence.

# CAR-004 Matsvinn, Prevention and Redistribution Actor Memo

Status: first-pass data collection
Date: 2026-06-24
Scope: Norway-first actors in food-waste prevention, redistribution, surplus-food resale, food-waste coordination and food-waste research/support.

## What Was Collected

This batch focuses on actors where the source set can distinguish the mechanism from general sustainability language:

- Too Good To Go Norge AS: Norwegian legal entity for the surplus-food app marketplace.
- Holdbart AS: surplus goods and short/poor shelf-life food retail.
- Matsentralen Norge: food-bank network redistributing surplus food from the food industry to non-profit organisations.
- Matvett AS: food-waste agreement and industry coordination actor.
- Oda Norway AS: online grocery distribution actor with an actor-primary food-waste page.
- TotalCtrl AS: inventory/expiry-date and food-waste software support actor.
- Havaristen AS: surplus-lot and date-goods retailer with food and drink categories.
- KuttMatsvinn Servering / KuttMatsvinn2030: program/context row for serving/canteen-sector food-waste reduction.
- Bransjeavtalen om reduksjon av matsvinn: national agreement context row.
- NORSUS matsvinn research: research/context row for mapping and method support.

## Strongest Findings

Too Good To Go, Holdbart, Matsentralen Norge and Matvett have the strongest CAR-004 registry fit because they combine Brreg identity with an actor-primary or public source that directly describes the food-waste mechanism.

Matsentralen has a usable annual-report source for redistributed tonnes and meals in 2024, but CAR should preserve this as network redistribution output, not national avoided-food-waste coverage.

Oda has actor-primary food-waste wording and Brreg identity, but its food-waste percentage should be preserved with denominator and date context before comparison to sector baselines.

TotalCtrl and Havaristen are good candidate-enrichment rows. They have strong mechanism evidence, but their impact, customer or supplier-stream claims need separation before verified export.

The Bransjeavtalen and KuttMatsvinn rows are context/program rows. They help explain the ecosystem but should not be counted as producer, retailer or redistribution capacity.

## Key Gaps

- Too Good To Go Norway-specific saved-meal and partner metrics were not imported.
- Holdbart avoided-waste tonnage, supplier mix and outlet-level coverage need primary KPI or annual-report sources.
- Matsentralen local member rows may be useful later, but this batch keeps the national umbrella separate from regional food-bank entities.
- Oda's metric should not be compared with grocery-sector averages without matching definitions.
- HORECA, municipal and school/kindergarten prevention examples remain incomplete beyond KuttMatsvinn and TotalCtrl support rows.

## Import Recommendation

Ready for verified import after final dedupe:

- `car-no-too-good-to-go-norge-as`
- `car-no-holdbart-as`
- `car-no-matsentralen-norge`
- `car-no-matvett-as`

Candidate enrichment/context:

- `car-no-oda-norway-as`
- `car-no-totalctrl-as`
- `car-no-havaristen-as`
- `car-no-kuttmatsvinn-servering`
- `car-no-bransjeavtale-matsvinn`
- `car-no-norsus-matsvinn-research`

## Ikke-Si Rules Added By This Batch

- Do not turn national food-waste targets into achieved reductions.
- Do not use app/global saved-meal figures as Norway-specific outcomes without a Norway-specific KPI source.
- Do not treat redistributed tonnes as total avoided food waste or complete national coverage.
- Do not compare food-waste percentages unless denominator, year and scope match.
- Do not count context programs as direct actor output.

# Wageningen Validation Sprint Ask Pack 2026-05-26

**Status:** Internal owner-ask pack
**Purpose:** Turn Wageningen gates into concrete Food TG validation asks.

## Sprint Rule

The sprint validates gates, not conclusions. A candidate can move forward only when source locator, data owner, legal end use, food/feed safety, system boundary, off-taker and claim state are explicit.

## Owner Asks

| Ask | Owner to identify | Candidate | Exact question | Evidence required |
|---|---|---|---|---|
| Source locator closure | Food citation owner | All | Is SRC-B-035 the correct Wageningen anchor for the method table and scorecard? | Page/table/figure locator and claim IDs |
| Okara/BSG raw stream | Raw material owner | B1 | What is the stream volume, moisture, current destination, stabilization need and food/feed status? | Actor data or source-backed note |
| Okara/BSG buyer | Food TG / industry contact | B1 | Who could buy or use a food/ingredient output, and under what quality requirements? | Named off-taker or explicit no-off-taker |
| Matsvinn baseline | Matvett/TGTG/operator | B2 | Where does edible value drop by category, time window and destination? | Baseline, category, time window, destination, counterfactual |
| Matsvinn intervention | Operator/data owner | B2 | Which routine or data signal changes the destination before rest fraction? | Measurable routine change and data owner |
| Nutrient product status | Utility/biorest owner | B3 | What is the product status, N/P/K balance, contaminant gate and market? | Product declaration, mass balance, legal status |
| Insect substrate legality | Mattilsynet/EU/EEA owner | A/B | Which substrates are green, yellow or red under current rules? | Legal source, date and substrate list |
| Feed buyer requirements | Feed/seafood actor | A/B | What quality, cost, LCA and regulatory evidence is needed before purchase? | Buyer requirements or rejection reason |

## Sprint Exit Criteria

| Exit state | Meaning |
|---|---|
| Advance | Gate evidence is sufficient for internal scoped next step. |
| Continue caveated | Evidence exists, but one or more external-use gates remain open. |
| Hold | Key gate is missing: source, law, safety, off-taker, data owner or system boundary. |
| Reject for now | Candidate conflicts with law, safety, economics, or project scope. |

## Required Return Format

Each owner response must include:

- date
- person or source
- candidate ID
- answered ask
- evidence attachment or locator
- claim impact: advance, continue caveated, hold, or reject for now

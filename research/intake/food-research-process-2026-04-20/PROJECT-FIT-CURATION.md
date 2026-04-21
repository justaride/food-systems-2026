# Project Fit Curation

Generated: 2026-04-20

- Batch: `food-research-process-2026-04-20`
- Input basis: `review.csv`, `FINAL-INTAKE-REPORT.md`, `contract-201-2503-P25013.md`, `src/lib/data/meetings.ts`
- Output shortlist: `project-fit-core-shortlist.csv`
- P2 extension: `PROJECT-FIT-P2-SYNTHESIS-LAYER.md`
- Method: three parallel subagent reviews across `03_Policy_Governance_And_Market`, `06_Company_And_Annual_Reports`, and `08_Food_Security_Agriculture_And_Seafood`

## Why this file exists

The intake batch is fully imported, but not every imported source should sit in the immediate working corpus for Food Systems 2026.

This curation step narrows the batch to the documents that best support the current WP3 mandate:

- policy recommendations
- resilience, self-sufficiency, and reduced import reliance
- retail / wholesale / logistics control points
- consumer trust, transparency, and governance quality
- operator-side evidence for how food-system constraints actually work in practice

## Snapshot

| Metric | Count | Notes |
| --- | ---: | --- |
| Imported documents in batch | 225 | From `import-summary.json` |
| P1 documents in current review matrix | 69 | Existing priority signal from `review.csv` |
| Immediate core shortlist | 17 | First-wave reading and synthesis pack |
| Core support shortlist | 17 | Second-wave support for the same tracks |
| Total curated core shortlist | 34 | Detailed in `project-fit-core-shortlist.csv` |

## Filter logic

The curation uses the current Food Systems 2026 scope, not a generic food-systems lens.

Primary fit criteria:

1. Helps explain where control, risk, and bottlenecks actually sit in the Nordic food system.
2. Strengthens the June whitepaper's policy, governance, market-structure, and resilience argument.
3. Gives concrete evidence on retail, wholesale, logistics, HORECA, producer access, or food-security mechanics.
4. Improves Nordic comparison value across Norway, Sweden, Denmark, Finland, and Iceland.

What this batch is strongest on:

- governance, competition, and market structure
- operator evidence from major retailers and distribution actors
- food preparedness, self-sufficiency, and resilience framing

What the original core shortlist is weaker on:

- explicit side-stream valorization
- nutrient recovery
- alternative feed
- fermentation / upcycling case depth

That weaker area is not a flaw in the curation. It is a real signal about the contents of this intake batch. For those themes, the stronger follow-on corpus is mostly in the batch's P2 folders:

- `04_Food_Waste_And_Circularity`
- `05_Foodtech_Alt_Protein_And_Innovation`
- `07_Academic_Research_And_Theses`

That is no longer only a future note. The first-wave P2 import / relink now gives the batch a usable extension layer, especially on side-stream valorization and redistribution. Use `PROJECT-FIT-P2-SYNTHESIS-LAYER.md` and `project-fit-p2-synthesis-layer.csv` as the bridge from the core shortlist into the transition-layer chapter.

## Important interpretation note

Some rows currently marked `skip` in `review.csv` are still included in the research shortlist.

That is intentional.

`skip` in this batch now mainly reflects typed-promotion workflow decisions such as duplicates or non-promotion choices. It does not automatically mean "irrelevant for research use."

## Immediate Core

These 17 documents should function as the first-wave working corpus for the June whitepaper and roadmap work.

### Policy / Market

- `Konkurransetilsynets Dagligvarerapport 2024-25`
- `Årsrapport for Dagligvaretilsynet 2024`
- `Dagligvaretilsynet - tildelingsbrev for 2026`
- `Utredning av funksjonelt og regnskapsmessig skille i verdikjeden for mat og dagligvarer`
- `Konkurransetilsynets marginstudie 2024 — Del 2: Kartlegging av marginer ved bruk av informasjon på produktnivå`
- `Samarbeidsklimaet i dagligvarebransjen for mindre lokalmat- og drikkeprodusenter 2025`

### Operator Evidence

- `NorgesGruppens års- og bærekraftsrapport 2024`
- `Bærekraft i ASKO 2024`
- `Reitan Retail Annual and Sustainability Report 2024`
- `Salling Group Annual Report 2024`
- `Environmental Footprint of the Food Saved by Too Good To Go`

### Resilience / Security

- `Matsikkerhet og beredskap på landbruksområdet`
- `Livsmedelsberedskap för en ny tid`
- `Scenarioanalyse av norsk jordbruk i 2050 med vekt på forholdet mellom kosthold, utslipp, import og matproduksjon`
- `Ikkje lett å bli klok på sjølvforsyning`
- `Importvernets påvirkning på konsentrasjonen i leverandørleddet`
- `Riksrevisjonens undersøkelse av kvotesystemet i kyst- og havfisket`

## Core Support

These 17 documents should stay close to the working corpus, but can come in after the immediate core has been loaded.

### Policy / Market

- `Dagligvare: Forskjeller i innkjøpspriser ytterligere redusert`
- `Utredning om prisjusteringsvinduer 2023`
- `Egne merkevarer (EMV) og innovasjon i dagligvare`
- `Forbyr praksis som motvirker konkurranse i dagligvaremarkedet`
- `Nye tiltak for bedre konkurranse i dagligvarebransjen`
- `Rapport om samarbeidsklimaet i dagligvarebransjen 2024`
- `Nordic Food Markets — A Taste for Competition`
- `Finnish Grocery Trade 2024`
- `Samkeppniseftirlitið Annual Report 2024`

### Operator Evidence

- `Kesko Annual Report 2024`
- `Matsmart Års- och hållbarhetsredovisning 2024`
- `Cheffelo Årsredovisning & Hållbarhetsrapport 2025`

### Resilience / Security

- `Riksrevisjonens undersøking om reduksjon av klimagassutslepp frå jordbruket`
- `Milepæl for norsk beredskap`
- `Myndighetenes arbeid med fiskehelse og fiskevelferd i havbruksnæringen`
- `Norsk sjømatnæring – fra subsidiesluk til pengemaskin`
- `Matkjedene skviser bonden`

## What stays outside the immediate core

Not dropped, just deferred:

- older Too Good To Go impact reports
- indirect investor/property reports with high overlap, especially the `cibus_*` files
- browser-printed or press-wrapper captures with weaker analytical value
- older or duplicated annual reports when a fresher version already exists
- narrow transaction or thesis cases that are useful later but not first-wave anchors

## Working conclusion

This batch should be treated as a strong `governance + resilience + operator evidence` corpus with a usable second-layer transition extension.

It is still not a complete circular-food transition corpus on its own. The weakest area remains system-scale commercialization, Norway-specific deployment metrics, and fermentation / scale-up proof.

The clean working sequence now is:

1. load the 17 immediate-core documents first
2. use the 17 support documents for chapter completion and Nordic comparison
3. use the first-wave P2 synthesis to write the transition layer on side-streams, nutrient loops, alternative feed, and scale barriers

## Recommended next operational step

Use `project-fit-core-shortlist.csv` as the loading order for the next synthesis pass, then use `PROJECT-FIT-P2-SYNTHESIS-LAYER.md` as the transition-layer bridge. The cleanest structure for that pass is:

1. Governance and market structure
2. Operator control points and logistics
3. Resilience, self-sufficiency, and import dependence
4. Transition layer: redistribution / hierarchy first, then nutrient loops and alternative feed, then fermentation and scale-up caveats

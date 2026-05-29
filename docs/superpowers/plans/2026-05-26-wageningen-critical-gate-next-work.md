# Wageningen Critical Gate Next Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Wageningen critical-gate analysis into a controlled Food TG working process: source locators, scorecards, claim-lock deltas, validation sprint asks, and safe publication language.

**Architecture:** Keep this as a documentation and evidence-control pass first. Do not change app data, UI, or source code until the Markdown control artifacts prove which Wageningen components should move into active Food TG surfaces. Treat WUR as internal gate/scoring language, not as external validation.

**Tech Stack:** Markdown control docs, local WUR PDF, `rg`, `pdftotext`, `pdfinfo`, `git diff --check`, existing Food TG claim-lock/register docs.

---

## Work Boundaries

This plan executes the next work after `docs/project/mandates/wageningen-critical-gate-analysis-2026-05-26.md`.

Do not:

- mark Wageningen as externally validated
- call any candidate pilot-ready
- convert WUR score into effect, LCA, adoption, or KPI proof
- edit app files under `src/` in this pass
- delete or clean the untracked `food-systems-transfer-review-package-2026-05-26/`

Use this wording as the controlling status:

> Wageningen/Elbersen 2022 is accepted as internal Food TG gate and scoring language. External method claims, pilot claims and KPI claims remain blocked or caveated until source locators, Food claim links and Nordic validation gates are closed.

## File Map

Create:

- `docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md`
  Records exact WUR PDF locators, report-page/PDF-page mapping, and source-use boundaries.

- `docs/project/mandates/wageningen-scorecard-template-2026-05-26.md`
  Defines the reusable 16-indicator scorecard format and mandatory red-gate fields.

- `docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md`
  Applies the scorecard qualitatively to the first four candidates: okara/BSG, matsvinnkvalitet, nutrient loops, insect protein after substrate gate.

- `docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md`
  Shows how the scorecards affect `CL-B-008`, `CL-B-009`, `CL-B-021`, `CL-B-022`, `CL-B-023`, and `CL-C-015` without directly rewriting the canonical claim-lock table yet.

- `docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md`
  Converts the blocked/caveated gates into owner asks for Food TG validation.

Modify only if the new docs are complete and verified:

- `docs/project/mandates/README.md`
  Add links to the new Wageningen control artifacts if the README exists and follows a document-index pattern.

## Task 1: Preflight And Source Locator Ledger

**Files:**
- Create: `docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md`
- Read: `docs/project/mandates/wageningen-critical-gate-analysis-2026-05-26.md`
- Read: `docs/project/mandates/source-shortlist-food-tg.md`
- Read: `research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf`

- [ ] **Step 1: Confirm repo state**

Run:

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git status --short --branch
```

Expected: tracked files are either clean or only contain intentional current-session edits. The untracked transfer package may remain visible.

- [ ] **Step 2: Confirm WUR PDF identity**

Run:

```bash
pdfinfo research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf | sed -n '1,80p'
```

Expected: PDF exists, has 49 pages, and identifies the Wageningen Food & Biobased Research Report 2247 metadata.

- [ ] **Step 3: Extract exact locator snippets**

Run:

```bash
pdftotext research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf - | rg -n -C 2 "Circular Evaluation Framework|16 indicators|Ladder van Moerman|food over feed|Decision tree|Accra|Ghana|Profitability|implementation"
```

Expected: output includes the four-domain/16-indicator framework, Moerman ladder, food-over-feed hierarchy, decision tree, and Accra/Ghana benchmark.

- [ ] **Step 4: Create the source locator ledger**

Create `docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md` with this structure:

```markdown
# Wageningen Source Locator Ledger 2026-05-26

**Status:** Internal source-locator ledger
**Use:** Supports Food TG internal gate/scoring work. Does not close external validation.

## Source Identity

| Field | Value |
|---|---|
| Source ID | SRC-B-035 |
| Local file | research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf |
| DOI | https://doi.org/10.18174/563389 |
| Report | Elbersen et al. 2022, Wageningen Food & Biobased Research Report 2247 |
| Local availability | PDF present locally; research PDFs are not expected to be committed if ignored |

## Locator Table

| Topic | Locator | Food TG use | Boundary |
|---|---|---|---|
| Circular Evaluation Framework | PDF pages 9-10 / report pages 7-8 | Internal 16-indicator scorecard | Not effect proof |
| Moerman ladder | PDF page 17 / report page 15 | Food biomass hierarchy prompt | Not universal ranking |
| Component hierarchy | PDF page 21 / report page 19 | Fraction-specific gate | Heuristic, not final LCA |
| Implementability | PDF pages 14-15 / report pages 12-13 | Adoption gate | Needs Nordic validation |
| Decision tree | PDF pages 37-38 / report pages 35-36 | Validation sprint workflow | Not automatic implementation approval |
| Accra/Ghana case | PDF pages 23-27 / report pages 21-25 | Benchmark for system-value vs profitability | Not Nordic proof |
| Costa Rica case | PDF pages 28-30 / report pages 26-28 | Benchmark for regulatory blockage | Not Nordic proof |
| Dutch protein cases | PDF pages 31-36 / report pages 29-34 | Benchmark for functionality and policy conflicts | Not Nordic proof |

## Required Citation Rule

Any future Food TG prose using Wageningen must include:

- the exact source locator
- the Food claim ID or scorecard row it supports
- the caveat state: internal, caveated external, or blocked
- the Nordic validation gate still open
```

- [ ] **Step 5: Verify locator ledger**

Run:

```bash
rg -n "SRC-B-035|PDF pages 9-10|Moerman|Component hierarchy|Decision tree|Not Nordic proof|Not effect proof" docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md
git diff --check -- docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md
```

Expected: all required anchors appear; `git diff --check` exits 0.

## Task 2: Create The Reusable Wageningen Scorecard Template

**Files:**
- Create: `docs/project/mandates/wageningen-scorecard-template-2026-05-26.md`
- Read: `docs/project/mandates/wageningen-critical-gate-analysis-2026-05-26.md`
- Read: `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`

- [ ] **Step 1: Create the scorecard template**

Create `docs/project/mandates/wageningen-scorecard-template-2026-05-26.md` with this structure:

```markdown
# Wageningen Scorecard Template 2026-05-26

**Status:** Internal Food TG scoring template
**Rule:** A score is a decision-support signal, not a claim of effect.

## Candidate Header

| Field | Required value |
|---|---|
| Candidate ID | B1, B2, B3, or A/B |
| Candidate name | Concrete stream or candidate |
| Current destination | Documented status quo |
| Proposed alternative | Proposed higher-value or circular route |
| Geography | Country, region or actor context |
| Source anchors | SRC/EV/claim IDs and file locators |
| Current claim state | Candidate, benchmark, internal-only, caveated, or blocked |

## 16-Indicator Score

Use -2, -1, 0, +1, +2. Use `blocked` when the indicator cannot be scored without a missing gate.

| Domain | Indicator | Score | Rationale | Source / missing gate |
|---|---|---:|---|---|
| Circularity | Functionality used |  |  |  |
| Circularity | Biomass utilization efficiency |  |  |  |
| Circularity | Possibility of reuse |  |  |  |
| Circularity | Land sparing |  |  |  |
| Socio-economic | Value added |  |  |  |
| Socio-economic | Profitability |  |  |  |
| Socio-economic | Job creation |  |  |  |
| Socio-economic | Rural development |  |  |  |
| Environmental | GHG mitigation |  |  |  |
| Environmental | Soil quality |  |  |  |
| Environmental | Biodiversity |  |  |  |
| Environmental | Water / air quality |  |  |  |
| Implementability | Technology development |  |  |  |
| Implementability | Infrastructure |  |  |  |
| Implementability | Enabling policy |  |  |  |
| Implementability | Regulations, subsidies, standards |  |  |  |

## Red Gates

| Gate | State | Required closure evidence |
|---|---|---|
| Food safety | open | Mattilsynet/fagekspert or source-backed safety assessment |
| Legal end use | open | Law/regulation/source locator |
| LCA/system boundary | open | Boundary, functional unit, substitution assumption |
| Off-taker | open | Named buyer/user or explicit no-off-taker state |
| Logistics/stabilization | open | Storage, shelf life, transport, process owner |
| Data owner | open | Named data owner and update path |
| Claim lock | open | Claim ID and allowed/caveated/blocked state |

## Output Decision

| Output | Allowed wording |
|---|---|
| Internal use |  |
| External with caveat |  |
| Hold back |  |
| Next validation ask |  |
```

- [ ] **Step 2: Verify no blank scorecard is mistaken for completed scoring**

Run:

```bash
rg -n "A score is a decision-support signal|Use `blocked`|Red Gates|Hold back|Next validation ask" docs/project/mandates/wageningen-scorecard-template-2026-05-26.md
git diff --check -- docs/project/mandates/wageningen-scorecard-template-2026-05-26.md
```

Expected: template warnings and gates are present; diff check exits 0.

## Task 3: Score The First Four Candidate Areas Qualitatively

**Files:**
- Create: `docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md`
- Read: `docs/project/mandates/decision-memo-food-tg-scope.md`
- Read: `docs/project/mandates/track-brief-b-sidestreams-nutrients.md`
- Read: `docs/project/mandates/track-brief-c-adoption.md`
- Read: `docs/project/mandates/dossier-b-process-sidestreams-okara-bsg.md`
- Read: `docs/project/mandates/dossier-b-marine-nutrient-loops.md`
- Read: `docs/project/mandates/food-tg-case-to-claim-index-2026-05.md`

- [ ] **Step 1: Confirm candidate source coverage**

Run:

```bash
rg -n "okara|bryggerimask|BSG|matsvinnkvalitet|RecoLab|struvitt|biorest|insektprotein|substratgate|CL-B-021|CL-B-022|CL-B-023" docs/project/mandates
```

Expected: each candidate has at least one existing Food TG mandate/source surface to cite.

- [ ] **Step 2: Create qualitative scorecards**

Create `docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md` with:

```markdown
# Wageningen Initial Candidate Scorecards 2026-05-26

**Status:** Internal qualitative pre-screen
**Rule:** Scores are not effect claims. They identify which validation asks must be closed next.

## Summary Ranking

| Candidate | Internal priority | Reason | Publication state |
|---|---|---|---|
| B2 matsvinnkvalitet | 1 | Best fit for fast adoption test if baseline, time window, destination and counterfactual can be documented. | Caveated internal candidate |
| B1 okara/BSG | 2 | Strong clean-stream logic, but food-grade, stabilization, buyer and Nordic volume remain open. | Internal candidate |
| B3 nutrient loops | 3 | Strong benchmark value, but heavy infrastructure and product-status gates make it secondary. | Benchmark/secondary track |
| A/B insect protein | 4 | Strategically strong but blocked until legal substrate and food/feed safety gates close. | Blocked pending substrate gate |

## Candidate B1: Okara / Brewers Spent Grain

| Domain | Indicator | Score | Rationale | Source / missing gate |
|---|---|---:|---|---|
| Circularity | Functionality used | +1 | Clean process side streams may move above feed/biogas if used as food or ingredient. | CL-B-021; food-grade gate open |
| Circularity | Biomass utilization efficiency | blocked | Nordic batch volume, moisture, loss and stabilization data are not closed. | raw material owner data needed |
| Circularity | Possibility of reuse | 0 | Once converted to ingredient, reuse potential is limited but value may be retained. | needs product design |
| Circularity | Land sparing | blocked | Substitution effect depends on what ingredient or feed is displaced. | LCA/system boundary needed |
| Socio-economic | Value added | +1 | Ingredient route could create higher value than feed/biogas. | buyer/off-taker open |
| Socio-economic | Profitability | blocked | Stabilization, logistics and testing costs are unknown. | cost model needed |
| Socio-economic | Job creation | 0 | No evidence yet for jobs beyond existing processing. | actor validation needed |
| Socio-economic | Rural development | 0 | Geography and actor base are not fixed. | candidate actor needed |
| Environmental | GHG mitigation | blocked | Depends on avoided treatment, substituted product and transport. | LCA gate open |
| Environmental | Soil quality | 0 | Food/ingredient use does not directly return nutrients to soil. | caveat |
| Environmental | Biodiversity | blocked | No source-backed biodiversity pathway. | hold back |
| Environmental | Water / air quality | blocked | No source-backed water/air pathway. | hold back |
| Implementability | Technology development | +1 | Drying/stabilization and ingredient use are technically plausible. | process validation needed |
| Implementability | Infrastructure | blocked | Need owner, stabilization location, cold/dry chain and buyer. | logistics gate open |
| Implementability | Enabling policy | 0 | No explicit enabling policy identified. | legal check needed |
| Implementability | Regulations, subsidies, standards | blocked | Food/feed status and safety rules must be confirmed. | Mattilsynet/legal gate |

**Decision:** Keep as internal candidate. Do not call pilot-ready.

## Candidate B2: Matsvinnkvalitet In Retail/HORECA

| Domain | Indicator | Score | Rationale | Source / missing gate |
|---|---|---:|---|---|
| Circularity | Functionality used | +2 | Keeping edible food in human consumption is high in the cascade. | CL-B-022 |
| Circularity | Biomass utilization efficiency | blocked | Need baseline, category, time window, destination and counterfactual. | operator data needed |
| Circularity | Possibility of reuse | +1 | Earlier intervention preserves food value before rest treatment. | routine/data gate |
| Circularity | Land sparing | blocked | Depends on avoided replacement production. | LCA boundary needed |
| Socio-economic | Value added | +1 | Reduced waste and retained edible value may improve system value. | financial owner data needed |
| Socio-economic | Profitability | blocked | App/routine/labour economics unknown. | operator validation |
| Socio-economic | Job creation | 0 | No job claim supported. | hold back |
| Socio-economic | Rural development | 0 | Not a rural development claim. | hold back |
| Environmental | GHG mitigation | blocked | Plausible but requires baseline and substitution. | LCA/source gate |
| Environmental | Soil quality | 0 | Not a nutrient-return claim. | caveat |
| Environmental | Biodiversity | blocked | No direct evidence. | hold back |
| Environmental | Water / air quality | blocked | No direct evidence. | hold back |
| Implementability | Technology development | +1 | Data/routine tools are available, but impact must be measured. | actor validation |
| Implementability | Infrastructure | +1 | Retail/HORECA operations already exist; measurement and destination tracking remain open. | operator data |
| Implementability | Enabling policy | +1 | Matsvinnlaw and food waste policy direction support prevention. | legal status caveat |
| Implementability | Regulations, subsidies, standards | 0 | Donation/safety practices must be checked per operator. | legal/food safety gate |

**Decision:** Highest-priority validation candidate. Still not documented effect.

## Candidate B3: Nutrient Loops / RecoLab / Biorest / Struvite

| Domain | Indicator | Score | Rationale | Source / missing gate |
|---|---|---:|---|---|
| Circularity | Functionality used | +1 | Nutrient recovery retains N/P/K value when higher food/feed routes are not realistic. | CL-B-023 |
| Circularity | Biomass utilization efficiency | blocked | Need mass balance and product-status data. | N/P/K gate |
| Circularity | Possibility of reuse | +1 | Nutrients can re-enter soil systems if product status and market are valid. | product/market gate |
| Circularity | Land sparing | blocked | Fertilizer substitution needs defined baseline. | LCA/system boundary |
| Socio-economic | Value added | 0 | Value depends on product market and infrastructure cost. | market gate |
| Socio-economic | Profitability | blocked | Heavy infrastructure economics are not closed. | cost/owner data |
| Socio-economic | Job creation | 0 | No job claim supported. | hold back |
| Socio-economic | Rural development | 0 | Possible but unsupported for current Food TG use. | hold back |
| Environmental | GHG mitigation | blocked | Depends on avoided fertilizer, methane, transport and treatment. | LCA gate |
| Environmental | Soil quality | +1 | Potential soil/nutrient value if contaminants and product status are controlled. | contaminant gate |
| Environmental | Biodiversity | blocked | No direct evidence. | hold back |
| Environmental | Water / air quality | +1 | May reduce nutrient loss if system works. | local evidence needed |
| Implementability | Technology development | +1 | Existing benchmarks show technical feasibility. | transferability gate |
| Implementability | Infrastructure | -1 | Heavy infrastructure makes this weak as first lightweight pilot. | owner/infrastructure gate |
| Implementability | Enabling policy | 0 | Policy fit varies by jurisdiction and product status. | legal gate |
| Implementability | Regulations, subsidies, standards | blocked | Fertilizer, sludge, contaminant and product rules must be closed. | Mattilsynet/legal gate |

**Decision:** Use as benchmark and secondary track, not first pilot.

## Candidate A/B: Insect Protein After Legal Substrate Gate

| Domain | Indicator | Score | Rationale | Source / missing gate |
|---|---|---:|---|---|
| Circularity | Functionality used | +1 | Legal safe side streams to feed protein could move biomass above lower-value use. | CL-A-021 |
| Circularity | Biomass utilization efficiency | blocked | Depends on substrate, conversion rate and processing losses. | actor/source gate |
| Circularity | Possibility of reuse | 0 | Feed use is a terminal food-system route through animals/fish. | caveat |
| Circularity | Land sparing | blocked | Requires replacement assumptions against soy/fishmeal/other feed. | LCA gate |
| Socio-economic | Value added | +1 | Potential high-value protein route. | buyer/cost gate |
| Socio-economic | Profitability | blocked | Maturity, cost and buyer requirements are not closed. | actor validation |
| Socio-economic | Job creation | 0 | No job claim supported. | hold back |
| Socio-economic | Rural development | 0 | Geography not fixed. | hold back |
| Environmental | GHG mitigation | blocked | Requires LCA by substrate and substituted feed. | LCA gate |
| Environmental | Soil quality | 0 | Frass may matter, but not scored until product status is known. | product/legal gate |
| Environmental | Biodiversity | blocked | No direct evidence. | hold back |
| Environmental | Water / air quality | blocked | No direct evidence. | hold back |
| Implementability | Technology development | 0 | Technology exists, but maturity varies by actor and substrate. | actor validation |
| Implementability | Infrastructure | blocked | Need legal substrate supply, processing capacity and buyer. | actor/owner gate |
| Implementability | Enabling policy | 0 | Policy interest exists, but legal scope limits use. | legal caveat |
| Implementability | Regulations, subsidies, standards | blocked | Substrate legality is first gate. | Mattilsynet/EU/EØS |

**Decision:** Block until legal substrate gate closes.
```

- [ ] **Step 3: Verify scorecard language**

Run:

```bash
rg -n "not effect claims|Publication state|Blocked pending substrate gate|Do not call pilot-ready|Highest-priority validation candidate|benchmark and secondary track|Block until legal substrate gate closes" docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md
git diff --check -- docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md
```

Expected: caveats and decisions are visible; diff check exits 0.

## Task 4: Create Claim-Lock Delta Without Rewriting Canonical Claim-Lock Yet

**Files:**
- Create: `docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md`
- Read: `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`
- Read: `docs/project/mandates/claim-register-food-tg.md`
- Read: `docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md`

- [ ] **Step 1: Create claim-lock delta**

Create `docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md` with:

```markdown
# Wageningen Claim-Lock Delta 2026-05-26

**Status:** Proposed delta, not canonical claim-lock rewrite
**Rule:** Use this before updating `food-tg-claim-lock-table-2026-05.md`.

## Delta Summary

| Claim | Current use | Wageningen effect | Delta decision |
|---|---|---|---|
| CL-B-008 | Kaskade and high-value use | Strengthens but narrows. No universal ranking. | Keep `klar-med-forbehold`; add component/system-boundary caveat. |
| CL-B-009 | Sidestream design requirements | Strengthens red-gate logic. | Keep as designgate; require WUR score before pilot lift. |
| CL-B-021 | First process sidestream pilot | Keeps as candidate. | Keep `krever-bekreftelse`; no pilot-ready wording. |
| CL-B-022 | Matsvinnkvalitet | Raises priority for validation sprint. | Keep caveated; require baseline, time window, destination and counterfactual. |
| CL-B-023 | Nutrient loops | Keeps as benchmark/secondary track. | Do not promote to first pilot without product status, market and mass balance. |
| CL-C-015 | KPI/data standard | Strengthens data-owner and system-boundary gate. | WUR score is internal signal only, not KPI effect. |

## Safe Canonical Edits For Later

If this delta is accepted, the later canonical claim-lock update should add this sentence to relevant rows:

> Wageningen/Elbersen score may support internal prioritisation, but it does not close effect, actor, legal, LCA, KPI or external validation gates.

## Hold-Back Rules

Do not write:

- "Wageningen score confirms pilot readiness"
- "WUR proves Nordic transferability"
- "Kaskade score equals climate effect"
- "A high score means external-use-ready"
```

- [ ] **Step 2: Verify claim-lock delta**

Run:

```bash
rg -n "Proposed delta|CL-B-008|CL-B-009|CL-B-021|CL-B-022|CL-B-023|CL-C-015|does not close effect|Hold-Back Rules" docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md
git diff --check -- docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md
```

Expected: all target claims and caveats are present; diff check exits 0.

## Task 5: Build Validation Sprint Ask Pack

**Files:**
- Create: `docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md`
- Read: `docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md`
- Read: `docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md`

- [ ] **Step 1: Create owner ask pack**

Create `docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md` with:

```markdown
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
| Insect substrate legality | Mattilsynet/EU/EØS owner | A/B | Which substrates are green, yellow or red under current rules? | Legal source, date and substrate list |
| Feed buyer requirements | Feed/sjømat actor | A/B | What quality, cost, LCA and regulatory evidence is needed before purchase? | Buyer requirements or rejection reason |

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
```

- [ ] **Step 2: Verify ask pack**

Run:

```bash
rg -n "validates gates, not conclusions|Source locator closure|Okara/BSG|Matsvinn baseline|Nutrient product status|Insect substrate legality|Sprint Exit Criteria|Required Return Format" docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md
git diff --check -- docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md
```

Expected: all asks and exit states are visible; diff check exits 0.

## Task 6: Add Index Links If Mandates README Supports It

**Files:**
- Modify: `docs/project/mandates/README.md`
- Read: `docs/project/mandates/README.md`

- [ ] **Step 1: Inspect README**

Run:

```bash
sed -n '1,220p' docs/project/mandates/README.md
```

Expected: README exists and contains a document index or related-control-doc section.

- [ ] **Step 2: Add Wageningen control links only if README has an index pattern**

If the README has a table/list of mandate control artifacts, add these rows or bullets:

```markdown
- `wageningen-critical-gate-analysis-2026-05-26.md` - decision note for WUR/Wageningen as internal gate/scoring language.
- `wageningen-source-locator-ledger-2026-05-26.md` - locator ledger for SRC-B-035 and WUR PDF use boundaries.
- `wageningen-scorecard-template-2026-05-26.md` - reusable internal 16-indicator scorecard template.
- `wageningen-initial-candidate-scorecards-2026-05-26.md` - first qualitative scorecards for B1, B2, B3 and A/B.
- `wageningen-claim-lock-delta-2026-05-26.md` - proposed claim-lock implications before canonical update.
- `wageningen-validation-sprint-ask-pack-2026-05-26.md` - owner asks and exit states for validation.
```

If the README is not an index, skip the edit and record the skip in the final status.

- [ ] **Step 3: Verify README links if edited**

Run:

```bash
rg -n "wageningen-critical-gate|wageningen-source-locator|wageningen-scorecard-template|wageningen-initial-candidate-scorecards|wageningen-claim-lock-delta|wageningen-validation-sprint" docs/project/mandates/README.md
git diff --check -- docs/project/mandates/README.md
```

Expected if edited: all links appear; diff check exits 0.

## Task 7: Final Verification And Handoff

**Files:**
- Verify all files created or modified in this plan

- [ ] **Step 1: Check for dangerous wording**

Run:

```bash
rg -n "validated|pilotklar|external-ready|source-package closed|score confirms|proves Nordic|KPI effect|placeholder" docs/project/mandates/wageningen-*.md docs/project/mandates/README.md
```

Expected: any matches are either explicit hold-back warnings or safe status language. No placeholder text remains.

- [ ] **Step 2: Run diff hygiene**

Run:

```bash
git diff --check -- docs/project/mandates/wageningen-*.md docs/project/mandates/README.md
```

Expected: exits 0.

- [ ] **Step 3: Review changed files**

Run:

```bash
git status --short
git diff --stat -- docs/project/mandates/wageningen-*.md docs/project/mandates/README.md
```

Expected: only the planned Markdown files and optionally `docs/project/mandates/README.md` changed. The untracked transfer package may remain separate.

- [ ] **Step 4: Commit if requested**

Only commit if the user asks for commit/push:

```bash
git add docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md \
  docs/project/mandates/wageningen-scorecard-template-2026-05-26.md \
  docs/project/mandates/wageningen-initial-candidate-scorecards-2026-05-26.md \
  docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md \
  docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md \
  docs/project/mandates/README.md
git commit -m "docs: add wageningen validation workplan artifacts"
```

Expected: commit includes only intended files.

## Completion Criteria

The work is complete when:

- source locator ledger exists and identifies `SRC-B-035`
- reusable scorecard template exists
- four initial candidate scorecards exist with caveats
- claim-lock delta exists without rewriting canonical claim-lock prematurely
- validation sprint ask pack exists
- README links are added or explicitly skipped
- dangerous wording and diff hygiene checks pass

## Next Session Start Command

Use this exact command sequence to resume:

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git status --short --branch
sed -n '1,230p' docs/superpowers/plans/2026-05-26-wageningen-critical-gate-next-work.md
sed -n '1,230p' docs/project/mandates/wageningen-critical-gate-analysis-2026-05-26.md
```

---
tittel: Nordic systems spine — cell codebook (C1–C3)
dato: 2026-09-04
status: frozen for implementation
gate: internal
scope: WP3 Nordic comparison spine — definitions only; no external claims
kanonisk_status: ../status/food-systems-completion-register-2026-07-15.md
gapregister: ../../../research/_status/information-gap-register-2026-08-11.jsonl
operativ_plan: ../mandates/gap-closure-operating-plan-2026-08-11.md
relatert: Bane D (IG-009, IG-010, IG-011)
---

# Nordic systems spine — cell codebook (C1–C3)

## Purpose

Freeze **three** Nordic comparison cells so Food Systems 2026 can build a
country-by-country spine without another Norway actor census. This document is
the definition contract for schema models `NordicCell`, `NordicIndicatorRow`,
`ActivitySignal`, and `FlowCell`.

**Gate:** internal only. Partner readback, if any, is table-level validation —
not publication approval and not partner commitment.

## Non-goals (hard stop)

- No new Norway low-confidence actor breadth.
- No REKO/CSA, alt-protein, or public-procurement cells in v1.
- No interview / consent models (blocked on IG-005).
- No bitemporal ownership layer (IG-013 remains parked).
- No filling True-C holes with proxies.
- No upgrade of rows to `citable_external` in this workstream.

## Countries in scope (v1)

| Code | Country |
|---|---|
| NO | Norway |
| SE | Sweden |
| DK | Denmark |
| FI | Finland |
| IS | Iceland |

Sápmi and autonomous areas (Greenland, Faroes, Åland) are **out of scope for
v1 indicator rows**. They may appear in narrative / True-C notes only.

## Shared enums

### `quality`

| Value | Meaning |
|---|---|
| `measured` | Observed / reported quantity with locator |
| `modelled` | Derived with explicit method |
| `capacity` | Installed / licensed capacity, not throughput |
| `plan` | Policy or project target |
| `potential` | Theoretical max; not realized |
| `unknown` | In scope but no usable figure; use `holeReason` |

### `partnerStatus` (indicator rows)

`internal` → `sent` → `reviewed` | `disputed`

## C1 — `retail-concentration`

**Title:** Grocery retail concentration (CR3 / HHI / top-3 margins)

**WP3 use:** Who can block or enable transition in the consumer market; Nordic
power asymmetry without pretending operational DB parity.

**Inclusion:** National grocery retail (dagligvare / grocery banners). Exclude
pure HoReCa cash-and-carry unless the national HHI method already includes them
— then document in `methodId`.

**Period rule:** CR3/HHI = calendar year. Margins = latest completed FY; store
the FY label year in `year` and method note.

**Indicators**

| indicatorId | Unit | methodId (examples) |
|---|---|---|
| `cr3` | percent | `retail-cr3-v1` |
| `hhi` | index | `retail-hhi-v1` |
| `margin_top1` / `margin_top2` / `margin_top3` | percent | `retail-opmargin-fy-v1` |
| `margin_banner_<slug>` | percent | `retail-opmargin-fy-v1` |

Reuse existing CountryMetric / citable HHI method notes where they exist. Do
**not** invent a new Norwegian HHI in the schema PR.

**True-C / known holes:** Incomplete IS retailer panel (e.g. Samkaup margin);
FX / unitScale mismatches until financial rows carry explicit `unitScale`.

## C2 — `seafood-residue-flow`

**Title:** Aquaculture residue / sludge flow

**WP3 use:** Circular flagship; “what is measured vs lost to fjord” as policy
insight (IG-011).

**System boundary (default):** Marine/land aquaculture production sites →
sludge/residue generation → collection → treatment / land application / other
sink. Feed and harvested biomass are **out** unless needed as denominator.

**Period rule:** Calendar year.

**Flow nodes (fromNode / toNode examples):**
`aquaculture_site`, `sludge_generated`, `sludge_collected`, `treatment`,
`land_application`, `fjord_loss`, `unknown_sink`.

**Substances:** `mass`, `N`, `P` (K optional).

**True-C:** Per-site realized sludge mass balance is often unmeasured in NO —
document as dated `unknown` + `holeReason`, do not proxy from capacity.

## C3 — `food-waste-digestate`

**Title:** Food waste → digestate nutrient loop

**WP3 use:** Household/municipal circular loop comparable across Nordics.

**System boundary (default):** Household + municipal food-waste collection →
biogas / AD → digestate → land application. Industrial food-waste only if the
national series cannot separate — then flag in method.

**Period rule:** Calendar year.

**Flow nodes:** `household_municipal_waste`, `collection`, `biogas_ad`,
`digestate`, `land_application`, `incineration_or_other`, `unknown_sink`.

**Substances:** `mass`, `N`, `P`, `K`.

**True-C:** Harmonized digestate N/P/K return often missing — leave empty with
reason; SE SPCR-style references are method notes, not NO fills.

## ActivitySignal (shared)

Use for “active in year Y” style facts tied to entities already in DB
(company / producer / site). Domains for this spine: `seafood`, `retail`,
`waste`. Confidence `high|mid|low`. Prefer open registers; stop if this becomes
actor hunting.

## Utilization (after fill — out of scope for schema PR)

1. Internal comparison brief for roadmap / phase-0.
2. Internal `/nordic` or landscape extension with hole labels.
3. Partner A4 tables only after rights gate (IG-005) if leaving the team.

## Exit criteria for “codebook frozen”

- [x] Three stable `cellId` values
- [x] Country set and non-goals explicit
- [x] Quality enum and True-C rules stated
- [ ] Schema models merged on `main` (this PR)
- [ ] First fill pass leaves every country×indicator as value **or** dated hole

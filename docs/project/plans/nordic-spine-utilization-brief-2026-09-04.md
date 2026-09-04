---
tittel: Nordic spine utilization brief — internal comparison for roadmap / phase-0
dato: 2026-09-04
gate: internal
status: actionable for WP3 roadmap
related_codebook: docs/project/plans/nordic-spine-codebook-2026-09-04.md
pr: 388
branch: feat/nordic-spine-codebook-schema
ui_route: /nordic
---

# Nordic spine utilization brief (internal)

**Gate:** `internal`. No external claim upgrades. No partner A4 tables (IG-005).
No Norway actor-breadth expansion.

This brief turns the frozen C1–C3 codebook + local fills into an actionable
scoreboard for WP3 roadmap / phase-0. Numbers below are from the **local** DB
(`DATABASE_URL`) on 2026-09-04 — do not invent substitutes.

## Purpose of the C1–C3 spine

| Cell | `cellId` | WP3 use |
|---|---|---|
| C1 | `retail-concentration` | Who can block/enable consumer-market transition; Nordic power asymmetry without pretending operational DB parity |
| C2 | `seafood-residue-flow` | Circular flagship — what is measured vs lost (IG-011); sludge mass balance, not capacity |
| C3 | `food-waste-digestate` | Household/municipal food-waste → AD → digestate loop comparable across Nordics |

Shared ActivitySignal layer holds “active in year Y” facts (here: NO seafood
licensed capacity) without promoting capacity into FlowCell quantities.

## Country × cell scoreboard (local DB)

| Cell | Filled | Holes | Total | Notes |
|---|---:|---:|---:|---|
| C1 `NordicIndicatorRow` | **34** | **3** | **37** | Core + banner margins; holes only on FI/IS margin tops |
| C2 `FlowCell` | **0** | **20** | **20** | 5×4 edges, all `unknown` |
| C3 `FlowCell` | **2** | **18** | **20** | NO + SE inlet mass only |
| ActivitySignal (seafood) | **250** | — | **250** | `licensed_capacity_mtb` 2024; sum **988 478 t** TN-only |

NordicCell rows: three cells, status `frozen`.

## C1 — retail concentration

Source readback: `research/_status/nordic-c1-retail-concentration-readback-2026-09-04.md`.

| Country | HHI (2024) | CR3 % (2024) | margin_top1 | margin_top2 | margin_top3 |
|---|---:|---:|---|---|---|
| NO | 3327 | 96.6 | Rema 3.85 (2024) | NG 3.30 | Coop 1.00 |
| SE | 3339 | 88.1 | Axfood 4.01 (2025) | ICA 3.80 | Coop −0.84 |
| DK | 2642 | 87.0 | Salling 3.90 (2025) | REMA 3.36 | Coop −0.66 |
| FI | 3671 | 91.9 | Kesko 5.50 (2024) | SOK 3.50 | **hole** — fewer than 3 retailer margin rows |
| IS | 2378 | 76.5 | Hagar 5.78 (2024) | **hole** — panel incomplete (Samkaup) | **hole** — same |

CR3 remains `modelled` (sum of top-3 retailerShare). Do not treat as independently
audited market power without method notes.

## C2 — seafood residue / sludge flow

Source readback: `research/_status/nordic-c2-c3-flow-skeleton-readback-2026-09-04.md`.

All **5×4** mass edges are `unknown` with dated hole reasons (2024):

1. `aquaculture_site → sludge_generated`
2. `sludge_generated → sludge_collected`
3. `sludge_collected → treatment`
4. `treatment → unknown_sink`

**Important:** NO aqua licensed capacity (**250** signals / **988 478 t**) is an
`ActivitySignal` (`licensed_capacity_mtb`) — **not** sludge throughput and **not**
a C2 quantity. Capacity must not be copied into FlowCell.

## C3 — food waste → digestate

| Country | `household_municipal_waste → collection` | Downstream (collection→AD→digestate→land) |
|---|---|---|
| NO | **451 000 t** measured (foodWaste Totalt 2024; may include industry if series cannot separate) | holes |
| SE | **880 000 t** measured with method caveat: retail+consumer stage only (not full AD feedstock / not national Totalt) | holes |
| DK / FI / IS | holes (no absolute Totalt; per-capita not converted — would invent population) | holes |

Mass chain only in this pass — no N/P/K digestate rows yet.

## ActivitySignal

| domain | signalType | year | count | sum value |
|---|---|---:|---:|---:|
| seafood | licensed_capacity_mtb | 2024 | 250 | 988 478 t |

Readback: `research/_status/nordic-activity-aqua-no-readback-2026-09-04.md`.

## What this enables for roadmap / phase-0

- Internal country scan of retail power (C1) with explicit FI/IS margin holes.
- Visible True-C sludge and digestate gaps (C2/C3) for WP3 scoping — what must be
  measured vs what is already capacity-only.
- A single internal URL (`/nordic`) for hole-labeled matrices during planning.
- Clear separation: capacity signals ≠ circular mass flows.

## What this does **not** claim

- No `citable_external` upgrade of any row.
- No partner-validated tables; IG-005 still blocks leaving-the-team partner packs.
- No Norway actor census / breadth fill.
- No C2 sludge invented from MTB/TN capacity.
- No per-capita → national tonne conversion for food waste.
- No Sápmi / Greenland / Faroes / Åland indicator rows in v1.

## True-C / next fill priorities (no proxies)

1. **C2 NO** — measured sludge mass at site or national aggregate with locator (not capacity).
2. **C3 digestate loop** — collection→AD→digestate→land absolute tonnes (and later N/P/K) for at least one peer country with method parity notes.
3. **C1 FI `margin_top3` / IS `margin_top2–3`** — complete retailer operating-margin panel; leave hole until real FY figures exist.
4. **C3 DK/FI/IS inlet** — absolute national food-waste tonnes (Totalt or documented household+municipal series), never invented from per-capita × population.

## Governance

| Gate / IG | Status for this brief |
|---|---|
| External publication / claim upgrade | **Blocked** (IG-001 / IG-002 posture — stay internal) |
| Partner A4 tables | **Blocked** on IG-005 |
| This brief + `/nordic` | Internal working products only |

## Links

- PR: https://github.com/Natural-State/food-systems-2026/pull/388 (or org-equivalent #388)
- Branch: `feat/nordic-spine-codebook-schema`
- Codebook: `docs/project/plans/nordic-spine-codebook-2026-09-04.md`
- UI: `/nordic` (sidebar: Nordisk → Nordic spine)
- Readbacks:
  - `research/_status/nordic-c1-retail-concentration-readback-2026-09-04.md`
  - `research/_status/nordic-c2-c3-flow-skeleton-readback-2026-09-04.md`
  - `research/_status/nordic-activity-aqua-no-readback-2026-09-04.md`

---
tittel: Nordic C2/C3 FlowCell skeletons - local readback
dato: 2026-09-04
gate: internal
cells: seafood-residue-flow, food-waste-digestate
passes: nordic-c2-seafood-residue-2026-09-04, nordic-c3-food-waste-digestate-2026-09-04
---

# Nordic C2/C3 FlowCell skeletons - local readback

Internal FlowCell skeleton fill via
`scripts/backfill-nordic-c2-c3-flow-skeletons.ts`. No sludge invented from
capacity. No per-capita to national conversion. Gate: internal only.

## C2 - `seafood-residue-flow`

**System boundary:** Marine/land aquaculture sites -> sludge -> collection -> treatment/sink.

| Edge | Countries | Year | Quantity | Quality |
|---|---|---:|---|---|
| aquaculture_site -> sludge_generated | NO SE DK FI IS | 2024 | null | unknown |
| sludge_generated -> sludge_collected | NO SE DK FI IS | 2024 | null | unknown |
| sludge_collected -> treatment | NO SE DK FI IS | 2024 | null | unknown |
| treatment -> unknown_sink | NO SE DK FI IS | 2024 | null | unknown |

- Planned/written: **20** (5x4), all True-C holes
- NO metadata notes licensed TN/MTB capacity context only: **250 sites / ~988478 t** - **not** used as `quantity`

## C3 - `food-waste-digestate`

**System boundary:** Household+municipal food-waste -> biogas/AD -> digestate -> land.

| Country | Edge1 household_municipal_waste -> collection | Downstream (3 edges) |
|---|---|---|
| NO | **451000 t** measured (foodWaste Totalt 2024; may include industry if series cannot separate) | unknown holes |
| SE | **880000 t** measured (retailAndConsumerStageTotal 2024 - retail+consumer stage, not full AD feedstock / not national Totalt) | unknown holes |
| DK | unknown 2024 (no absolute Totalt; per-capita not converted) | unknown holes |
| FI | unknown 2024 | unknown holes |
| IS | unknown 2024 | unknown holes |

- Planned/written: **20** (5x4)
- Filled: **2** / Holes: **18**
- Mass chain only - no N/P/K digestate rows in this pass

## Local DB counts (after `--apply`)

| cellId | filled | holes | total |
|---|---:|---:|---:|
| seafood-residue-flow | 0 | 20 | 20 |
| food-waste-digestate | 2 | 18 | 20 |

Second `--apply` updated 40 / created 0 (idempotent via `metadata.pass`).

## Commands

```bash
npm run db:backfill:nordic-c2-c3:dry-run
npm run db:backfill:nordic-c2-c3:apply
```

## Next

- Prod waits on PR #388 merge + migrate.
- Do not fill C2 quantities from AquacultureSite capacity.
- Partner table-level readback only after IG-005 if leaving the team.

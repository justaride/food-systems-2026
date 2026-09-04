---
tittel: Nordic ActivitySignal NO aqua capacity - local readback
dato: 2026-09-04
gate: internal
pass: nordic-activity-aqua-no-2026-09-04
domain: seafood
signalType: licensed_capacity_mtb
---

# Nordic ActivitySignal NO aqua capacity - local readback

Thin capacity signals from existing `AquacultureSite` rows via
`scripts/backfill-nordic-activity-signals-aqua-no.ts`. Capacity is not production or
sludge. Gate: internal only.

## Inclusion

| Rule | Result |
|---|---|
| country = NO | yes |
| capacityTonnes IS NOT NULL | yes |
| capacityUnit IN (TN, MTB) | included (both treated as tonnes) |
| capacityUnit STK / DA | **excluded** |
| licenseStatus | require an exact active value (`aktiv`, `active`, `i drift`, `idriftsatt`, `in drift`); inactive or unknown fails closed (all 250 included TN were `aktiv`) |
| year | observation year 2024; `licenseIssuedYear` is retained only as metadata |

## Local DB counts (after apply)

| domain | signalType | year | count | sum value (t) |
|---|---|---:|---:|---:|
| seafood | licensed_capacity_mtb | 2024 | **250** | **988478** |

- Source AquacultureSite NO: 287
- Skipped STK: 35; skipped DA: 2
- Zero STK signals written
- Second apply: updated 250 / created 0 (idempotent via metadata.pass)

## Commands

See package.json nordic-activity-aqua scripts.

## Next

- Prod waits on PR merge and migrate.
- Do not use capacity signals as C2 FlowCell quantities.

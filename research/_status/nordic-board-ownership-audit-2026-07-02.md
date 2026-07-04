# Nordic board/ownership audit - WS3 control pass (2026-07-02)

## Scope

This pass controls the WS3 "Nordic board/ownership audit" gap for non-Norwegian companies. It scopes the existing AP-1/AP-5 graph logic to `SE`, `DK`, `FI`, and `IS` instead of the full NO-heavy DB.

Artifacts:

- Added `scripts/analyze-nordic-board-ownership.ts`
- Added package command `audit:nordic-board-ownership`
- Wrote `research/_status/nordic-board-ownership-audit-2026-07-02.json`

Rerun:

```bash
DATABASE_URL=... npm run audit:nordic-board-ownership
```

## Board interlock result

The imported non-Norwegian Nordic board graph is sparse but controlled:

| Metric | Result |
| :--- | ---: |
| Board seats | 118 |
| Distinct persons | 118 |
| Companies with board data | 14 |
| Scoped company universe | 61 |
| Board-company coverage | 22.95% |
| Companies with sector labels among board-covered companies | 14/14 |
| Interlockers (same person in >=2 scoped companies) | 0 |
| Cross-sector board bridges | 0 |

Interpretation: the current imported SE/DK/FI/IS board dataset does not support a board-interlock claim. This is a coverage-controlled negative finding, not proof that no such interlocks exist in the real world.

## Ownership/control result

Ownership/control has clearer structure:

| Metric | Result |
| :--- | ---: |
| Companies in ownership audit graph | 64 |
| Ownership edges touching scoped companies | 22 |
| Controlling edges | 21 |
| Companies in ownership graph | 32 |
| Controllers | 10 |
| Ultimate controllers | 9 |
| Cross-sector controllers | 4 |

Cross-sector controllers detected:

| Controller | Own sector | Controlled sectors | Controlled count | Ultimate in DB |
| :--- | :--- | :--- | ---: | :--- |
| Axel Johnson AB (SE) | retail | foodservice, logistics, retail, wholesale | 8 | yes |
| Axfood AB (SE) | retail | foodservice, logistics, retail | 5 | no |
| SOK (S Group) (FI) | retail | foodservice, retail | 1 | yes |
| Kesko Oyj (FI) | retail | foodservice, retail | 1 | yes |

Sector-pair signals:

| Sector pair | Controller count |
| :--- | ---: |
| foodservice <-> retail | 4 |
| foodservice <-> logistics | 2 |
| logistics <-> retail | 2 |
| foodservice <-> wholesale | 1 |
| logistics <-> wholesale | 1 |
| retail <-> wholesale | 1 |

## Claim boundaries

- Board interlocks: do not claim non-Norwegian Nordic board-person bridges from the current DB; the result is zero under imported data.
- Ownership: safe internal claim is structural footprint only: Axel Johnson/Axfood and the Finnish S/K groups span retail plus adjacent sectors in the imported ownership graph.
- Do not infer coordination, intent, unlawful conduct, or operational control beyond the script definition.
- Control definition is the AP-5 rule: `ownershipType = subsidiary` or `ownershipPct >= 50`; minority/JV rows are not counted as control.

## Verification

- `DATABASE_URL=... node --import=tsx scripts/analyze-nordic-board-ownership.ts` passed and wrote JSON artifact.
- `DATABASE_URL=... npm run audit:nordic-board-ownership` passed.
- `node --import=tsx --test tests/scripts/analyze-board-interlocks.test.ts tests/scripts/analyze-cross-holdings.test.ts tests/lib/graph-board-members.test.ts` passed: 4 tests.
- `npm run lint` passed.
- `npm run audit:research-artifacts -- --base=origin/main` passed: 0 violations across 3342 tracked files.
- `git diff --check` passed.

# CAR Batch 00 report - registry implementation setup

**Dato:** 2026-06-24
**Scope:** Implement initial Circular Food Actor Registry workspace, schema, promptpack, source log, candidate CSV and verified CSV.
**Regel:** No claims, no DB writes, no staging, no commits, no `safe_for_ai_context`.

## Summary

| Output | Path | Status |
|---|---|---|
| Schema and rules | `CAR-000-schema-and-rules.md` | created |
| Promptpack | `prompts/CAR-promptpack.md` | created |
| Source search log | `CAR-source-search-log.csv` | created |
| Candidate registry | `CAR-registry-candidates.csv` | seeded |
| Verified registry | `CAR-registry-verified.csv` | seeded conservatively |
| Decision log | `decisions/CAR-batch-00.jsonl` | created |
| Batch report | `reports/CAR-batch-00.md` | created |

## Decisions

| ID | Decision | Short verdict | Gate |
|---|---|---|---|
| CAR-001 | enrich | CAR schema/rules created as Norway-first registry control layer. | internal |
| CAR-002 | enrich | Existing local seeds consolidated into candidate CSV without claiming completeness. | source-shortlist |
| CAR-003 | enrich | Verified CSV seeded only from existing Brreg-backed identity rows. | verified |

## Source basis

Primary local seed surfaces used:

- `research/norge/circular-actors/brreg-validated.md`
- `research/bibliotek/sirkularitet/sirkulaer-selskaper-norge.md`
- `research/exa-circular-actors-2026-04-21.md`
- `research/intake/perplexity-2026-04-20/new-actors.json`
- `research/intake/perplexity-2026-04-20-runde2/new-actors.json`
- R12 actor and waste notes where already present in the worktree.

## Important caveats

- `CAR-registry-candidates.csv` is not a complete registry; it is an intake queue.
- `CAR-registry-verified.csv` verifies identity/register rows where the local Brreg note had org numbers; it does not verify impact claims.
- Nordic/global rows are context only in v1.
- Founders/key people were intentionally left blank in seeded rows until a dedicated CAR-010 pass sources them.

## Next recommended batch

Run `CAR-001`/`CAR-002` as a formal session if a separate session wants to re-check or expand the setup. Otherwise proceed to `CAR-003` for live/current Brreg validation of Norwegian candidate rows marked `needs_brreg`.

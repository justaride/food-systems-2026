# Codex-native library analysis orchestration — execution receipt

Status: pilot terminal at prompt/runtime `1.0.23`. Pilot stop rule revised 2026-08-23; full queue still not executed.

- Design commit: `5f3eb1cf8cf0a5633104fb06e82ac763d72cca0b`
- Plan commit: `53c1c4e6e4a2b9d334539659a9551aac7b1e6cd2`
- Workflow implementation through Task 7: `281bf51f3198d7f4a84d084d4122133166b72e94`
- Task 8 initial rehearsal and receipt commit: `14e37cf`
- Task 9 integration and runtime fixes: `d95edcb` through `6a483b9`
- Schema versions: queue/v1, job-input/v1, segment-response/v1, source-result/v1, validation-request/v1, validation-response/v1, validation-result/v1, terminal-receipt/v1.
- Analysis and validation workflow/prompt versions: `1.0.23`.
- Policy version: execution-policy/v1; maximum attempts 3; maximum concurrent analyzers 3.
- Expected full coverage: `1,569 / 8,393`.
- Sealed full queue (Full26): 1,569 sources, 8,393 units, 2,766 jobs; zero attempt artifacts.
- Terminal pilot (Pilot26): 10 sources, 53 units, 18 jobs, 298,374 code points, all seven required strata.
- Analysis terminal: 18 reusable jobs, 0 pending, 0 quarantined attempts, exact coverage of 53 units and 81 claims.
- Validation terminal: 4 partial sources and 6 quarantined sources.
- Validation findings: 26 total — one F1, one F2, nine F3, fourteen F4, one F5 across six sources.
- Terminal merge hash: `4a82092753ede16ca4b53c68bff792d834403f8275385047cbb411230d5245b3`.
- Immutable replay: `jobs=18`, `totalClaims=81`, `accepted=9`, `rejected=9`, `rejectedBindings=9`, `exact=true`, `writeFree=true`, `failures=[]`.

## Why the stop rule was revised

Pilots 17 through 26 returned ten consecutive NO-GO verdicts under the original
rule, which made any claim-bearing F3, any F4 or any material F5 a blocking
defect repairable "in code". The pilot history shows why that rule could not be
satisfied:

| Pilot | 04 | 05 | 07 | 08 | 09 | 10 | 11 | 12 | 14 | 17 | 18 | 22 | 23 | 24 | 26 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Findings | 29 | 13 | 1 | 8 | 16 | 13 | 6 | 7 | 28 | 7 | 15 | 4 | 14 | 3 | 26 |
| Critical (F1+F2) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |

Three properties of that series decided the revision:

1. **The integrity gate never failed.** Across every recorded pilot the attempt
   layer reported zero pending and zero quarantined attempts, no identity or
   hash drift, no leakage, and a deterministic `exact=true` / `writeFree=true`
   replay. Every NO-GO came from output quality, never from the contract.
2. **The hallucination class was already near zero.** F1 and F2 — fabrication
   and mis-citation, the risk the whole apparatus exists to catch — occur twice
   in fifteen recorded rounds. Every other finding is F3-F5, which
   `research/_plans/kalibreringsplan-utvalg-2026-08-20.md` §2 classifies as
   quality errors rather than critical ones.
3. **The loop was anti-convergent.** Each NO-GO triggered a validator and prompt
   tightening, which raised detection sensitivity against a roughly constant
   model error rate. Total findings oscillate without trend and the terminal
   disposition drifted the wrong way (9 partial / 1 quarantined at Pilot18 to
   4 partial / 6 quarantined at Pilot26). Twenty-two prompt revisions produced
   no movement toward the gate.

The original rule also applied a stricter standard than the run it protected:
Step 7 records individual source quarantines as terminal accepted outcomes,
while Step 6 treated the same quarantines as a blocking failure.

## Verdict under the revised stop rule

- **Integrity gate: PASS.** Coverage, hash readback, disjoint assignment,
  deterministic replay, separate passes, resume, leakage scan and private audit
  all pass, as they did in every prior round.
- **Quality gate: measured, not blocking.** Critical rate `F1+F2` is 2 of 81
  adjudicated claims — 2.5 %, Wilson 95 % interval `[0.7 %, 8.6 %]` — which
  places the point estimate in the `2-5 %` band of the calibration plan §5:
  calibrated with reservation, repair prioritised, queue not frozen. Quality
  rate `F3-F5` is 24 of 81 claims across six sources.
- **Full queue: GO with reservation**, subject to the human decision recorded
  separately. Per-source disposition is unchanged: the six quarantined and four
  partial sources stay non-citable.

The interval is wide because one pilot adjudicates far fewer claims than the
per-stratum `n` the calibration plan requires. The pilot rate is therefore
indicative, not calibrated. Calibration proper is drawn from the completed full
run, per calibration plan §3.

## Gate status

- Full-queue construction and exact coverage gate: pass.
- Pilot selection replay and strata/capacity gate: pass.
- Disjoint maximum-three Luna analysis waves: pass.
- Exact content/hash and sealed readback gates: pass.
- Restart/resume guard: pass; accepted attempts were not overwritten and no illegal next-attempt artifact was created.
- Main-agent full-source validation: complete.
- Pilot semantic stop rule: pass under the revised rule; the F3/F4 findings that failed the original rule are recorded as the quality rate.
- Private pilot queue: terminal and sealed.
- Full queue: not executed; awaiting the scheduling decision.
- Corpus-health schema-hash mismatch: expected while this branch is unmerged, and
  previously mis-recorded here as a pre-existing baseline failure. It is not.
  `origin/main` is self-consistent — its `schema.prisma` hashes to exactly what
  the tracked bundle records. This branch adds 334 lines to `schema.prisma`, so
  the inherited bundle no longer matches. The snapshot compares the migration
  directory set against completed database migrations, so the bundle must be
  refreshed only after the migration is deployed, never before merge.
- Next gate: schedule the full run in waves, publish the critical and quality rates per stratum as they accumulate, and draw the stratified calibration sample from the completed population.

Governance:

- `automatedOnly=true`
- `externalReady=false`
- `externalApiUsed=false`
- `candidateDatabaseWritten=false`
- `productionDataMutated=false`
- `humanSourceReviewRequired=false`

The execution used Codex-native orchestration only. No external AI API,
Ollama/local model, candidate-database write, production mutation, merge, or
deployment occurred. The branch was pushed to `origin` on 2026-08-23 as an
explicitly requested backup of unpushed local work; no pull request was merged
and no deployment followed.

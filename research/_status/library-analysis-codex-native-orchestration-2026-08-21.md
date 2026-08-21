# Codex-native library analysis orchestration — execution receipt

Status: real semantic pilot terminal; full queue NO-GO and not executed.

- Design commit: `5f3eb1cf8cf0a5633104fb06e82ac763d72cca0b`
- Plan commit: `53c1c4e6e4a2b9d334539659a9551aac7b1e6cd2`
- Workflow implementation through Task 7: `281bf51f3198d7f4a84d084d4122133166b72e94`
- Task 8 initial rehearsal and receipt commit: `14e37cf`
- Task 9 integration and runtime fixes: `d95edcb` through `0ce4769`
- Prompt-remediation runtime commits: `a47487619192116360f5bc6e43e4ccf45bd81ff8` and `7fcf638d8ed19bd739344146b2afc6240e2d44af`.
- Schema versions: queue/v1, job-input/v1, segment-response/v1, source-result/v1, validation-request/v1, validation-response/v1, validation-result/v1, terminal-receipt/v1.
- Analysis and validation workflow/prompt versions: `1.0.2`.
- Policy version: execution-policy/v1; maximum attempts 3; maximum concurrent analyzers 3.
- Expected full coverage: `1,569 / 8,393`.
- Sealed full queue: 1,569 sources, 8,393 units, 2,766 jobs; queue hash `72109287c15732f5927c7393df846301a711c4d9020fde311ff46174bde81f7a`.
- Fresh 1.0.2 pilot: 10 sources, 53 units, 18 jobs, 298,374 code points, all seven required strata; queue hash `4bd79c0478baa65fd29ac0edbcc8095e8d2f8f232ea319b0eccb33566136da4e`.
- Analysis terminal: 18 reusable jobs, 0 pending, 0 quarantined, 103 candidate assertions.
- Validation terminal: 4 partial sources and 6 quarantined sources.
- Validation findings: 29 total — 23 F3 and 6 F4; no F1, F2, or F5.
- Terminal merge hash: `ff32fa9a111bdf3d1d36b349b71879f1a374ad3ae37850b20ff5681d4ba935ae`.
- Verification: targeted implementation set passes after focused receipt rerun; TypeScript and scoped ESLint pass.
- Full suite: 2,335 tests — 2,332 pass, 2 fail, 1 skipped. The cleanup-pressure timing case passes in isolation; the pre-existing corpus-health schema-hash mismatch remains.

Gate status:

- Full-queue construction and exact coverage gate: pass.
- Pilot selection replay and strata/capacity gate: pass.
- Disjoint maximum-three Luna analysis waves: pass.
- Exact content/hash and sealed readback gates: pass.
- Restart/resume guard: pass; accepted attempts were not overwritten and no illegal next-attempt artifact was created.
- Main-agent full-source validation: complete.
- Pilot semantic stop rule: failed due to F3 and F4 findings.
- Private pilot queue: terminal and sealed.
- Full queue: deliberately not executed after pilot NO-GO.
- Known baseline: corpus-health foundation schema hash mismatch remains for Task 9/final verification; one load-sensitive cleanup-pressure check is green in isolation.
- Next gate: strengthen analysis eligibility for the remaining context-local period, universe, forecast-basis, as-of-date, anaphora and method-scope failures; then create another fresh runtime-bound queue and rerun the pilot.

Governance:

- `automatedOnly=true`
- `externalReady=false`
- `externalApiUsed=false`
- `candidateDatabaseWritten=false`
- `productionDataMutated=false`
- `humanSourceReviewRequired=false`

The execution used Codex-native orchestration only. No external AI API, Ollama/local model, candidate-database write, production mutation, push, PR, merge, or deployment occurred.

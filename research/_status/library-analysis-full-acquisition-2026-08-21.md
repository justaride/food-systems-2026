# Library-analysis full acquisition — 2026-08-21

## Result

**PASS for full private acquisition-resolution.** All `1,627` rows in the
sealed population were assigned exactly one resolution disposition through
`22` deterministic batches: `8` local batches and `14` controlled-HTTPS
batches. No candidate-database write or model execution was invoked.

This receipt proves acquisition, extraction, chunking, completeness, private
artifact readback and hash binding. It does not prove candidate persistence,
semantic analysis quality, external claim readiness, human review, migration,
deployment, production parity or publication authority.

## Immutable bindings

- Full-acquisition implementation commit: `fd062ba`
- Ambiguous-HTML evidence fix commit: `9d86033`
- Full population snapshot file SHA-256:
  `63b345286d0bc1be5ed54d2b6f976fc634a7efa8852670086c4b05123c1098d6`
- Full population hash:
  `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- Full acquisition plan hash:
  `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`
- Batch-set hash:
  `dd78a71668f46a18dc2678506f353ebe0bd66134a1835b7e96641013cc5caf8f`
- Full resolution hash:
  `1bc3d95b4629547c6b4372698adb816c8791a861f8efe379c1121125929ada91`
- Content-unit manifest hash:
  `694a3bfeb66d666891998d05afc6fd7bf393f57e4e8be6d7dcf0d1a0b6576397`
- Cost-envelope hash:
  `6869492cb0f99789ac986c324ebae1e91ea846e4085a70b496f1ad1ab1560638`
- Sealed batch-set inventory hash:
  `6dd4ea194321cda54c09e5e2e13186a9911025b12abb440f55a5207a95ef0e81`
- Sealed merged inventory hash:
  `b2a79f57cd9e225121e77028a5f78bf00c3a46941da4eeac2c3ee05d63b54079`

No URL, private absolute path, raw text, extracted text, secret or unhashed
source identifier is retained in this tracked receipt.

## Resolution

| Route and terminal result | Count |
|---|---:|
| `database_document:content_units_ready` | 1,534 |
| `controlled_https:content_units_ready` | 30 |
| `controlled_https:http_forbidden` | 11 |
| `controlled_https:identity_ambiguous` | 17 |
| `controlled_https:transport_exhausted` | 11 |
| `controlled_https:corrupt_payload` | 1 |
| `repository_csv:content_units_ready` | 2 |
| `repository_pptx:content_units_ready` | 1 |
| `database_derived_record:content_units_ready` | 2 |
| `superseded:source_superseded` | 17 |
| `unresolvable:missing_locator` | 1 |
| **Total** | **1,627** |

Disposition totals are `1,569 content_units_ready`, `30 blocked_input`,
`11 failed_retryable` and `17 superseded`. Blockers were retained as explicit
outcomes; they were not converted to weak or inferred evidence.

## Private readback and cost envelope

- Deterministic non-overlapping content units: `8,393`
- Unique sealed unit payloads after exact-content deduplication: `7,990`
- Normalized payload: `55,509,993` Unicode code points and `56,262,522`
  UTF-8 bytes
- One-pass input estimate: `13,216,665–18,503,331` tokens
- Analysis plus separate validation estimate: `26,433,330–37,006,662` tokens
- Estimator: `codepoints-interval/1.0.0`; this is not billing truth
- Merged private readback: `7,994` files, `3` directories and `82,624,970`
  bytes, all checked for mode, size and SHA-256
- Batch-set readback: `45` files, `24` directories and `1,487,387` bytes

The final pass reused all `8` completed local batches and executed the `14`
external batches. Two earlier incomplete attempts for the first external batch
were retained without overwrite. They exposed a conflict between a correctly
blocked ambiguous HTML result and its retained diagnostic extraction. Commit
`9d86033` added a witnessed failing regression test and fixed the emitter so
diagnostic evidence remains sealed without becoming analysis-ready content.

## Controls and stop lines

```text
automatedOnly=true
externalReady=false
billingTruth=false
candidateDatabaseWritten=false
productionDataMutated=false
modelExecutionStarted=false
```

- Database reads used `REPEATABLE READ` and `SET TRANSACTION READ ONLY`.
- HTTPS scopes contained at most five sources and retained bounded retry,
  redirect, timeout and response-size controls.
- Each batch had a separately hashed population and plan bound to the full
  population and full plan.
- Completed batches were hash-verified and resumed; incomplete attempt roots
  were never overwritten.
- Full merge re-read every referenced unit by expected path, mode, size and
  SHA-256, deduplicated exact content and sealed a new parent-bound resolution.
- Candidate migration, role activation, intake, paid inference, push, PR,
  deployment and production actions remain separate authorization gates.

## Next gate

The next useful phase is not more acquisition. It is an explicitly budgeted
analysis run over the `1,569` ready sources, followed by a separate KI
validation pass and deterministic F1–F5 rejection. At the current envelope,
that phase needs provider/model selection, prompt/version sealing, concurrency
and spend limits, checkpoint/resume behavior and a decision on whether to
process the full ready corpus or a representative staged subset first.

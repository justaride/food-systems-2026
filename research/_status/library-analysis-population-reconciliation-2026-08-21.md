# Library-analysis population reconciliation — 2026-08-21

## Result

**PASS for the read-only population contract repair.** The local database was
not mutated. The export now distinguishes the attested LibraryAnalysisRecord
source-version hash from the raw Document content hash supplied to automated
analysis, and it terminates the pinned retained-history set as `superseded`.

This receipt does not prove model analysis, candidate persistence, human
review, external claim readiness, migration, deployment or production parity.

## Target and private evidence

- Database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- LibraryAnalysisRecord rows: `1,627`
- Before snapshot ID: `library-analysis-population:7eb661725b9e0b19c76c63e5acfd43e6d7967b9cb0a0bb3e86285d04a81fa8ae`
- Before private file SHA-256: `00194a4b966abc0415c2b49acac452f476426ffa70210ff25f1d371e9bf81555`
- After snapshot ID: `library-analysis-population:00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- After private file SHA-256: `63b345286d0bc1be5ed54d2b6f976fc634a7efa8852670086c4b05123c1098d6`
- Private files are mode `0600` and remain outside the repository.

## Root cause and exact reconciliation

The original exporter compared `LibraryAnalysisRecord.contentHash` with
`sha256(Document.content)`. The established project contract instead stores:

```text
sha256([Document.summary, Document.content].filter(Boolean).join("\n\n"))
```

Read-only database comparison proved:

- `1,533` rows matched only the established composite source-version hash.
- `1` row matched both because its summary contribution was empty.
- `15` document identities had no current Document and belong to the pinned
  retained-history contract.
- `2` loose library-file identities also belong to the same 17-row retained
  history set.
- No canonical hash repair was required for the 1,534 live Document rows.

The corrected snapshot reconciles all 1,627 persisted rows:

| Terminal population state | Count |
|---|---:|
| `eligible` | 1,534 |
| `superseded` | 17 |
| `blocked_input` | 76 |
| **Total** | **1,627** |

## Remaining 76 blocked inputs

| Source class | Count | Deterministic next route |
|---|---:|---|
| SourceDoc | 66 | All 66 have an external URL; controlled acquisition and content hashing are required. |
| Report | 4 | Direct URL/DOI acquisition. |
| Report | 2 | Internal register/synthesis; bind and assess their 27 declared supporting sources instead of treating derived prose as primary evidence. |
| Thesis | 1 | Direct URL/DOI acquisition. |
| Repository artifact | 2 | Parse the two tracked CSV work queues under their internal metadata role. |
| Repository artifact | 1 | Extract text from the tracked PPTX while preserving slide locators. |

These rows remain `blocked_input` until their exact bytes, locator,
source-version hash and content hash are sealed. A URL or descriptive database
field alone is not treated as analyzed source content.

## Verification

- TDD RED reproduced the composite/raw hash contract failure.
- TDD GREEN proved separate source-version/content hashes and retained-history
  termination.
- Focused verification: `62` tests passed, `0` failed.
- `npx tsc --noEmit`: exit `0`.
- `git diff --check`: exit `0`.

## Authority boundary

- `automatedOnly`: unchanged; no model run occurred here.
- `candidate_only`: unchanged; no candidate row was written.
- `externalReady`: `false`.
- Database migration, candidate-role activation, source acquisition and model
  execution remain separate controlled steps.

# Reviewed SourceDoc identity mirror reconciliation receipt — 2026-07-20

## Result

**PASS — applied locally and idempotence-verified.** The previously reviewed
identities for `src-16`, `src-24` and `src-143` are now synchronized to their
five exact `SourceCitation` mirrors, the one live `src-143` analysis card and
the one exact `src-24` legal `SourceRef`.

This was a metadata-mirror repair only. It did not mutate any `SourceDoc`,
`Document`, `Report`, `FieldCitation`, `EvidenceAppraisal`, finding, claim,
canonical Markdown or source file.

## Bound contract and plan

- runner: `scripts/reconcile-reviewed-source-doc-identity-mirrors.ts`
- contract SHA-256: `71a4f130758fce88cb45f28b39685610c481accc82b377c45d3e51d3488921e4`
- upstream SourceDoc identity manifest SHA-256: `1396f3ad134459afa40076556d24c466c8b90e9c40017c1ba3a74ae998e6ae7c`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed all-before plan SHA-256: `a69c73d534b3d86f4f818a36b473e84df9a6e61a02fd661a0ea1071a823d2e93`
- all-before dependency SHA-256: `0deff866a9ae0ddb4e55ddd20584a01e9f5e918078fbb95dee507a0a05bf16e3`
- all-after plan SHA-256: `8c8858cb750bc587e469b3778486e130f9ad86f4945dca881bcef707a359d7fd`
- all-after dependency SHA-256: `f8ade92f28a9aa3b6fa47e7149e9102dbe6e017938ccbc6a5e4661e695ca31ee`
- preserved dependency SHA-256 before and after: `b45651c4548f9133d8990b82a788de63ed0c319a0b729f2657ee844910e2f152`

The preflight was one exact `all_before` state with 7 pending targets and zero
conflicts. Apply used the exact printed acknowledgement plus the reviewed plan
hash inside a Serializable transaction with table locks, row locks, full-row
compare-and-swap and post-state reinspection.

## Applied scope

| Target | Applied change | Preserved boundary |
|---|---|---|
| five pinned `SourceCitation` rows | Corrected bibliographic identity; the three URL citations received the reviewed locator and access date. | All five `FieldCitation` bindings and all non-target citation fields remained pinned. Readiness stayed `blocked_unsourced`. |
| three URL citations | Old failed/stale verification evidence was cleared to `needs_review`, with `verifiedAt`, `verifiedBy` and `archivedUrl` set to null. | No new machine-verification claim was created. |
| live LAR `cmrs79oee007eqkvmi00wjttn` | Corrected the exact Finnish genitive title once in `title`, `aiSummary` and `aiCard.shortSummary`. | Findings, implications, review state, content hash and every other analysis field remained unchanged. |
| stale-retained LAR `cmqjoex2v00wvzpvmi24d0g5n` | No mutation. | Its missing Document binding and historical 2024 title were explicitly protected and hash-checked. |
| `SourceRef:cmp8xyewq000avqvmwez3gwtc` | Replaced the generic KKV home-page reference with `Competition Act 948/2011, Section 4a` and the exact Finlex locator. | `src-24`, `ins-09`, note and relation bindings remained unchanged. |

Committed mutation counts were exactly:

- `SourceCitation`: 5
- `LibraryAnalysisRecord`: 1
- `SourceRef`: 1
- every other table: 0

## Post-apply proof

The immediate dry-run returned `all_after`, 0 pending, 7 applied and 0
conflicts. The preserved dependency hash was unchanged. The upstream
three-row SourceDoc identity runner still returned `all_after` for all three
rows, and the historical SourceDoc access-date runner still returned 0
pending, 48 applied and 0 conflicts with all three identity overlays in
`post_identity` state.

Focused tests passed `10/10`; ESLint and `git diff --check` passed for the
runner and its test. Full-repository verification is recorded separately after
all independent repair batches finish.

## Remaining boundary

This repair does not make these rows academically appraised or externally
citable. `src-16` and `src-24` still need canonical Markdown/Document/LAR
content-hash reconciliation; `src-143` still needs reviewed PDF-path coverage.
Those items are recorded in
`bibliographic-content-hash-reconciliation-queue-2026-07-20.md`.

# Reviewed ETMV 2023 generated-projection identity repair receipt — 2026-07-20

## Result

**PASS — applied locally and idempotence-verified.** The Report
`finland-food-market-ombudsman-2023` was already the correct 2023 work and was
kept immutable. Its stale generated Document, two exact Document citations and
direct Library Analysis record are now reconciled to that 2023 identity.

The separate 2024 Report and `SourceDoc:src-143` chains were outside scope.

## Evidence and bound plan

- contract SHA-256: `77dea694349703ba98674697ef5e051d4ee7a10fa41eb18d987dea81e4278a1b`
- local 27-page PDF SHA-256: `f40fd2d16600114d2dc31a6fc6599914cf226dff76ca07bccc637241fe33063b`
- seed target SHA-256: `6ba017c86e2c400e88e3cf56aaf9f785590d418396c91151038c4c8ebe445954`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed all-before plan SHA-256: `91ce557c449556dd717a1630baaf1a636d9b6730742580598a529605b95749e6`
- all-before target/dependency SHA-256: `aa4956ee05878a6a4da2d8189f5e55d3d2ceaa9173ff0fea3ca5b308d68e07c6` / `ef108714c09d015114423f71d81abeebd930b27b60b2487e2676010c09a62360`
- all-after plan SHA-256: `5f0c1af03fda44bf6769a8c8e749207e94d26c7526632a8e21bd4eb8f9b02417`
- all-after target/dependency SHA-256: `9a3fd25940636541aaf747c9976b839a3b22c015ef6dce20002b78f9d8d6dbf7` / `3e6f6a595593dea487862c70c4eee725bff9d3af628578e6a8010b77b2fd76bd`
- preserved dependency SHA-256 before and after: `ce63732f2c87c7b559972c7dbe81683b2bb2dd0a384d624c62ecb06971f30d02`

The preflight was exactly `all_before`, with 4/4 full-row CAS matches and
zero conflicts. Apply used the exact printed acknowledgement and plan hash in
a Serializable transaction with writer-blocking table locks, advisory lock,
locked reinspection, row locks, post-state proof and a second read of the
byte-pinned PDF.

## Applied scope

| Entity | Exact target | Applied projection |
|---|---|---|
| `Document` | `cmp8xyo7r00juvvvmgbocg9e3` | Correct 2023 title, year, official 2023 URL, three exact generated-content markers and matching backlog metadata |
| URL `SourceCitation` | `cmpdaflzc0144sxvmgp95w3in` | Correct 2023 citation identity and official 2023 URL; stale 2024 machine-verification/archive evidence reset to `needs_review` and null timestamps/archive |
| local `SourceCitation` | `cmpdaflzc0145sxvmg5wj485q` | Correct 2023 identity and reviewed PDF `fileHash`; existing local-review policy preserved |
| `LibraryAnalysisRecord` | `cmqjoewix00ilzpvmwexh2sng` | Correct 2023 title, summaries and recomputed composite content hash |

Committed mutation counts were exactly 1 Document, 1 URL citation, 1 local
citation and 1 Library Analysis record.

The corrected raw Document content hash is
`9c82f507b29b0b5d220cbba6e67b8f95b60a2331755ebed61c69e757bf1be08a`.
The corrected Library Analysis composite hash, derived as
`sha256([Document.summary, Document.content].filter(Boolean).join("\n\n"))`,
is `9b10a94b17c39f25dd4e34e77b73d47b47cdc5c6020d68294ea36b5894aab9f1`.

## Protected state and post-proof

The correct Report, its independent Report citation, all three
`FieldCitation` rows, Report/Document binding and all other enumerated direct
dependencies remained unchanged. Immediate dry-run returned `all_after`, 0
pending, 4 applied and 0 conflicts; the protected dependency hash stayed
identical.

Focused 2023 tests passed `7/7`; the combined 2023/2024 ETMV tests passed
`18/18`. Targeted ESLint, TypeScript and `git diff --check` passed.

This is identity and local-file integrity repair, not academic appraisal or
claim validation. The URL citation remains `needs_review`, and no external-use
permission was created.

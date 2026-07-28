# Reviewed Thesis content/hash reconciliation receipt — 2026-07-20

## Result

**PASS — five bounded bibliography projections are all-after and
idempotence-verified.** The batch synchronized generated Document content and
direct Library Analysis hashes for SLU, NMBU, Van Straten and Bueso-Bordils,
plus one exact `Full tittel` line for Håndlykken.

No Thesis synthesis, finding, takeaway, method, semantic LAR field, citation,
FieldCitation, appraisal or PDF-availability assertion was changed.

## Bound plan and proof boundary

Repository files and PostgreSQL cannot share one transaction. Three exact
repository files were placed in their pinned after-state first. Database apply
was then allowed only from `files_after_db_before`; the runner re-read those
files and asserted that all five expected PDF paths remained absent inside the
locked Serializable transaction.

- manifest SHA-256: `9e1412b4d90c142ff38761f0fdbeb80d242c886a10a4135b67c408c71060183f`
- contract SHA-256: `8802412714dc1757d7e3eda13a74562e96ef81da9062837129844c622742261a`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed transition plan SHA-256: `e91885b2e9faa092ff0152ec0c33db56a64e287adce7fcc560dec02591cca270`
- all-before DB dependency SHA-256: `96225a326318f7eefd2d8afb013e5242f7408eafea07851fe716e4a3e46f4587`
- all-after plan SHA-256: `20d8f1e2fe224a6b8a68506685e00554bb021135785807b5e370ebdbc1833869`
- all-after DB dependency SHA-256: `7e2f2b7d57c6f7ba043a5af40a45b69a72d99c29e8e8abed2d4cb77a8f99d56c`
- preserved dependency SHA-256 before and after: `74a1068c834b72fc4856e0dea7c0d48e2b1301e17d5a0e20ae6e187e71cfbb13`

The protected dependency inventory included seven `SourceCitation` rows,
seven `FieldCitation` rows and one `DocumentRef`, together with the complete
enumerated target and analysis topology.

## Exact applied projections

| Thesis | Document content after | Word count | LAR hash after |
|---|---|---:|---|
| `slu-house-crickets-2025` | `2834ae0c0683d6b9ad4e989d90ceef555a622b0e9efdc5da9195208f0c3b36ef` | 207 | `38d49790068d1c58accd23474857c7eb29d77cfbece34893acfe0242e9b831f9` |
| `nmbu-circular-vegetables-2022` | `e48291c0861bea62bfb213d6b4b56cb28ee9e560f747006f463be33194f26b25` | 190 | `54e231e03ddc4b427d4be68a544e9c5f9050cdd97555e27be4f903f9820c67c4` |
| `van-straten-2025` | `6f7f1f4f23bb2094e432bbfb020b418140b5cf556115ffc262d7259f0e0cfbba` | 232 | `4c4d177cf2e3a83caa6e6294f03e232a965e173bd1de2f71fdd84f4048877f41` |
| `bueso-bordils-2021` | `79bdf5880a6425fa2d26b10a030c53e74254caf9de3fabbfca7e111472a43564` | 197 | `9f573e20b26b7b54ac0521eb8f64768cc34ff7729f7499e0f77a1a0e3fe3934e` |
| `handlykken-2023` | `d8366ea949b5eb26024c54aa8124e4fa59ddb352b15e9cd64f7848c4b7d7e5d7` | 184 | `acf87dbf4e552cbdd67f932b661051f378c19e70b090ea39599923e010e8e36d` |

The transaction committed exactly five `Document.content/wordCount` updates
and five `LibraryAnalysisRecord.contentHash/wordCount` updates through full-row
compare-and-swap.

The three canonical file after-hashes are:

- SLU locator note: `915eec260c11c0db5a7946c6779ac84c477f0f1ed50e1e99c0046252315d6a22`
- NMBU locator note: `9336b79946e459abb9859cdaf99f59be4fd6d951b9e77e240cad361c2e7da737`
- Håndlykken summary: `d8366ea949b5eb26024c54aa8124e4fa59ddb352b15e9cd64f7848c4b7d7e5d7`

## Remaining boundary

The expected SLU, NMBU, Van Straten, Bueso-Bordils and Håndlykken PDF paths
remain absent and protected. NMBU locator reverification, Håndlykken's broader
claim prose and availability flag, and every local-file acquisition decision
remain separate review work.

Immediate dry-run returned file state `all_after`, database state `all_after`
and transition `all_after`, with zero conflicts and unchanged protected hash.
Focused new tests passed `8/8`; combined Thesis content tests passed `18/18`.
Targeted ESLint, TypeScript and `git diff --check` passed.

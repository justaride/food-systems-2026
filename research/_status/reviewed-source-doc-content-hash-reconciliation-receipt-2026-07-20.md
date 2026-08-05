# Reviewed SourceDoc content/hash reconciliation receipt — 2026-07-20

## Result

**PASS — canonical files and database mirrors are all-after and
idempotence-verified.** Exactly one reviewed source URL was added to each of
the canonical `src-16` and `src-24` Markdown files. Their linked Document
content and Library Analysis composite hashes were then synchronized through a
separate guarded database transaction.

No title, finding, claim, summary, source identity, citation, FieldCitation or
appraisal content was changed.

## Two-phase proof boundary

Repository files and PostgreSQL cannot share one transaction. The contract
therefore pins exact before/after file bytes and permits database apply only
from the recoverable state `files_after_db_before`. The runner never writes
repository files; it re-reads both exact files inside the locked Serializable
database transaction before and after the DB updates.

- manifest SHA-256: `55b15b302dd924a88ba414094a48e0e50c49f4099f0575841ad65f5f9de758ce`
- contract SHA-256: `876852093973ab73e074ec3d74041129a89f0a6d863f0fb2f5d67d7d76f54afc`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed transition plan SHA-256: `59f1b89a792424b46436ef74dbba96ab3d6363e612137fde8afe620fa3e1335e`
- all-before DB dependency SHA-256: `2be64c9711a44ae325b6001903b3c2ecf00346d4d7a96183e662461e614a4d95`
- all-after plan SHA-256: `ee8efe39a429a6f7974769693e42240f03f28f2121bd17765c01fb6b99a48384`
- all-after DB dependency SHA-256: `97ee8a771849b0622094e3bceeaf90becdc9f98e5f044cd58422ba9321cafb6a`
- preserved dependency SHA-256 before and after: `4379084bce1b1fdc426d58a263f3cb0fbdc4a8639965ae02d233d3fc110789d8`

## Exact file and database results

| Source | Canonical file after | Inserted metadata only | LAR hash after |
|---|---|---|---|
| `src-16` | `research/bibliotek/riksrevisjonen/beredskap-2023.md`; 1,861 bytes; SHA-256 `b7718cee84a2a10e01c55b1f0d67d99a1a3c14deba6bca9ecc21015ef0f393d0` | `**URL:** https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/` | `a3aef18bbe9a9d6859968c762f7feb3ddccb4b8edf320e85016819740e20ea4a` |
| `src-24` | `research/bibliotek/nordisk-konkurranse/fi/kkv-4a-dominans.md`; 1,777 bytes; SHA-256 `f0e032c1c16644ac2c0f5aaa92eae6bfd0c94e075b4c51ace7400275e330bea6` | `**URL:** https://www.finlex.fi/en/legislation/2011/948` | `c1390ec3df2d2a2e78ef1044cd96092bf3394e472328eaf1cdff1a9b1c6da3ef` |

The database transaction committed exactly 2 `Document.content` updates and 2
`LibraryAnalysisRecord.contentHash` updates. LAR hashes use the project formula
`sha256([Document.summary, Document.content].filter(Boolean).join("\n\n"))`.

## Post-apply proof

Immediate dry-run returned file state `all_after`, database state `all_after`
and transition `all_after`. Both Documents and both LARs classified exact
after; the protected dependency hash remained identical.

Focused tests passed `10/10`; targeted ESLint, global TypeScript and
`git diff --check` passed. This repair adds provenance navigation and restores
content/hash parity only. It does not upgrade appraisal, claim support,
verification status or external citation eligibility.

# Reviewed ETMV 2024 Report title repair receipt — 2026-07-20

## Result

**PASS — applied locally and idempotence-verified.** The Finnish title was
corrected from `Elintarvikemarkkinavaltuutettu toimintakertomus 2024` to
`Elintarvikemarkkinavaltuutetun toimintakertomus 2024` across the exact live
2024 Report projection.

The distinct 2023 report chain and `SourceDoc:src-143` were outside this
contract and remained unchanged.

## Bound contract and plan

- contract: `src/lib/citations/reviewed-etmv-report-title-repair.ts`
- runner: `scripts/apply-reviewed-etmv-report-title-repair.ts`
- contract SHA-256: `e2f3b47596bdb89068338512a579641a10f445c80df05ba57dd163af7bf75fca`
- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reviewed all-before plan SHA-256: `5cb824eb26d0ce003a269ad0bf1be666453fb83c769de372d2767f02ba04d5e0`
- all-after plan SHA-256: `10e4d3d3e7be9e66964fb68e67636120e5859f0f6434b88a6a623aed3d5d3298`
- dependency SHA-256 before and after: `e64020039824457d8ff403873b88b26c7e35e71722400c10502059f4594d3e0d`
- preserved-state SHA-256 before and after: `a816a40f89ad7f16e124d9c3440a296883b1282bdc90fbeb55f2c70d37054d0a`

The reviewed preflight was exactly `all_before`, with 4 pending semantic
targets and zero conflicts. The successful apply used the printed
acknowledgement and exact plan hash in a Serializable transaction with
advisory/table/row locks, locked reinspection, full-row compare-and-swap and
post-state proof.

## Applied scope

| Entity | Exact target | Applied projection |
|---|---|---|
| `Report` | `etmv-toimintakertomus-2024` | `title` only |
| `Document` | `cmppajyue000rnjvmxrad483t` | `title` and the one exact title occurrence in `content` |
| `SourceCitation` | `cmpdafm3401ghsxvm1nt2gh17` | `citationText`, `title` and reviewed `accessedAt`; locator and verification evidence preserved |
| `LibraryAnalysisRecord` | `cmqjoewwt00tlzpvmmp4b90ui` | `title`, `aiSummary`, `aiCard.shortSummary` and the recomputed composite `contentHash` |
| `FieldCitation` | `cmpdafmb303fqsxvmjx4szlu5` | no mutation; exact binding protected |

Committed mutation counts were exactly one row in each of `Report`,
`Document`, `SourceCitation` and `LibraryAnalysisRecord`. All other rows and
tables were protected by the enumerated dependency closure.

Hash derivation was pinned independently:

- raw `Document.content`: `e1bdf89676884485375af155ae0286fd78239346df40062b6fd0f5e56add4622` → `9d29e8b384519c0fe81a83367c8b4abd08bcbffddffd9378619ca03a9fc3673f`
- Library Analysis composite input, `sha256([Document.summary, Document.content].filter(Boolean).join("\n\n"))`: `9f5940db58e5a4f19736fa885ff56b8396a9957a09cd6408a1ec9620edd1c0ed` → `61520b6e940f5cef8c9eceb141c450ccc3ad6a12092dbbcb27c2431183064c06`

## Apply incident and regression

The first apply attempt stopped at the advisory-lock statement before any
mutation because Prisma cannot deserialize PostgreSQL's `void` return from a
`$queryRaw` call. The transaction rolled back with zero writes. The call was
changed to `$executeRaw`, a focused regression assertion now pins that form,
and the complete test/lint/type/diff gate was rerun before a fresh dry-run and
successful apply.

## Post-apply proof and remaining boundary

The immediate post-run returned exactly `all_after`, 0 pending, 4 applied and
0 conflicts, with identical dependency and protected-state hashes. Focused
tests passed `11/11`; targeted ESLint, TypeScript and `git diff --check`
passed.

This title repair does not close file coverage. The database path
`research/evidence-pack/nordisk/etmv-toimintakertomus-2024.pdf` is absent from
the worktree; the reviewed PDF exists at a different canonical-checkout path
and remains separately queued. Nor does this repair upgrade appraisal,
claim-level support or external citation eligibility.

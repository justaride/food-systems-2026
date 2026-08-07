# Reviewed SourceDoc identity repair receipt — 2026-07-20

## Result

Three evidence-reviewed SourceDoc identities were updated in the local
`foodsystems` database. The runner accepted only the exact all-before state,
used full-row compare-and-swap, and committed all three rows in one
`Serializable` transaction.

- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- manifest SHA-256: `1396f3ad134459afa40076556d24c466c8b90e9c40017c1ba3a74ae998e6ae7c`
- reviewed pre-apply plan SHA-256: `36c638ee364a76d8d337785f34fb9516432579d636d0f88b4179a8d16022f4fd`
- pre-apply target-state SHA-256: `d42842078ee727c115d6bbca4877be815545daa83bc550675cbccda9e4e6d986`
- post-apply target-state SHA-256: `25df31cf34384c4ea4224412381d257b916e0eb3281c490fd101cd31b1f3fa66`
- pre/post dependency SHA-256: `c1511a2af6195ba697306b561d37bb5c6c626039eb3190f27c8f75bce8698be5`
- rows updated: 3
- post-apply dry-run plan SHA-256: `f5a23ac6c84117194a83d1983e19d6a06ee7e0b706d45ca1485bc0abd2ed423c`
- post-apply dry-run: 0 pending / 3 applied / 0 conflicts
- historical SourceDoc access-date contract after apply: 0 pending / 48
  applied / 0 conflicts; all three compatibility rows are `post_identity`

The enumerated dependency snapshot contained 2 Documents, 2 SourceDoc-to-
Document bindings, 7 SourceCitations, 7 FieldCitations, 4
LibraryAnalysisRecords, 1 SourceRef, 1 MediaEntry, and 1 CompanyDocumentRef.
It contained no Report- or Thesis-to-target-Document consumers, appraisals,
DocumentRefs, Insight links, Producer citation consumers, Opportunity
consumers, InsightDocumentRefs, or ActorDocumentRefs. The complete dependency
hash and both target Document bindings were identical before and after the
mutation.

## Applied identities

| SourceDoc | Reviewed correction |
|---|---|
| `src-16` | Exact title `Matsikkerhet og beredskap på landbruksområdet`, corrected official Riksrevisjonen locator, and reviewed access date. |
| `src-24` | Exact `Competition Act 948/2011, Section 4a` identity, Finland as author, 2013 amendment year, official Finlex locator and publisher, and reviewed access date. |
| `src-143` | Exact Finnish genitive title, direct official PDF locator, and reviewed access date. The reviewed local archive has SHA-256 `136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761`. |

The mutation was limited to each manifest row's explicit identity fields.
Descriptions, relevance, source type, duplicate flag, DOI, provenance,
archive locator, Document binding, and every relationship were protected by
the full-row/dependency contract.

## Proof boundary and follow-up

This batch deliberately preserved all SourceCitation, Document,
LibraryAnalysisRecord, Report, and generated-content metadata. Preservation is
not proof that every mirror already carries the corrected identity. The five
SourceDoc field-level citation mirrors, one live `src-143` analysis card and
one `src-24` SourceRef require a separate dependency-safe reconciliation. A
second `src-143`-linked analysis points at a deleted Document identity and is
retained unchanged as an explicit historical/stale dependency. The same PDF also exists
as the independent Report `etmv-toimintakertomus-2024`; its title, generated
Document and analysis content must be handled as a separate semantic-mirror
decision so content hashes are not silently invalidated.

Prisma `Unsupported` columns such as embeddings and generated search vectors
are outside the dependency hash, and static TypeScript/seed consumers are
outside the PostgreSQL transaction. The known `src-16` and `src-24` app-facing
static references were reconciled separately; independent KKV event sources
were intentionally preserved.

Identity correction does not validate stored claims, complete full-text
appraisal, add claim anchors, or grant external-use eligibility.

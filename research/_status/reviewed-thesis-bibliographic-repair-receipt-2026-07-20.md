# Reviewed Thesis bibliographic repair receipt — 2026-07-20

## Result

Nine evidence-reviewed Thesis identities were updated in the local
`foodsystems` database. The runner accepted only the exact all-before state,
used full-row compare-and-swap, and committed all nine rows in one
`Serializable` transaction.

- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- manifest SHA-256: `bc76d1c5b8454ad843ce5b0dde0d726edf085305c77ad744aa2919692b5249fe`
- reviewed pre-apply plan SHA-256: `483acb8210c162e405427eab94b2ef24f40e5f55a8489c5db8e96f0ce626eab6`
- pre-apply target-state SHA-256: `e11d40a4fe6fe54f076d87a23315549ab1e40211dc7d89c67ae052707af45d8a`
- post-apply target-state SHA-256: `e3baf6aa49e890dff1cfe97134a631f10fb5b1a9e4e738e29aad6159790f79ac`
- pre/post dependency SHA-256: `3bfd78bbbaec427a4ea7a76b0890f358518b9f282992bc329b47e7a70a51207a`
- rows updated: 9
- post-apply dry-run plan SHA-256: `c9a8fbe1f4d670e3e06b1c6a8269978c9ec9d4014acf4054aac6801e6c0d424d`
- post-apply dry-run: 0 pending / 9 applied / 0 conflicts
- historical 76-row access-date contract after apply: 0 pending / 76 applied /
  0 conflicts; original manifest SHA remained
  `57e6c7c212472d6809141658854a942ff7b55f66596414ff8b9180037d00413d`

The enumerated dependency snapshot contained 8 Documents, 9
SourceCitations, 9 FieldCitations, 9 LibraryAnalysisRecords, 0
EvidenceAppraisals, 1 DocumentRef, 1 CompanyDocumentRef, and no
InsightDocumentRef or ActorDocumentRef rows. Target Theses were locked `FOR
UPDATE`; the exact enumerated dependency rows and database identity were
locked `FOR SHARE`.

## Applied identities

| Thesis | Reviewed correction |
|---|---|
| `sandanger-2012` | Elise Sandanger; complete title; Handle `11250/169513`; NHH publisher spelling. |
| `granlund-lindskog-2024` | Henrik Granlund and Herman Lindskog; canonical Handle `11250/3156087`. |
| `tallaksen-2022` | Amalie Tallaksen; exact English title; Universitetet i Agder identity. |
| `tesdal-2013` | Kari Tesdal; publication year 2012; exact Norwegian title. |
| `handlykken-2023` | Vilje S. Håndlykken; complete question-form title. |
| `slu-house-crickets-2025` | Sara Capitán; exact dissertation title, DOI, ISBN, and SLU publisher. |
| `van-straten-2025` | Elizabeth Van Straten; complete title. |
| `bueso-bordils-2021` | Vicente Bueso Bordils; exact title. |
| `nmbu-circular-vegetables-2022` | Andrea Christine Kunz Skrede; canonical Handle `11250/3030715`. |

The mutation was limited to the manifest's reviewed bibliographic fields.
`synthesis`, `keyFindings`, `tags`, `takeaways`, `method`, `degree`, access
date, and every relationship were protected by the full-row/dependency
contract.

## Proof boundary and excluded work

This batch deliberately did **not** rewrite the nine existing SourceCitation
metadata rows or the eight bound Document mirrors. Their unchanged hash is
proof of preservation, not proof that those mirrors now carry the corrected
bibliography. A separate dependency-safe citation/Document reconciliation is
required where old titles, authors, or locators remain.

The following cases remain outside this metadata-only batch:

- `mattila-2024`: stored result percentages conflict with the official work.
- `naess-2024`: no stable work-level permalink is pinned.
- `halseth-phd-2024`, `lund-beijer-2026`, and `rey-verge-2005`: each requires
  a Thesis-to-Report entity migration with independent authorization,
  dependency transfer, backup, and receipt.

Bibliographic correction does not validate stored findings, complete
full-text appraisal, add claim anchors, or grant external-use eligibility.

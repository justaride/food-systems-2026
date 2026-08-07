# Reviewed Thesis bibliographic mirror reconciliation receipt — 2026-07-20

## Result

The local `foodsystems` database mirrors for the nine already-reviewed Thesis
identities were reconciled in one guarded `Serializable` transaction.

- database identity UUID: `90e3e24d-230f-42f7-b178-5bcd5b861e84`
- reconciliation contract SHA-256: `62ad79878026e436d8573b1eebd749c509b5a078d9d9f88141bbfc077d508f8c`
- authoritative Thesis manifest SHA-256: `bc76d1c5b8454ad843ce5b0dde0d726edf085305c77ad744aa2919692b5249fe`
- reviewed pre-apply plan SHA-256: `febd2906d9382b9a697f9abf95ba0fe4ff33c7c86d72ec8c9f6185e95b7c2d02`
- pre-apply dependency SHA-256: `62bf77a00f2a5914bf76bcac8da870496d3a7782f843793b708b669c5eca27dd`
- post-apply dependency SHA-256: `658747248a7f73b54bfc22056b20969560e917e2b8dfe3c17ff6624feb2ace1d`
- pre/post protected-dependency SHA-256: `24696b2e2ac0771d764413eb639cdd76c1957c3bafc24d277b256f0bf55aac47`
- rows updated: 9 SourceCitations / 8 Documents / 3
  LibraryAnalysisRecords
- post-apply plan SHA-256: `69d0d4d0d416ae8e6a920bd3f826f7673c6f7eef8f996508ba114709d8786310`
- post-apply state: 0 pending / 9 applied / 0 conflicts
- authoritative Thesis repair after reconciliation: 0 pending / 9 applied /
  0 conflicts; target SHA-256 remains
  `e3baf6aa49e890dff1cfe97134a631f10fb5b1a9e4e738e29aad6159790f79ac`
- historical Thesis access-date contract after reconciliation: 0 pending /
  76 applied / 0 conflicts; manifest SHA-256 remains
  `57e6c7c212472d6809141658854a942ff7b55f66596414ff8b9180037d00413d`

The protected hash covers every non-mutable field in 9 Theses, 8 Documents,
9 SourceCitations, 9 FieldCitations, and 9 LibraryAnalysisRecords, plus 1
DocumentRef and 1 CompanyDocumentRef. It also covers the empty appraisal,
InsightDocumentRef, ActorDocumentRef, SourceDoc/Report Document-binding,
Insight citation-consumer, and Producer citation-consumer sets.

## Mutated mirrors

- All nine URL-bound SourceCitations now carry the reviewed title, author,
  year, publisher, locator and access date.
- The eight bound Documents now carry the allowed identity projection. The
  four curated summary Documents changed only access date, except Sandanger,
  whose stale old-work URL was also replaced. The four seed-generated
  Documents changed only title, author, year, URL and access date.
- The three generated analyses whose titles actually changed (`SLU house
  crickets`, `Van Straten`, and `Bueso Bordils`) changed only `title`,
  `aiSummary`, and `aiCard.shortSummary`. Each replacement required exactly
  one old-title occurrence. The NMBU analysis title was already correct and
  remained a protected no-op without `updatedAt` churn.

For `granlund-lindskog-2024` and `nmbu-circular-vegetables-2022`, the locator
changed to a different canonical address. Their old `machine_verified`
status, verification timestamp and archive URL were therefore not carried to
the new locator; the citation is now `needs_review` with null verification
evidence. This is a deliberate fail-closed downgrade, not a loss of reviewed
Thesis identity. Sandanger, Tallaksen and Håndlykken retained their exact
pre-existing `needs_review` policy; unchanged-work archived aliases were
preserved only where they still identify the same work.

## Proof boundary and remaining content work

This batch created no DOI SourceCitation or DOI FieldCitation and did not
mutate any Thesis or FieldCitation row. It does not claim that the stored DOI
field has its own citation anchor.

The protected generated Document `content`, metadata and content-dependent
analysis hashes were not regenerated. Some generated headers/source notes and
repository files therefore still contain the old author, title or locator.
They must be reconciled as a separate content-and-hash batch; changing those
files or content fields without regenerating the bound hashes would create a
false parity claim. The four curated summary Documents were deliberately not
rewritten because their narrative titles/content are independent summaries.

Bibliographic mirror parity does not validate findings, complete appraisal,
create claim anchors, or grant external-use eligibility.

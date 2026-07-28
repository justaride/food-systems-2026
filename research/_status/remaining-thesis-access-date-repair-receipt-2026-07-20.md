# Remaining Thesis access-date repair receipt — 2026-07-20

## Applied local database batch

- reviewed rows: 76
- mutation: set `Thesis.accessDate=2026-07-20` on 76 exact full-row snapshots
- locator repair: `Thesis:deljanin-2015` only, from the dead CBS student-thesis PDF URL to the exact CBS Research Portal work page
- pre-apply plan SHA-256: `a31fcebb5eebae62a9351ee37f9c852108a28abee5ec8288a999e58147c25349`
- reviewed manifest SHA-256: `57e6c7c212472d6809141658854a942ff7b55f66596414ff8b9180037d00413d`
- full-row CAS preflight: 76/76 matched
- Serializable guarded apply: 76 rows committed
- post-apply plan SHA-256: `f490d7a6227460d8cda46eb86e5c4621da15abf9fda0d71215d27dca7f14a9d2`
- post-apply state: 0 pending, 76 already applied, 0 conflicts

The plan binds every stored Thesis content field plus `documentId`, so an
unreviewed content or relationship change fails closed. The batch changed no
bibliographic fields except the one explicitly reviewed locator.

## Proof boundary

Access dates prove that each stored locator was checked against the named work
at work level. They do not prove that every stored title, author, year, degree,
or entity type is correct, and they are not a methodological appraisal or a
claim-level citation review. Fourteen bibliographic/type caveats remain in
`thesis-bibliographic-entity-review-queue-2026-07-20.md`.

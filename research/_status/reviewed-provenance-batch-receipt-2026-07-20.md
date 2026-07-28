# Reviewed provenance batch receipt — 2026-07-20

## Scope

The reviewed batch classifies exactly 79 `Report` rows and 111 `SourceDoc` rows whose prior provenance was respectively `NULL` and literal `unknown`. The 14 excluded Reports and 27 excluded SourceDocs remain unclassified. No access date, citation, verification, readiness, appraisal, identity, or dependency field is part of this operation.

- manifest SHA-256: `8b831cd30d226ff5e68d25243cb3df3bd2ae48e848c80f7d884e04624a7ba8b5`
- seed identity SHA-256: `89f438f94a2f137dda16176a433dd53aab2855a262e5e4c381ce3930f9677fcb`
- reviewed pre-apply plan SHA-256: `fdce62e7f955c4515ee59461f56c9a2b5731dd54132fd415205c7dad439a57ca`
- pre/post non-provenance SHA-256: `c8eae446fbeadf11d15200bd9e32528696a814aa5f72004b20038b27d3b6deb1`
- pre/post dependency SHA-256: `0bfc1297e6c710cb0e8875a8b80e6b4afce65aa6cdbc7b23ab6450ef5f2da5dc`
- before full-state SHA-256: `ce309ab90dad8255374956fdfc89e9de0308e9380728fe9c2ee929b5e2cb684d`
- after full-state SHA-256: `8bbb77421a32079e38d0d8fa294cd4c943438c1ca1662b35c00bbca44be16c6a`

## Local database apply

The guarded runner used a named advisory lock, row/dependency locks, a `Serializable` transaction, full-row compare-and-swap checks, and the exact reviewed plan SHA plus ACK.

- rows updated: 190
- fields changed: `provenanceType` only
- Report result: 79 reviewed rows applied; 14 exclusions unchanged
- SourceDoc result: 111 reviewed rows applied; 27 exclusions unchanged
- post-apply plan SHA-256: `c891f5b90ab3daf360a9753d711b7f6763d5e7d131d2683eda1c920e87f5b681`
- post-apply dry-run: 0 pending / 190 applied / 0 conflicts

Focused verification passed 6/6 tests. Disposable PostgreSQL verification covered exact apply, no-op idempotency, mixed-state refusal, dependency preservation, and exclusion preservation. The pre-mutation rollback dump is `/Users/gabrielfreeman/.local/share/foodsystems/backups/foodsystems-pre-fieldcitation-disposition-20260719-20260719T223746Z.dump`, SHA-256 `335ae87f224ff4ede5893929f752df220371bd7500303951995c2e6d07299cf0`; its disposable restore drill passed.

## Proof boundary

This closes only the conservative provenance classification batch. It does not make any source externally citable. Access-date gaps, appraisals, claim-level anchors, 41 intentionally unresolved provenance rows, and the synthetic Matsvinnloven identity gate remain separate work.

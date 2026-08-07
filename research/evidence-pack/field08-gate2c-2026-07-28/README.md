# Field 08 Gate 2C evidence pack

This pack is the first controlled evidence-acquisition tranche for legacy field `legacy_field.f08`. It freezes five official source identities selected from the Gate 2B candidate register:

- Eurostat food-waste data for Denmark and the unresolved `FI` reporting geography;
- Luke nitrogen and phosphorus balances for whole Finland and Åland;
- Landbruksdirektoratet's 2024 agricultural food-waste report;
- ÅSUB's 2024 waste-statistics report; and
- the Environment Agency of Iceland's 2022 food-waste report.

The pack is an internal evidence input. It does not create a coverage assessment, prove completeness, authorize external publication, or transfer political-country evidence into Sápmi.

## Directory contract

- `raw/` contains two storage classes: the official API JSON responses are Git-tracked, while the official PDF captures remain ignored local files under the repository artifact policy.
- `external-captures.v1.json` is the committed detached manifest for the three PDFs. It binds each ignored local path to the official recovery URL, access and capture timestamps, PDF magic, media type, byte length, SHA-256 hash, archive-durability state, reuse-review state and bounded inspection-note provenance.
- `requests/api-requests.v1.json` records the exact API endpoint, method, headers, ordered selections and response path used for Eurostat and Luke.
- `notes/` contains short project-authored locator notes. They record document identity, factual values, exact page/table locators, contradictions, limitations and the current reuse boundary. They contain no full report text and are neither a reproduction nor a substitute for the source. Each note is hash-bound to the corresponding PDF in the external-capture manifest. The private PDF bytes remain the source authority.
- Generated acquisition receipts under `knowledge/pilots/field08/gate2c/` bind every capture path or detached capture to its byte length, SHA-256 hash and source identity.

Initial generation requires the three ignored local PDFs and verifies their magic, exact bytes, hashes and sizes before producing receipts. A fresh-clone or CI `--check` may accept their absence only because they are explicitly declared `local_external`; it still verifies all committed metadata and outputs, and it must fail if a local PDF is present but differs. The tracked API response bytes and request receipts remain strict committed inputs.

`local_only_at_risk` is not durable archival storage. The detached manifest makes the local bytes identifiable and recoverable from the official locator, but the archive-durability gap remains open until an approved private, content-addressed and backed-up artifact store retains the exact bytes. Do not force-add the PDFs to Git or move them to another tracked path to evade the artifact guard. A live refresh is a new acquisition event with a new hash; it must not overwrite the meaning of the pinned receipt.

Archive placement and reuse decisions belong in later append-only archive/rights receipts keyed to the capture ID and exact PDF SHA-256. They must not mutate this capture manifest or turn a storage decision into a redistribution licence.

## Boundary and review stoplines

- Eurostat's `FI` response bytes are retained as a boundary-deferred acquisition because the captured material does not resolve Åland inclusion for the project's separate Finland and Åland cells. Gate 2C therefore creates no Eurostat `FI` measurement object.
- Luke states that Åland is included in the whole-country balance and also reported separately. Those rows are non-additive, and per-hectare rates cannot be subtracted to derive mainland Finland.
- Open inconsistencies in the Norway, Åland and Iceland reports are preserved as explicit contradiction sets. They are not silently normalized.
- Hash verification is a machine integrity result, not a human source appraisal. Every claim and measurement remains internal and blocked from external use until a named human completes the hash-bound review manifest.
- No Sápmi subject evidence is present. Institutional or governance sources do not constitute project consent, community authority or rights-holder review.

Reuse rights and publication conditions remain `review_pending`. Public availability and official authorship do not by themselves authorize redistribution of the PDF bytes. The bounded notes do not grant rights in the source documents.

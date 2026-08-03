# Source-identity verification contract v1

Status: strict internal contract

Schema version: `source-identity-verification-v1`

Implementation version: `1.0.0`

This artifact answers one narrow question: do the exact bytes and extracted pages belong to the provisional corpus identity we think they do? A `verified` decision may lift that one identity from provisional to verified. It does not classify the source's role, approve its contents, clear rights, authorize publication or promote coverage.

## Exact input binding

Every artifact binds:

- lifecycle record ID, canonical lifecycle-snapshot hash and snapshot time;
- source ID, metadata hash and raw-content hash while lifecycle identity is still provisional;
- exact acquisition-receipt ID, version, type, portable path, receipt-file hash and domain-separated internal seal;
- extraction-receipt ID, version and hash;
- page-map ID, version and hash;
- extracted-text-manifest hash and complete expected/mapped page counts;
- the exact provisional canonical database identity, a separately typed candidate locator, and candidate bibliographic values.

`canonicalIdentity` remains the corpus/database identity, for example `document:cmpp...`. It is never compared to a URL. `candidateLocator` separately records either the expected official HTTPS URL or expected controlled `private://` locator, and the canonical-locator dimension compares that value with the observed locator evidence.

The locator-evidence hash binds the named acquisition receipt, not the raw bytes directly. A controlled HTTPS receipt records the requested URL, redirect chain, final URL, response and body hash. A controlled private receipt records the exact recovery manifest and two-copy attestations. Their separate contract is [SOURCE-ACQUISITION-RECEIPT-CONTRACT.md](SOURCE-ACQUISITION-RECEIPT-CONTRACT.md).

The standalone identity artifact records only a receipt reference. Its machine-readable provenance boundary remains `receipt_reference_only`; standalone validation explicitly does not establish acquisition provenance. `validateSourceIdentityVerificationWithAcquisitionReceipt` must parse the exact referenced receipt bytes, verify their file hash and internal seal, and cross-bind locator, source ID, raw-content hash and raw-content size before provenance can be claimed.

## Observations and match dimensions

The verifier records the observed title, publisher or explicit `not_stated` result, publication-date evidence, language codes, and official URL or controlled private locator. Evidence anchors point to hashed PDF metadata, pages, official landing pages, repository records, private manifests, source-acquisition receipts, extraction receipts, page maps or source-analysis input manifests; they do not copy source text. Acquisition and normalized-input anchors are typed separately so a receipt path is never mislabeled as an official landing page.

Exactly seven dimensions are assessed once each:

1. title;
2. publisher;
3. publication date;
4. language;
5. canonical locator;
6. content hash;
7. extraction binding.

Each dimension is `exact_match`, `normalized_match`, `source_not_stated`, `candidate_not_stated` or `mismatch`, with explicit expected and observed values, evidence anchors, normalization disclosure and discrepancy links. `source_not_stated` means the corpus candidate has a value that the source does not state. `candidate_not_stated` means the source states a value missing from the corpus candidate. A verified identity requires exact content-hash and extraction-binding matches. It cannot contain a mismatch or an open/blocking discrepancy. Only publisher or publication date may use either absence state, and only through an accepted, non-blocking, explicitly linked discrepancy. Locator, content and extraction dimensions can never use this exception.

## Decision states

- `verified`: identity promotion is allowed for the exact source and canonical identity bound by the artifact.
- `provisional`: evidence is retained, identity promotion remains forbidden, and next actions are required.
- `rejected`: a blocking mismatch prevents identity promotion and corrective next actions are required.

`requireVerifiedSourceIdentity` fails closed for provisional or rejected decision states, but remains a decision-only standalone check and does not establish acquisition provenance. `requireVerifiedSourceIdentityWithAcquisitionReceipt` is the provenance-bearing entry point. Source-analysis artifacts must name the exact verified identity artifact ID, version and hash; `validateSourceAnalysisIdentityReference` rejects artifact drift and lifecycle, source, metadata, content, canonical-identity or extraction drift.

## Honest AI provenance

Every run records exact provider, model name, workflow, workflow version, prompt hash, lifecycle/source/extraction/page-map input hashes, output hashes and times. Model build provenance has two states:

- `exact`: a real provider/runtime build identifier is available and recorded;
- `runtime_not_exposed`: the build is unavailable and `modelVersion` must be the explicit `runtime_not_exposed` sentinel.

Run time provenance is also explicit: `provider_exact` or `coordinator_observed_window`, with a required explanation. A coordinator-observed window is not presented as a provider stage timestamp.

## Closed downstream boundaries

Identity verification leaves all of these false:

- source-role owner confirmation;
- owner review;
- independent expert, partner and rights-holder validation;
- rights clearance;
- publication readiness;
- coverage promotion.

The normative implementation is `src/lib/knowledge/source-identity-verification.ts`; the portable schema is `knowledge/schema/source-identity-verification.schema.v1.json`.

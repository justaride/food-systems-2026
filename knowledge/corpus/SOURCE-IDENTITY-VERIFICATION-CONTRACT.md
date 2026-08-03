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

The extraction receipt ID is deterministically
`artifact.pdf_extraction.<raw-sha256>` and the page-map ID is
`artifact.pdf_page_map.<raw-sha256>`. Exactly one file anchor is required for
the acquisition receipt, extraction receipt, page map and immutable
pre-verification source-analysis input manifest. These anchors bind portable
paths, whole-file hashes and observation times. The input manifest must still be
an `identity_verification_candidate`; an eligible post-verification revision is
not valid identity input.

`canonicalIdentity` remains the corpus/database identity, for example `document:cmpp...`. It is never compared to a URL. `candidateLocator` separately records either the expected official HTTPS URL or expected controlled `private://` locator, and the canonical-locator dimension compares that value with the observed locator evidence.

The locator-evidence hash binds the named acquisition receipt, not the raw bytes directly. A controlled HTTPS receipt records the requested URL, redirect chain, final URL, response and body hash. A controlled private receipt records the exact recovery manifest and two-copy attestations. Their separate contract is [SOURCE-ACQUISITION-RECEIPT-CONTRACT.md](SOURCE-ACQUISITION-RECEIPT-CONTRACT.md).

The standalone identity artifact records only a receipt reference. Its machine-readable provenance boundary remains `receipt_reference_only`; standalone validation explicitly does not establish acquisition provenance. `validateSourceIdentityVerificationWithAcquisitionReceipt` establishes only acquisition provenance. Production identity promotion must use `requireVerifiedSourceIdentityWithEvidenceBundle`, which additionally parses and cross-binds the exact raw PDF, extraction receipt, page map, candidate input manifest, workflow and prompt-template bytes.

## Observations and match dimensions

The verifier records the observed title, publisher or explicit `not_stated` result, publication-date evidence, language codes, and official URL or controlled private locator. Evidence anchors point to hashed pages, official landing pages, repository records, private manifests, source-acquisition receipts, extraction receipts, page maps or source-analysis input manifests; they do not copy source text. For this PDF workflow, title, publisher, date and language must cite a validated cover or bibliographic page; locator and content hash must cite the acquisition receipt; extraction binding must cite both the extraction receipt and page map.

Exactly seven dimensions are assessed once each:

1. title;
2. publisher;
3. publication date;
4. language;
5. canonical locator;
6. content hash;
7. extraction binding.

Each dimension is `exact_match`, `normalized_match`, `source_not_stated`, `candidate_not_stated` or `mismatch`, with explicit expected and observed values, evidence anchors, normalization disclosure and discrepancy links. `source_not_stated` means the corpus candidate has a value that the source does not state. `candidate_not_stated` means the source states a value missing from the corpus candidate. A verified identity requires exact content-hash and extraction-binding matches. It cannot contain a mismatch or an open/blocking discrepancy. Only publisher or publication date may use either absence state, and only through an accepted, non-blocking, explicitly linked discrepancy. Locator, content and extraction dimensions can never use this exception.

`normalized_match` is not accepted on the strength of its explanation text. Runtime applies a deterministic dimension-specific policy: ordered Unicode-normalized alphanumeric tokens for titles and publishers, a canonical set comparison for language codes, and canonical HTTPS parsing for official locators. Publication date, controlled-private locator, content hash and extraction binding require exact values in v1. The raw values and explanation remain visible, but unrelated values cannot be promoted by resealing an artifact. The stable lifecycle/candidate title remains the corpus title; a legitimately normalized observed document title remains a separate field through manifest revision and source analysis.

## Decision states

- `verified`: identity promotion is allowed for the exact source and canonical identity bound by the artifact.
- `provisional`: evidence is retained, identity promotion remains forbidden, and next actions are required.
- `rejected`: a blocking mismatch prevents identity promotion and corrective next actions are required.

`requireVerifiedSourceIdentity` fails closed for provisional or rejected decision states, but remains a decision-only standalone check and does not establish acquisition provenance. `requireVerifiedSourceIdentityWithAcquisitionReceipt` is the lower-level acquisition check. Live lifecycle promotion must use `requireVerifiedSourceIdentityWithEvidenceBundle`; only that entry point establishes the complete acquisition, raw-PDF, extraction, page-map, candidate-manifest, workflow and prompt binding. Source-analysis artifacts must name the exact verified identity artifact ID, version and hash; `validateSourceAnalysisIdentityReference` rejects artifact drift and lifecycle, source, metadata, content, canonical-identity or extraction drift.

## Honest AI provenance

Every run records exact provider, model name, workflow ID and version, workflow-file hash, separate prompt-template hash, lifecycle/source/extraction/page-map input hashes, domain-separated canonical input-envelope hash, output hashes and times. Across all runs, the flattened stage sequence must be exactly metadata observation, locator assessment, identity match and decision, once each and in that order. Model build provenance has two states:

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

## Production sealer boundary

`scripts/knowledge/seal-source-identity-verification-artifact.ts` accepts an explicitly supplied, unsealed semantic artifact body plus all seven exact evidence inputs. It adds only the artifact seal, runs the complete evidence-bundle validator, and publishes a mode-`0600`, content-addressed file with exclusive and byte-idempotent semantics. It never invokes AI, repairs a payload, fabricates metadata, creates evidence, promotes a manifest or appends a lifecycle event. A provisional or rejected decision cannot be written through the verified-artifact path.

The canonical repository path is derived from the verified artifact hash. Identity promotion, verified-manifest creation and standalone source-analysis authorization all reject valid bytes replayed under any caller-selected path. For a private source, identity replay verifies the exact resolved source bytes needed by the event but leaves `private_capture_attestation_recorded` unchanged; it does not claim that both private copies were freshly verified.

The normative implementation is `src/lib/knowledge/source-identity-verification.ts`; the portable schema is `knowledge/schema/source-identity-verification.schema.v1.json`.

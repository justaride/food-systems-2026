# Source-analysis input manifests

This bundle binds each qualified PDF to the exact ordered normalized page input used by source analysis without storing source text in Git.

Each per-PDF manifest binds:

- the raw PDF SHA-256 processing unit;
- the exact tracked identity association and source binding from extraction qualification;
- a fail-closed workflow decision: a normal metadata match is only an identity-verification candidate, while a blocked legacy alias or an unregistered source candidate is eligible for neither identity verification nor source analysis;
- when and only when identity has actually been verified, a distinct `source_analysis_eligible` state containing the exact identity-artifact ID, version, repository path, file hash, internal seal and `verified` decision plus the exact lifecycle pre-state record ID, state hash and `updatedAt`;
- both the tracked file hash and internal seal of its page map and extraction receipt;
- every page number, normalized page SHA-256, byte count, Unicode character count, and word count;
- totals and a SHA-256 over the exact framed normalized page bytes;
- read-only private locator templates for the primary and replica archives.

The combined input serialization is versioned in `src/lib/knowledge/source-analysis-input-manifest.ts`. It hashes a fixed UTF-8 preamble, then each page in ascending contiguous order as a fixed delimiter, a canonical-JSON header terminated by LF, and the exact normalized page bytes. A fixed trailer delimiter and canonical-JSON page-count trailer terminate the stream. The header contains the page number, payload byte length, and normalized page hash, so page boundaries are unambiguous even if delimiter text occurs inside a page. `canonicalNormalizedInputBytes(...)` materializes those exact bytes for an analysis consumer and fails if any page payload is not valid UTF-8 or does not match its declared SHA-256.

The portable JSON Schema is `knowledge/schema/source-analysis-input-manifest.schema.v1.json`. Both the runtime Zod contract and JSON Schema reject absolute, parent-traversing, backslash, URI, home-relative, control-character, and non-normalized repository paths.

A manifest by itself does not mean that AI analysis, owner review, independent expert review, partner review, rights-holder review, rights clearance, publication, or coverage promotion has happened. The positive eligibility state also carries `combinedValidationRequired: true`: a consumer must supply and validate the referenced manifest bytes, identity-artifact bytes and lifecycle pre-state together with the source-analysis artifact. Changing an `allowed` boolean or resealing a detached manifest cannot authorize analysis.

## Checks

Portable tracked check, without access to either private archive:

```sh
npx tsx scripts/knowledge/generate-source-analysis-input-manifests.ts --check-tracked
```

Full private verification recomputes the raw PDF, every normalized page, the framed input hash, and both archive copies. The two roots must be absolute, real mode-`0700` directories with different real paths and directory identities. Corresponding raw PDFs and normalized pages must also have different filesystem identities, so a symlink, repeated root, or hard-linked file cannot masquerade as a replica. It requires:

```sh
FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT=/path/to/primary/corpus \
FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT=/path/to/replica/corpus \
npx tsx scripts/knowledge/generate-source-analysis-input-manifests.ts --check-private
```

`--write` uses the same two environment variables. It reads and verifies private material, writes only the tracked manifest bundle, and never creates or changes a private file.

Current stopline: all fifteen live manifests still have `workflowEligibility.sourceAnalysis.allowed: false`. Three established sources remain identity-verification candidates. Two remain blocked legacy-alias associations, and ten newly acquired official PDFs remain `unregistered_source_candidate` until controlled database registration creates exact identities. The generator cannot synthesize the positive state and did not promote any live unit; it requires separately supplied, validated identity-artifact and lifecycle inputs through the combined source-analysis validator.

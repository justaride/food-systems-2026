# Source identity verification workflow v1

Workflow ID: `workflow.source_identity_verification.v1`

Workflow version: `1.0.0`

Status: internal AI workflow; identity decision only

## Purpose

Determine whether one exact source-byte stream belongs to one provisional corpus identity. A successful run may support an `identity_verified` event. It must not classify source role, approve content, clear rights, authorize publication or promote coverage.

## Required inputs

The coordinator must provide and hash-bind all of the following before the run starts:

1. the exact baseline lifecycle record and its normative lifecycle-state hash;
2. the provisional database identity and metadata hash;
3. the raw-content SHA-256 and expected byte size;
4. one validated acquisition or controlled-private-access receipt;
5. the validated PDF extraction receipt and page map;
6. the validated source-analysis input manifest;
7. this workflow file and its exact SHA-256.

The run must stop if any referenced file, internal seal, identity key, raw-content hash, page-map hash, expected page count, locator or acquisition receipt differs.

## Exact ordered stages

1. `metadata_observation` — record title, publisher, publication date and language from hashed source positions or authoritative metadata.
2. `locator_assessment` — compare the provisional locator with the separately validated acquisition/private-access receipt.
3. `identity_match` — assess title, publisher, date, language, locator, content hash and extraction binding exactly once each.
4. `decision` — choose `verified`, `provisional` or `rejected` from the complete discrepancy set.

Stages must occur once, in this order. A missing, repeated or reordered stage invalidates the run.

## Decision rule

`verified` is permitted only when:

- content hash and extraction binding are exact matches;
- locator provenance is established by the separately validated receipt;
- no blocking discrepancy remains open;
- any absent publisher or date is explicitly disclosed as a non-blocking discrepancy;
- the artifact remains bound to the exact provisional lifecycle pre-state.

Otherwise return `provisional` or `rejected` with concrete next actions. Never repair or silently replace the corpus identity inside this workflow.

## Output boundary

Return one strict source-identity-verification payload containing paraphrased metadata observations, evidence locators, match dimensions, discrepancies and the decision. Do not include copied source passages. Keep every downstream review, rights, publication and coverage flag closed.

Record provider, model name, exposed model-version state, coordinator or provider time evidence, prompt hash, input-envelope hash and output hash honestly. Never invent a model build or provider timestamp.

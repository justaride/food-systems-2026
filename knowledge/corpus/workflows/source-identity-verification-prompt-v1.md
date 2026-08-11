# Source identity verification prompt v1

Prompt ID: `prompt.source_identity_verification.v1`

Workflow ID: `workflow.source_identity_verification.v1`

Prompt version: `1.0.0`

You are verifying whether one exact source-byte stream belongs to one exact
provisional corpus identity. Use only the hash-bound lifecycle snapshot,
candidate metadata, acquisition receipt, PDF extraction receipt, page map,
source-analysis input manifest and evidence positions supplied by the
coordinator.

Perform these stages exactly once and in this order:

1. `metadata_observation`
2. `locator_assessment`
3. `identity_match`
4. `decision`

Assess exactly these seven dimensions: title, publisher, publication date,
language, canonical locator, content hash and extraction binding. Content hash
and extraction binding must be exact matches for a verified decision. Do not
silently repair metadata. Record every absence or discrepancy explicitly and
leave the identity provisional or rejected when a blocking discrepancy remains.

Return only the strict identity-verification payload. Paraphrase observations;
do not copy source passages. Keep source-role confirmation, owner review,
independent validation, partner validation, rights-holder validation, rights
clearance, publication readiness and coverage promotion false.

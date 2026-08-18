# Candidate analysis workflow v1

Workflow ID: `workflow.candidate_analysis.v1`

Workflow version: `1.0.0`

Status: autonomous internal workflow; candidate-only output

## Minimum input gate

The coordinator must bind stable input bytes or records, their SHA-256, the source identity key, identity confidence (`exact`, `provisional` or `unresolved`), this workflow version, prompt/configuration hashes and every content-unit locator consumed.

Stable, readable and hash-bound input is sufficient for candidate analysis. The identity-confidence value travels with every output and constrains later target-profile promotion; it does not create a human precondition for machine reading.

## Flexible execution

Runs may be parallel, partial, retried or model-specific. Each run has its own immutable event sequence. A workflow declares its required outputs; there is no global requirement that every run execute the same stage list exactly once.

Recursive machine use must bind every prior candidate and input it consumes. It appends a new candidate event and may not overwrite or promote a prior event.

## Output boundary

Every output remains `candidate`. The workflow must not create or modify human review, canonical data, publication or coverage. Missing owner review, rights or publication authority is expected downstream state and is not an analysis error.

The workflow must not create target promotion. Candidate confidence, repeated agreement or reconciliation may prioritize a later review but never grant `human_review` or `promotion` authority.

## Reporting

Report this workflow only as candidate analysis, with its exact input, configuration and output hashes. Report candidate, human-review, target-promotion, publication and coverage states separately.

# Candidate analysis prompt template v1

Prompt template ID: `prompt.candidate_analysis.v1`

Prompt template version: `1.0.0`

Prompt template repository path: `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md`

Workflow ID: `workflow.candidate_analysis.v1`

Workflow version: `1.0.0`

Workflow repository path: `knowledge/corpus/workflows/candidate-analysis-v1.md`

Status: canonical internal prompt; candidate-only output

## System instruction

Analyze only the exact content units in the run input envelope. Produce traceable candidate assertions, artifacts, evidence links, limitations, gaps, and contradictions in the declared output profile. Keep source identity confidence and locator precision explicit. Do not infer missing bytes, silently merge conflicting records, or treat repetition or confidence as authority.

Every output is machine-generated `candidate` material. Do not create or represent human review, approval, canonical state, rights clearance, target promotion, publication, coverage readiness, or external readiness. Refer questions requiring those decisions to their separate downstream authority processes.

## Required run binding

The run must bind this prompt's exact repository path, ID, version, and SHA-256 together with the candidate workflow's exact repository path, ID, version, and SHA-256. A copied, edited, renamed, or similarly titled prompt is a different input and must not reuse this binding.

## Required response boundary

Return only the candidate payload schemas declared by the candidate-analysis contract. Preserve exact content-unit IDs, input hashes, locators, evidence relations, inherited limitations, and output-manifest membership. Missing required evidence or identity bindings must remain an explicit limitation or fail-closed terminal validation; it must never be replaced with an authority claim.

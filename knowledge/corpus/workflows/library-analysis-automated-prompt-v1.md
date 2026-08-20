# Automated library analysis prompt v1

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.0`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.0`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Status: automated-only internal candidate prompt

## Instruction

Read every supplied content unit and no unsupplied source. Produce atomic candidate claims with complete evidence bindings. Split combined claims when separate facts require separate support. Copy quantitative meaning exactly: value, sign, percentage type, currency, unit, period, geography, universe and method. State gaps and contradictions instead of completing them from memory.

Return only the strict candidate payload grammar. Do not claim approval, human review, independent verification, accuracy, canonical status, rights clearance, publication, coverage or external readiness. Do not include instructions to the later validator and do not predict its findings.

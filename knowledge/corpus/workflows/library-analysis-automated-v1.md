# Automated library analysis workflow v1

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.0`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.0`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Status: automated-only internal candidate analysis

## Input gate

Analyze only the exact readable content units in the sealed population row and run input envelope. Every byte source, locator, source-version hash, workflow byte hash and prompt byte hash must be present and mutually bound before analysis begins. Missing or unreadable bytes produce `blocked_input`; a locator alone is not content.

## Analysis method

Decompose prose into atomic candidate claims. Preserve every material number, percentage, currency, unit, sign, period, geography and named actor. Record contradictions, omissions, uncertainty, identity confidence and high-risk subject flags. Every claim must cite one or more exact input content-unit IDs and the narrowest available locator. Complete analysis requires every claim-bearing fact to have direct evidence or an explicit limitation.

## Output boundary

Return only strict candidate artifacts, assertions and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Analysis and validation are different runs with different workflow and prompt bytes. Automated completion may support internal AI context only after the separate validation policy permits it.

# Automated library analysis prompt v1

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.1`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.1`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Status: automated-only internal candidate prompt

## Instruction

Read every supplied content unit and no unsupplied source. Produce atomic candidate claims with complete evidence bindings. Split combined claims when separate facts require separate support. Copy quantitative meaning exactly: value, sign, percentage type, currency, unit, period, geography, universe and method. State gaps and contradictions instead of completing them from memory.

Do not turn headings, titles, labels, table-of-contents rows, isolated chart or table values, or other context-dependent fragments into claims unless the evidence excerpt also carries the source-visible context needed to interpret them. A claim must be a self-contained declarative proposition with a source-grounded subject and predicate. A quantitative claim must contain every source-visible qualifier materially needed to interpret it, such as its denominator or universe, period, unit, method or geography. If materially necessary context is absent, use `no_material_claim` or an explicit limitation; do not infer it from layout, memory or adjacent unsupplied context.

The evidence excerpt must itself contain the value and every material qualifier asserted by the claim. Preserve geography exactly as written in that excerpt. Do not translate, canonicalize, broaden or substitute country, region or market names or codes.

Return only the strict candidate payload grammar. Do not claim approval, human review, independent verification, accuracy, canonical status, rights clearance, publication, coverage or external readiness. Do not include instructions to the later validator and do not predict its findings.

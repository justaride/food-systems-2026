# Automated library validation prompt v1

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.1`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.1`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Status: automated-only internal candidate-validation prompt

## Instruction

Independently compare every supplied candidate assertion with the supplied source content. Check each atomic fact, all quantitative tokens, support and contradiction, locator and excerpt integrity, classification boundaries, omissions and high-risk implications. Emit only F1-F5 findings that name the exact assessed assertion and content units; include deterministic rule IDs whenever a deterministic check contributed.

Treat headings, labels, table-of-contents rows, bare values and context-dependent table or chart fragments promoted without source-visible subject or interpretive context as F4 classification overreach. Treat evidence excerpts that omit a source-visible qualifier materially needed for the asserted subject, denominator or universe, period, unit, method, geography or comparison basis as F3. Geography translation, canonicalization, broadening or substitution is unsupported unless the evidence excerpt states the asserted form.

Do not rewrite the analysis into an approval. Do not claim human review, independent verification, accuracy, canonical status, promotion, rights clearance, publication, coverage or external readiness. A clean automated validation is still automated-only internal candidate evidence.

# Full source analysis prompt template v1

Prompt ID: `prompt.full_source_analysis.v1`

Prompt version: `1.0.0`

Status: internal AI prompt; candidate knowledge only

You are analysing one exact, identity-verified source for Food Systems 2026.
Use only the ordered normalized source units supplied in the canonical input
envelope and the explicitly named predecessor artifacts. Treat every supplied
unit as required input. Do not silently skip, reorder, replace or supplement a
unit.

Perform these stages exactly once and in this order:

1. `full_text_read`
2. `locator_grounding`
3. `structured_analysis`
4. `reconciliation`

Return a strict `source-analysis-artifact-v1` object. Follow the executable
schema and `workflow.full_source_analysis.v1`. Account for every expected unit,
preserve the exact locator and normalized-text hashes, and cite every claim or
observation to the supplied locators. Paraphrase source content; do not include
direct quotations or retained source text.

Separate source-reported findings, analyst calculations and analyst inference.
Preserve units, universe, period, geography, method, uncertainty, limitations,
conflicts and cannot-support boundaries. Record contradictions and open
questions rather than resolving them by convenience. Proposed concepts,
entities, relationships, flows, circular strategies and coverage links remain
candidates.

Do not claim owner review, independent validation, partner validation,
rights-holder validation, rights clearance, publication approval or coverage
promotion. Stop the lifecycle at completed `cross_check`. If any required unit,
binding or evidence is missing or inconsistent, fail closed instead of
returning a completed analysis.

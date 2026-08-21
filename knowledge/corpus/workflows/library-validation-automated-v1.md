# Automated library validation workflow v1

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.2`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.2`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Status: automated-only internal candidate validation

## Input gate

Validate only a sealed analysis run and its exact assertions against the same hash-bound source content units. Require the analysis output-manifest hash, assertion payload hashes and population hash. The validator is a separate candidate run; it does not inherit authority from the analysis run.

## Validation method

Decompose every assertion into facts and test source support, contradiction, numeric semantics, locator integrity, omissions, classifications and risk. Record findings as F1 factual contradiction, F2 fabricated or wrong-source support, F3 insufficient or semantically incomplete evidence, F4 classification or authority overreach, or F5 material omission and risk. Bind each finding to assessed assertions, content units and deterministic rules where applicable.

Classify an omitted material denominator, universe, respondent count, period, unit, geography or market, method, comparison basis or forecast basis as F3. Classify a heading, label, isolated value, context-dependent fragment, unresolved anaphoric proposition, publication-readiness statement, approval statement or other unsupported authority claim as F4. An anaphoric expression is resolved only when its antecedent and scope are visible in the same evidence excerpt. Do not classify a complete declarative sentence as F4 merely because it is formatted as a bullet.

## Output boundary

Return only strict candidate validation artifacts, findings, dependencies and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Finding rates describe this automated pass only and must not be labeled model accuracy or actual error rate.

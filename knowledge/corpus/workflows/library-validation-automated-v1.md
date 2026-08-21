# Automated library validation workflow v1

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.5`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.5`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Status: automated-only internal candidate validation

## Input gate

Validate only a sealed analysis run and its exact assertions against the same hash-bound source content units. Require the analysis output-manifest hash, assertion payload hashes and population hash. The validator is a separate candidate run; it does not inherit authority from the analysis run.

## Validation method

Decompose every assertion into facts and test source support, contradiction, numeric semantics, locator integrity, omissions, classifications and risk. Check exact actor/source identity and whether the claim preserves source-visible period, as-of date, universe, respondent count, method, geography, comparison basis and forecast/projection basis. Record findings as F1 factual contradiction, F2 fabricated or wrong-source support, F3 insufficient or semantically incomplete evidence, F4 classification or authority overreach, or F5 material omission and risk. Bind each finding to assessed assertions, content units and deterministic rules where applicable.

Classify an omitted material denominator, universe, respondent count, period, as-of date, unit, geography or market, method, comparison basis, forecast/projection basis or horizon as F3. Treat an evidence excerpt that ends mid-clause, at a dangling preposition or conjunction, in a table/list continuation, or before a source-visible qualifier as F3. Classify a heading, label, isolated value, context-dependent fragment, unresolved anaphoric proposition, unidentified actor/source attribution, publication-readiness statement, approval statement or other unsupported authority claim as F4. An anaphoric expression is resolved only when its antecedent and scope are visible in the same evidence excerpt. A scoped method limitation must not be validated as an absolute method claim. Do not classify a complete declarative sentence as F4 merely because it is formatted as a bullet.

Bare generic references to work, method, mapping or results are unresolved anaphora unless the claim itself names the work, method, mapping object or result scope. Treat unresolved `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `the work`, `the method`, `the mapping` and `the result` as F4 even when another sentence or unit contains the missing referent.

Unit-level survey context never repairs an excerpt: when the unit identifies a survey or respondent population, a survey-derived assertion missing the source-visible respondent count or universe in its own evidence is F3. A reported-measure assertion missing its source-visible reporting period or method/analytical basis is F3. An ownership or current-status assertion missing an as-of date or named project/scope is F3. A generic expectation such as “the expectation” or “Forventningen” without a same-excerpt actor or project antecedent is F4. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

## Output boundary

Return only strict candidate validation artifacts, findings, dependencies and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Finding rates describe this automated pass only and must not be labeled model accuracy or actual error rate.

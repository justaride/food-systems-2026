# Automated library validation workflow v1

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.9`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.9`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Status: automated-only internal candidate validation

## Input gate

Validate only a sealed analysis run and its exact assertions against the same hash-bound source content units. Require the analysis output-manifest hash, assertion payload hashes and population hash. The validator is a separate candidate run; it does not inherit authority from the analysis run.

## Validation method

Decompose every assertion into facts and test source support, contradiction, numeric semantics, locator integrity, omissions, classifications and risk. Check exact actor/source identity and whether the claim preserves source-visible period, as-of date, universe, respondent count, method, geography, comparison basis and forecast/projection basis. Record findings as F1 factual contradiction, F2 fabricated or wrong-source support, F3 insufficient or semantically incomplete evidence, F4 classification or authority overreach, or F5 material omission and risk. Bind each finding to assessed assertions, content units and deterministic rules where applicable.

Classify an omitted material denominator, universe, respondent count, period, as-of date, unit, geography or market, method, comparison basis, forecast/projection basis or horizon as F3. Treat an evidence excerpt that ends mid-clause, at a dangling preposition or conjunction, in a table/list continuation, or before a source-visible qualifier as F3. Classify a heading, label, isolated value, context-dependent fragment, unresolved anaphoric proposition, unidentified actor/source attribution, publication-readiness statement, approval statement or other unsupported authority claim as F4. An anaphoric expression is resolved only when its antecedent and scope are visible in the same evidence excerpt. A scoped method limitation must not be validated as an absolute method claim. Do not classify a complete declarative sentence as F4 merely because it is formatted as a bullet.

Bare generic references to work, method, mapping or results are unresolved anaphora unless the claim itself names the work, method, mapping object or result scope. Treat unresolved `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `resultatene`, `the work`, `the method`, `the mapping`, `the result` and `the results` as F4 even when another sentence or unit contains the missing referent.

Treat unresolved references to an appendix, authority analysis, sample, information object, similar analysis or unnamed analysis as F4 unless the claim and evidence name the referent. A double-counting statement without the counted object is F4. A market-share assertion without the share's source-visible measurement year or as-of date in both claim and evidence is F3.

Treat bare singular `resultatet` or `the result`, and an excerpt opening with unresolved plural `resultatene` or `the results`, as F4 when the excerpt does not identify the result object, even if the rewritten claim supplies a scoped compound noun. Do not flag a plural reference whose antecedent and scope already appear earlier in the same excerpt.

Unit-level survey context never repairs an excerpt: when the unit identifies a survey or respondent population, a survey-derived assertion missing the source-visible respondent count or universe in its own evidence is F3. A reported-measure assertion missing its source-visible reporting period or method/analytical basis is F3. An ownership or current-status assertion missing an as-of date or named project/scope is F3. A generic expectation such as “the expectation” or “Forventningen” without a same-excerpt actor or project antecedent is F4. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

Classify as F3 an analytical-measure assertion about calculated or mapped RNOA, profitability, returns or operating margins whose claim or evidence omits the exact metric, sample identity or basis, period or analytical basis. Evidence ending at `ikke har analysert`, `did not analyze` or `has not analyzed` is incomplete when the assertion supplies the missing object. A claim-level material exclusion, including franchise-owned stores being excluded, must name the exact excluded population and containing numbers, sample or dataset in both claim and evidence. Treat `Tilsynets datagrunnlag` or `the authority's data basis` as unresolved authority unless the authority is named.

Treat a reported price change without its source-visible geography or market as F3. Treat actor attribution as F4 when the evidence does not visibly name the same actor and reporting action; a bare `from X` provenance phrase is insufficient. Generic references to empirical studies or the literature are unresolved authorities without the named study or comparison basis and its population, period and method. A comparative pattern without a named comparison basis and period is F3. Passive identification without a named identifying actor or analysis scope is F4.

For possessive ownership, require the owned company identity in the evidence, not only owner, share and date. Treat an unresolved evidence opening such as `This survey` or its Norwegian equivalents as F4 when a named source identity appears only in the claim. For `sheet_range` evidence, treat a bare delimited row without header or explicit field labels as F4 when the claim interprets named fields.

Treat a rewritten report-title assertion supported only by a bare title heading as F4 unless the excerpt includes an explicit report/title label or complete declarative title sentence. For figure and chart comparisons, omitted material caption or method qualifiers such as index base, transaction stage, exclusions or subsidy treatment are F3. Conflicting prose, chart or table values for the same measure and population must be surfaced; silently selecting one value is a material F5 omission.

## Output boundary

Return only strict candidate validation artifacts, findings, dependencies and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Finding rates describe this automated pass only and must not be labeled model accuracy or actual error rate.

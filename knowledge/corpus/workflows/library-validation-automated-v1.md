# Automated library validation workflow v1

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.16`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.16`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Status: automated-only internal candidate validation

## Input gate

Validate only a sealed analysis run and its exact assertions against the same hash-bound source content units. Require the analysis output-manifest hash, assertion payload hashes and population hash. The validator is a separate candidate run; it does not inherit authority from the analysis run.

## Validation method

Decompose every assertion into facts and test source support, contradiction, numeric semantics, locator integrity, omissions, classifications and risk. Check exact actor/source identity and whether the claim preserves source-visible period, as-of date, universe, respondent count, method, geography, comparison basis and forecast/projection basis. Record findings as F1 factual contradiction, F2 fabricated or wrong-source support, F3 insufficient or semantically incomplete evidence, F4 classification or authority overreach, or F5 material omission and risk. Bind each finding to assessed assertions, content units and deterministic rules where applicable.

Classify an omitted material denominator, universe, respondent count, period, as-of date, unit, geography or market, method, comparison basis, forecast/projection basis or horizon as F3. Treat an evidence excerpt that ends mid-clause, at a dangling preposition or conjunction, in a table/list continuation, or before a source-visible qualifier as F3. Classify a heading, label, isolated value, context-dependent fragment, unresolved anaphoric proposition, unidentified actor/source attribution, publication-readiness statement, approval statement or other unsupported authority claim as F4. An anaphoric expression is resolved only when its antecedent and scope are visible in the same evidence excerpt. A scoped method limitation must not be validated as an absolute method claim. Do not classify a complete declarative sentence as F4 merely because it is formatted as a bullet.

Treat a nominal metadata label such as `Metadata-import` as F4 when promoted as a claim. Treat `Dette dokumentet` or `This document` as unresolved F4 unless the same claim and evidence excerpt name the document.

Bare generic references to work, method, mapping or results are unresolved anaphora unless the claim itself names the work, method, mapping object or result scope. Treat unresolved `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `resultatene`, `the work`, `the method`, `the mapping`, `the result` and `the results` as F4 even when another sentence or unit contains the missing referent.

Treat unresolved references to an appendix, authority analysis, sample, information object, similar analysis or unnamed analysis as F4 unless the claim and evidence name the referent. A double-counting statement without the counted object is F4. A market-share assertion without the share's source-visible measurement year or as-of date in both claim and evidence is F3.

Treat bare singular `resultatet` or `the result`, and an excerpt opening with unresolved plural `resultatene` or `the results`, as F4 when the excerpt does not identify the result object, even if the rewritten claim supplies a scoped compound noun. Do not flag a plural reference whose antecedent and scope already appear earlier in the same excerpt.

Unit-level survey context never repairs an excerpt: when the unit identifies a survey or respondent population, a survey-derived assertion missing the source-visible respondent count or universe in its own evidence is F3. A reported-measure assertion missing its source-visible reporting period or method/analytical basis is F3. An ownership or current-status assertion missing an as-of date or named project/scope is F3. A generic expectation such as “the expectation” or “Forventningen” without a same-excerpt actor or project antecedent is F4. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

A reported dataset-receipt count missing its source-visible reporting period or as-of date is F3. A standalone material exclusion naming only `de innsendte dataene` or equivalent without the dataset, supplying actor or population and period is F3.

Classify as F3 an analytical-measure assertion about calculated or mapped RNOA, profitability, returns or operating margins whose claim or evidence omits the exact metric, sample identity or basis, period or analytical basis. Evidence ending at `ikke har analysert`, `did not analyze` or `has not analyzed` is incomplete when the assertion supplies the missing object. A claim-level material exclusion, including franchise-owned stores being excluded, must name the exact excluded population and containing numbers, sample or dataset in both claim and evidence. Treat `Tilsynets datagrunnlag` or `the authority's data basis` as unresolved authority unless the authority is named.

Treat a reported price change without its source-visible geography or market as F3. Treat actor attribution as F4 when the evidence does not visibly name the same actor and reporting action; a bare `from X` provenance phrase is insufficient. Generic references to empirical studies or the literature are unresolved authorities without the named study or comparison basis and its population, period and method. A comparative pattern without a named comparison basis and period is F3. Passive identification without a named identifying actor or analysis scope is F4.

For possessive ownership, require the owned company identity in the evidence, not only owner, share and date. Treat an unresolved evidence opening such as `This survey` or its Norwegian equivalents as F4 when a named source identity appears only in the claim. For `sheet_range` evidence, treat one or more delimited data rows without the source header or explicit source-visible field labels as F4 when the claim interprets named fields. Treat an interrogative excerpt as F3 when it is recast as a result; accept it only when the claim explicitly reports that the form, survey or questionnaire asks that question.

Treat `aksjonær` and `shareholder` as ownership language and require a source-visible as-of date. For a method-bearing claim, bare evidence `Metoden` or `the method` is unresolved F4 even when the claim rewrites a method name; require the evidence itself to name the method or carry its local antecedent. A bare method reference in an unrelated later sentence does not invalidate a non-method claim.

Treat a rewritten report-title assertion supported only by a bare title heading as F4 unless the excerpt includes an explicit report/title label or complete declarative title sentence. For figure and chart comparisons, omitted material caption or method qualifiers such as index base, transaction stage, exclusions or subsidy treatment are F3. Conflicting prose, chart or table values for the same measure and population must be surfaced; silently selecting one value is a material F5 omission.

Automated validation must reject material actor-universe broadening, unbounded period references, unnamed deictic study openings, and unresolved approach or indicator references.

It must also reject figure-derived numeric claims missing material caption scope, analytical superlatives or retail-margin trends missing their bounded universe, bare deictic value clauses without a same-excerpt antecedent, reported results that drop their speaker, and generic webinar or main-message references without the local event identity.

Classify as F3 current-status language such as `i dag`, `today`, `nå` or `now` without a reference year in the same status sentence in claim and evidence, including when the marker appears only in evidence. Every qualitative profitability finding, return comparison, profitability mapping, margin trend or gross-margin calculation, including copular findings such as `lønnsomheten var høy`, requires a bounded period and analytical basis locally in claim and evidence; classify either omission as F3 even when the unit supplies neither. A timeless definition or explicit no-support conclusion exempts only its own analytical clause, not a coordinated or separate analytical-result clause. Classify a definition/calculation `her`/`here` whose evidence or claim sentence omits its appendix, method or analytical object as F4. Classify an interpretive index value, including `tolkes`/`interpreted`, whose interpreting evidence or claim sentence omits the index identity as F4. Classify changed personnel allocation without its reference year and named project in the same allocation sentence as F3; accept an unambiguous acronym as a one-word project identity. When the source identifies a percentage paired with a sales amount as market share of market value, omission of that measure or denominator is F3. Treat a syntactic Markdown row with two or more columns, expressed either with an outer pipe or as compact cell-only content without sentence punctuation, without its header or explicit field labels as F4 in every unit type; surrounding whitespace or a trailing newline does not repair it. Ordinary prose containing only an internal `A | B` phrase is not a Markdown row.

A quantified gross-margin range missing its bounded period, entity universe or analytical basis is F3. When each period pairs sales with a percentage, every period's percentage must locally retain the source-visible share measure and denominator.

Classify bare cleanup or data subjects as F4 when the cleaned object, analytical dataset or owning analysis is not named locally. This includes `Oppryddingen`, `the cleanup`, sentence-opening `Data`, `Datagrunnlaget` and `the data basis`, while explicitly scoped forms remain eligible. Evidence opening with unresolved `I stedet`/`Instead` is F4. Passive introduction or evaluation without the introducing or evaluating actor is F4.

Treat a percentage of total turnover as an implicit market share and classify a missing same-sentence measurement year as F3. A total multi-group budget that drops the source-visible per-group allocation or named groups is F3. A figure comparison expressed as a multiple that drops full caption period, index base, transaction stage or material exclusions such as subsidy treatment is F3. A supplied-period dataset claim that drops a source-visible dataset exclusion is F3. Qualitative survey paraphrases about producer aims, drivers, determinants, geographic markets, obstacles or company locations without same-excerpt respondent count and universe are F3. Evidence ending with a colon before its defining list is truncated and F3.

Classify as F5 an obviously material structured unit reported as `no_material_claim`, regardless of content-unit type, including a summary with `Hovedfunn`/`Main findings`/`Findings` or method sections, a header-bound inventory row, an internal-register record with populated `keyFindings` or `recommendations`, a master analysis index with structured status results, explicit Competition Authority findings, named study findings, or a scoped project budget with total and per-group allocations.

Declarative survey results, response totals and forecasts reported as `no_material_claim` are also F5. Missing local survey context requires typed `blocked` coverage rather than omission.

## Output boundary

Return only strict candidate validation artifacts, findings, dependencies and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Finding rates describe this automated pass only and must not be labeled model accuracy or actual error rate.

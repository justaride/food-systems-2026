# Automated library validation prompt v1

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.11`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.11`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Status: automated-only internal candidate-validation prompt

## Instruction

Independently compare every supplied candidate assertion with the supplied source content. Check each atomic fact, exact actor/source identity, all quantitative tokens, support and contradiction, locator and excerpt integrity, classification boundaries, omissions and high-risk implications. For each claim, audit period/as-of date, denominator or universe, respondent count, unit, geography/market, method/basis, comparison basis and forecast/projection basis and horizon. Emit only F1-F5 findings that name the exact assessed assertion and content units; include deterministic rule IDs whenever a deterministic check contributed.

Treat headings, labels, table-of-contents rows, bare values and context-dependent table or chart fragments promoted without source-visible subject or interpretive context as F4 classification overreach. Treat evidence excerpts that omit a source-visible qualifier materially needed for the asserted subject, denominator or universe, respondent count, period, as-of date, unit, method, geography or comparison basis as F3. Treat an excerpt that ends mid-sentence, at a dangling preposition or conjunction, in a table/list continuation, or before a needed qualifier as truncated evidence and F3. Geography translation, canonicalization, broadening or substitution is unsupported unless the evidence excerpt states the asserted form.

Anaphoric language is valid only when its antecedent and scope are source-visible in the same evidence excerpt. This includes pronouns and shorthand such as "the method", "the results", "this indicator", "the companies", "another factor", "here", "the study" and "the task". Otherwise emit F4 for context-dependent classification overreach. Use F3 when the proposition is otherwise explicit but omits a materially necessary denominator, universe, respondent count, period, as-of date, unit, method, geography or market, comparison basis, forecast/projection basis or horizon. For current-status, ownership/share and forecast claims, require the source-visible reference date. For negative or absolute method claims, require all source-visible scope qualifiers, including phrases such as "in this context", "for this analysis" and "for this dataset". Do not demand non-material context from a complete qualitative proposition, and do not classify a proposition as F4 only because it is formatted as a bullet.

Classify as F4 a bare generic work, method, mapping or result reference whose object and scope are not named in the claim itself. This includes unresolved uses of `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `resultatene`, `the work`, `the method`, `the mapping`, `the result` and `the results`. A description elsewhere in the unit does not resolve it; the claim and its own evidence excerpt must make the referent explicit.

Also classify as F4 unresolved local references such as `dette vedlegget`, `Tilsynets analyser`, `utvalget`, `informasjonen`, `lignende analyser`, `analysen`, `this appendix`, `the authority's analysis`, `the sample`, `the information`, `similar analyses` and `the analysis` when the claim and evidence do not name the referent. A double-counting statement without the counted object is F4. An undated market-share assertion is F3; require the share's measurement year or as-of date in the claim and evidence, not merely a document publication date.

Classify as F4 a scoped rewritten claim whose evidence contains bare singular `resultatet` or `the result`, or opens with unresolved plural `resultatene` or `the results`, without identifying the result object. A plural reference is resolved when its antecedent and scope already appear earlier in the same excerpt.

Claims of publication readiness, approval, completeness, authority, external validity or rights clearance require explicit source-visible wording. They must not be inferred from a source being official, downloadable, reviewed or described as useful.

Unit-level survey context never repairs an excerpt: if the unit identifies a survey or respondent population, classify a survey-derived assertion that lacks the source-visible respondent count or universe in its own evidence as F3. Classify a reported-measure assertion as F3 when its own evidence lacks the source-visible reporting period or method/analytical basis. Classify an ownership or current-status assertion as F3 when its own evidence lacks an as-of date or named project/scope. Classify a generic expectation such as “the expectation” or “Forventningen” without a same-excerpt actor or project antecedent as F4. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

Classify as F3 an analytical-measure claim about calculated or mapped RNOA, profitability, returns or operating margins if its claim or evidence omits the exact metric, sample identity or basis, period or analytical basis. Evidence ending at `ikke har analysert`, `did not analyze` or `has not analyzed` is truncated when the assertion supplies the omitted object. A material exclusion asserted by the claim, including exclusion of franchise-owned stores, must name the exact excluded population and containing numbers, sample or dataset in both claim and evidence. Treat `Tilsynets datagrunnlag` or `the authority's data basis` as unresolved authority unless the authority is named.

Classify a reported price change without its source-visible geography or market as F3. Classify actor attribution such as `X oppga`, `X reported` or `X stated` as F4 when the evidence does not visibly name that same actor and reporting action; a bare `from X` provenance phrase is insufficient. Treat `empiriske studier`, `empirical studies` and `the literature` as unresolved authorities unless the assertion names the study or comparison basis and its population, period and method. A comparative pattern without a named comparison basis and period is F3. Passive identification without a named identifying actor or analysis scope is F4.

For possessive ownership statements, require the owned company identity in the evidence excerpt, not only the owner, percentage and date. Classify as F4 a named-survey claim whose evidence begins with unresolved `This survey`, `This questionnaire`, `This study` or a Norwegian equivalent without the name. For `sheet_range` units, classify a bare delimited row as F4 when the claim interprets named fields but the evidence provides neither the header nor explicit field labels.

Classify as F4 a rewritten report-title assertion supported only by a bare title heading without an explicit report/title label or complete declarative title sentence. For figure- or chart-derived comparisons, use F3 when the excerpt drops materially relevant caption or method qualifiers such as index base, transaction stage, exclusions or subsidy treatment. When the same supplied unit gives conflicting prose, chart or table values for the same measure and population, require the assertion to state the discrepancy and both values; silently selecting one value is a material F5 omission.

Classify as F3 a claim that broadens a source-visible actor universe, including dropping `som inngår i kartleggingen`, or refers to `perioden` without both boundary years. Classify as F4 a bare deictic study opening, a generic `tilnærmingen`, or `denne indikatoren` when the identity is absent from the same claim and evidence excerpt.

Classify as F3 a figure-derived numeric claim that omits a material caption qualifier such as aggregated actors, full figure period or inflation-adjustment status. Analytical superlatives without their bounded comparison period and entity universe, and retail-margin trends without their source-visible sample, are F3. Classify as F4 a bare deictic value clause whose antecedent is outside the evidence excerpt, a reported result that drops its source-visible speaker attribution, or generic `Webinaret`/`Hovedbudskapet` wording without the locally named event.

Do not rewrite the analysis into an approval. Do not claim human review, independent verification, accuracy, canonical status, promotion, rights clearance, publication, coverage or external readiness. A clean automated validation is still automated-only internal candidate evidence.

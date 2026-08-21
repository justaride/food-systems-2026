# Automated library validation prompt v1

Prompt template ID: `prompt.library_validation.automated.v1`

Prompt template version: `1.0.4`

Prompt template repository path: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`

Workflow ID: `workflow.library_validation.automated.v1`

Workflow version: `1.0.4`

Workflow repository path: `knowledge/corpus/workflows/library-validation-automated-v1.md`

Status: automated-only internal candidate-validation prompt

## Instruction

Independently compare every supplied candidate assertion with the supplied source content. Check each atomic fact, exact actor/source identity, all quantitative tokens, support and contradiction, locator and excerpt integrity, classification boundaries, omissions and high-risk implications. For each claim, audit period/as-of date, denominator or universe, respondent count, unit, geography/market, method/basis, comparison basis and forecast/projection basis and horizon. Emit only F1-F5 findings that name the exact assessed assertion and content units; include deterministic rule IDs whenever a deterministic check contributed.

Treat headings, labels, table-of-contents rows, bare values and context-dependent table or chart fragments promoted without source-visible subject or interpretive context as F4 classification overreach. Treat evidence excerpts that omit a source-visible qualifier materially needed for the asserted subject, denominator or universe, respondent count, period, as-of date, unit, method, geography or comparison basis as F3. Treat an excerpt that ends mid-sentence, at a dangling preposition or conjunction, in a table/list continuation, or before a needed qualifier as truncated evidence and F3. Geography translation, canonicalization, broadening or substitution is unsupported unless the evidence excerpt states the asserted form.

Anaphoric language is valid only when its antecedent and scope are source-visible in the same evidence excerpt. This includes pronouns and shorthand such as "the method", "the results", "this indicator", "the companies", "another factor", "here", "the study" and "the task". Otherwise emit F4 for context-dependent classification overreach. Use F3 when the proposition is otherwise explicit but omits a materially necessary denominator, universe, respondent count, period, as-of date, unit, method, geography or market, comparison basis, forecast/projection basis or horizon. For current-status, ownership/share and forecast claims, require the source-visible reference date. For negative or absolute method claims, require all source-visible scope qualifiers, including phrases such as "in this context", "for this analysis" and "for this dataset". Do not demand non-material context from a complete qualitative proposition, and do not classify a proposition as F4 only because it is formatted as a bullet.

Claims of publication readiness, approval, completeness, authority, external validity or rights clearance require explicit source-visible wording. They must not be inferred from a source being official, downloadable, reviewed or described as useful.

Unit-level survey context never repairs an excerpt: if the unit identifies a survey or respondent population, classify a survey-derived assertion that lacks the source-visible respondent count or universe in its own evidence as F3. Classify a reported-measure assertion as F3 when its own evidence lacks the source-visible reporting period or method/analytical basis. Classify an ownership or current-status assertion as F3 when its own evidence lacks an as-of date or named project/scope. Classify a generic expectation such as “the expectation” or “Forventningen” without a same-excerpt actor or project antecedent as F4. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

Do not rewrite the analysis into an approval. Do not claim human review, independent verification, accuracy, canonical status, promotion, rights clearance, publication, coverage or external readiness. A clean automated validation is still automated-only internal candidate evidence.

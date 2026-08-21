# Automated library analysis workflow v1

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.6`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.6`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Status: automated-only internal candidate analysis

## Input gate

Analyze only the exact readable content units in the sealed population row and run input envelope. Every byte source, locator, source-version hash, workflow byte hash and prompt byte hash must be present and mutually bound before analysis begins. Preserve the exact named actor, source, study, report, respondent group and attribution visible in the supplied bytes; do not replace an unidentified or differently named source actor with the document, institution or task. Missing or unreadable bytes produce `blocked_input`; a locator alone is not content.

## Analysis method

Decompose prose into atomic candidate claims. Preserve every material number, percentage, currency, unit, sign, period, geography and named actor. Record contradictions, omissions, uncertainty, identity confidence and high-risk subject flags. Every claim must cite one or more exact input content-unit IDs and the narrowest available locator. Complete analysis requires every claim-bearing fact to have direct evidence or an explicit limitation.

A claim is eligible only when it is a self-contained declarative proposition with a source-grounded subject and predicate. Headings, titles, labels, table-of-contents rows, isolated chart or table values and other context-dependent fragments are not claims unless the evidence excerpt also carries the source-visible context needed to interpret them. Quantitative, aggregate, survey, ranking, status and forecast claims must preserve every source-visible qualifier materially needed to interpret the value or proposition: subject and actor/source identity, denominator or universe, respondent count, period, as-of date, unit, method, geography or market, comparison basis, forecast/projection basis and horizon. If materially necessary context is absent, record `no_material_claim` or an explicit limitation; do not infer it from layout, memory or adjacent unsupplied context.

Pronouns and shorthand references such as "the method", "the results", "this indicator", "the survey", "the companies", "another factor", "here" or "this period" are eligible only when their antecedent and scope appear in the same evidence excerpt. Current-status language such as "now", "currently", "as of" or an undated ownership/share statement requires the source-visible reference date. A survey or ranking claim must retain the stated respondent universe, sample count and geography; a forecast or projection must retain its basis, horizon and as-of/forecast date. A complete qualitative proposition does not require unrelated surrounding context.

Bare generic references to work, method, mapping or results are not self-contained. Terms such as `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `the work`, `the method`, `the mapping` and `the result` require the claim itself to name the work, method, mapping object or result scope using wording visible in the same evidence excerpt. If that wording is absent, record `no_material_claim`; do not resolve the reference from another sentence or unit.

The evidence excerpt must also identify the result referent. A bare `resultatet` or `the result` is ineligible even when the rewritten claim names its scope; expand the excerpt to include the source-visible result object or emit `no_material_claim`.

The evidence excerpt itself must contain every material fact and visible qualifier asserted by the claim. It must end at a complete source-visible proposition; an excerpt that ends mid-sentence, at a dangling preposition or conjunction, in a table/list continuation, or before a needed qualifier is incomplete and cannot support a claim. Preserve actor/source identity and geography exactly as written in the evidence. Do not translate, canonicalize, broaden or substitute a country, region or market label.

Before emission, perform an evidence-locality check on the subject, predicate and material qualifiers. Missing required context produces `no_material_claim`, never a repaired claim. Publication readiness, approval, completeness, authority, external validity and rights clearance may not be inferred from official status, availability, review or usefulness.

Unit-level survey context never repairs an excerpt: a survey-derived claim must include the source-visible respondent count and universe in the same evidence excerpt, even when the unit elsewhere states them. Reported measures must include their source-visible reporting period and method or analytical basis. Ownership and current-status claims must include a source-visible as-of date and named project or scope. A generic expectation such as “the expectation” or “Forventningen” is not a source-grounded actor or project scope; emit `no_material_claim` unless that antecedent is visible in the same excerpt. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

## Output boundary

Return only strict candidate artifacts, assertions and evidence relations. Never write human-review, promotion, canonical, rights, publication, coverage or external-readiness fields. Analysis and validation are different runs with different workflow and prompt bytes. Automated completion may support internal AI context only after the separate validation policy permits it.

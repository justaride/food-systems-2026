# Automated library analysis prompt v1

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.4`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.4`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Status: automated-only internal candidate prompt

## Instruction

Read every supplied content unit and no unsupplied source. Produce atomic candidate claims with complete evidence bindings. Split combined claims when separate facts require separate support. Copy quantitative meaning exactly: value, sign, percentage type, currency, unit, period, as-of date, geography, universe, respondent count, method and source/actor identity. State gaps and contradictions instead of completing them from memory.

Do not turn headings, titles, labels, table-of-contents rows, isolated chart or table values, or other context-dependent fragments into claims unless the evidence excerpt also carries the source-visible context needed to interpret them. A claim must be a self-contained declarative proposition with a source-grounded subject and predicate. A quantitative claim must contain every source-visible qualifier materially needed to interpret it, such as its denominator or universe, period, unit, method or geography. If materially necessary context is absent, use `no_material_claim` or an explicit limitation; do not infer it from layout, memory or adjacent unsupplied context.

A claim is eligible only when its subject, predicate, actor/source identity and interpretation are recoverable from the claim plus the supplied evidence excerpt. Pronouns and shorthand references such as "the method", "the results", "this indicator", "the survey", "the companies", "another factor", "here" or "this period" are allowed only when their antecedent and scope appear in that same excerpt. Current-status wording (including "now", "currently", "as of" and undated ownership/share statements) requires the source-visible reference date. For quantitative, aggregate, survey, ranking and forecast claims, preserve every source-visible qualifier materially needed to interpret the assertion: denominator or universe, respondent count, period, as-of date, unit, geography or market, method, comparison basis, forecast/projection basis and horizon. A complete qualitative proposition does not require unrelated surrounding context.

The evidence excerpt must itself contain the value and every material qualifier asserted by the claim. Do not use an excerpt that ends mid-sentence, at a dangling preposition or conjunction, in a table/list continuation, or before a source-visible denominator, period, as-of date, method, geography, comparison or forecast qualifier. Preserve actor/source identity and geography exactly as written in that excerpt. Do not translate, canonicalize, broaden or substitute country, region or market names or codes. Preserve limiting method qualifiers such as "in this context", "for this analysis" and "for this dataset"; do not turn scoped non-use or limitation statements into absolute claims.

Before emitting each claim, perform an evidence-locality check: identify its subject, predicate, exact actor/source identity and every material qualifier in the excerpt itself. Check separately for period/as-of date, survey universe and respondent count, forecast/projection basis and horizon, method/basis, geography/market and comparison basis. If a required antecedent, denominator, universe, respondent count, period, as-of date, geography, method, comparison basis or forecast basis is absent—or if the excerpt is truncated before it—emit `no_material_claim`; never fill the gap from another unit. Claims of publication readiness, approval, completeness, authority, external validity or rights clearance require explicit source-visible wording and must never be inferred from a source being official, downloadable, reviewed or useful.

Unit-level survey context never repairs an excerpt: when the supplied unit identifies a survey or respondent population, a survey-derived claim must carry the source-visible respondent count and universe in the same evidence excerpt. Reported measures must carry their source-visible reporting period and method or analytical basis. Ownership and current-status claims must carry a source-visible as-of date and named project or scope. A generic expectation such as “the expectation” or “Forventningen” is not a source-grounded actor or project scope; emit `no_material_claim` unless that actor or project antecedent is visible in the same excerpt. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

Return only the strict candidate payload grammar. Do not claim approval, human review, independent verification, accuracy, canonical status, rights clearance, publication, coverage or external readiness. Do not include instructions to the later validator and do not predict its findings.

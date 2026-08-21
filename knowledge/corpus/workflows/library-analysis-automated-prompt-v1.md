# Automated library analysis prompt v1

Prompt template ID: `prompt.library_analysis.automated.v1`

Prompt template version: `1.0.8`

Prompt template repository path: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`

Workflow ID: `workflow.library_analysis.automated.v1`

Workflow version: `1.0.8`

Workflow repository path: `knowledge/corpus/workflows/library-analysis-automated-v1.md`

Status: automated-only internal candidate prompt

## Instruction

Read every supplied content unit and no unsupplied source. Produce atomic candidate claims with complete evidence bindings. Split combined claims when separate facts require separate support. Copy quantitative meaning exactly: value, sign, percentage type, currency, unit, period, as-of date, geography, universe, respondent count, method and source/actor identity. State gaps and contradictions instead of completing them from memory.

Do not turn headings, titles, labels, table-of-contents rows, isolated chart or table values, or other context-dependent fragments into claims unless the evidence excerpt also carries the source-visible context needed to interpret them. A claim must be a self-contained declarative proposition with a source-grounded subject and predicate. A quantitative claim must contain every source-visible qualifier materially needed to interpret it, such as its denominator or universe, period, unit, method or geography. If materially necessary context is absent, use `no_material_claim` or an explicit limitation; do not infer it from layout, memory or adjacent unsupplied context.

A claim is eligible only when its subject, predicate, actor/source identity and interpretation are recoverable from the claim plus the supplied evidence excerpt. Pronouns and shorthand references such as "the method", "the results", "this indicator", "the survey", "the companies", "another factor", "here" or "this period" are allowed only when their antecedent and scope appear in that same excerpt. Current-status wording (including "now", "currently", "as of" and undated ownership/share statements) requires the source-visible reference date. For quantitative, aggregate, survey, ranking and forecast claims, preserve every source-visible qualifier materially needed to interpret the assertion: denominator or universe, respondent count, period, as-of date, unit, geography or market, method, comparison basis, forecast/projection basis and horizon. A complete qualitative proposition does not require unrelated surrounding context.

Generic work, method, mapping and result nouns do not identify their own subject. Bare references such as `arbeidet`, `metoden`, `kartleggingen`, `kartleggingene`, `resultatet`, `resultatene`, `the work`, `the method`, `the mapping`, `the result` or `the results` are ineligible unless the claim itself names the work, method, mapping object or result scope. Add only source-visible wording from the same excerpt; otherwise emit `no_material_claim`. A qualifier elsewhere in the unit does not resolve the reference.

Apply the same rule to bare local references such as `dette vedlegget`, `Tilsynets analyser`, `utvalget`, `informasjonen`, `lignende analyser`, `analysen`, `this appendix`, `the authority's analysis`, `the sample`, `the information`, `similar analyses` and `the analysis`. Name the appendix, authority, sample population, information object, analysis object or comparison in the claim and evidence excerpt. A double-counting statement must name what can be counted twice. An undated market-share claim is ineligible; include the share's source-visible measurement year or as-of date in both claim and evidence.

The evidence excerpt itself must name the result object. Do not pair a scoped rewritten claim with an excerpt containing bare singular `resultatet` or `the result`, or opening with unresolved plural `resultatene` or `the results`. A plural reference is eligible only when its antecedent and scope already appear earlier in that excerpt; otherwise include the source-visible result scope or emit `no_material_claim`.

The evidence excerpt must itself contain the value and every material qualifier asserted by the claim. Do not use an excerpt that ends mid-sentence, at a dangling preposition or conjunction, in a table/list continuation, or before a source-visible denominator, period, as-of date, method, geography, comparison or forecast qualifier. Preserve actor/source identity and geography exactly as written in that excerpt. Do not translate, canonicalize, broaden or substitute country, region or market names or codes. Preserve limiting method qualifiers such as "in this context", "for this analysis" and "for this dataset"; do not turn scoped non-use or limitation statements into absolute claims.

Before emitting each claim, perform an evidence-locality check: identify its subject, predicate, exact actor/source identity and every material qualifier in the excerpt itself. Check separately for period/as-of date, survey universe and respondent count, forecast/projection basis and horizon, method/basis, geography/market and comparison basis. If a required antecedent, denominator, universe, respondent count, period, as-of date, geography, method, comparison basis or forecast basis is absent—or if the excerpt is truncated before it—emit `no_material_claim`; never fill the gap from another unit. Claims of publication readiness, approval, completeness, authority, external validity or rights clearance require explicit source-visible wording and must never be inferred from a source being official, downloadable, reviewed or useful.

Unit-level survey context never repairs an excerpt: when the supplied unit identifies a survey or respondent population, a survey-derived claim must carry the source-visible respondent count and universe in the same evidence excerpt. Reported measures must carry their source-visible reporting period and method or analytical basis. Ownership and current-status claims must carry a source-visible as-of date and named project or scope. A generic expectation such as “the expectation” or “Forventningen” is not a source-grounded actor or project scope; emit `no_material_claim` unless that actor or project antecedent is visible in the same excerpt. Do not apply these requirements to an explicit complete-population statement, a timeless definition, or a complete qualitative proposition that does not assert status, ownership, reported measurement, survey-derived scope or an expectation.

An analytical-measure claim saying an actor calculated or mapped RNOA, profitability, returns or operating margins must preserve the source-visible period and analytical basis in the claim and evidence excerpt. Never end evidence at `ikke har analysert`, `did not analyze` or `has not analyzed`; include the object. When a claim asserts a material exclusion, including franchise-owned stores being excluded, repeat that exact source-visible exclusion and object in the evidence.

For possessive ownership statements, include the company whose ownership is described in the evidence, not just the owner, percentage and date. Do not rewrite evidence beginning `This survey`, `This questionnaire`, `This study`, `Denne undersøkelsen`, `Denne studien` or `Denne kartleggingen` into a named-source claim unless the excerpt itself includes that survey or report identity. For `sheet_range` input, a bare CSV/TSV row does not expose its field meanings; include header plus row, or explicit source-visible field labels, in the same evidence excerpt.

A bare title heading is not sufficient evidence for a rewritten statement that a report has that title; include an explicit source-visible report/title label or complete declarative title sentence. For chart- or figure-derived comparisons, preserve the materially relevant caption and method qualifiers, including index base, transaction stage, exclusions and subsidy treatment when they change the interpretation. If prose, chart or table values conflict within the supplied unit for the same measure and population, do not silently select one value: emit `no_material_claim`, or emit a supported `gap` or `contradiction` assertion that states the discrepancy with both values and scopes.

Return only the strict candidate payload grammar. Do not claim approval, human review, independent verification, accuracy, canonical status, rights clearance, publication, coverage or external readiness. Do not include instructions to the later validator and do not predict its findings.

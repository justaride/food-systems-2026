# Evidence Source Quality Status

Generated: 2026-07-21T22:13:19.599Z

## Decision

- Regression gate: **PASS**
- Academic/external readiness: **NOT READY**
- Database scope: **AVAILABLE**
- Seed/database combined parity: **MISMATCH**
- Identity parity: **MISMATCH**
- Metadata field parity: **MATCH**
- A green regression gate protects current metadata coverage only; it is not permission for external claims.
- Scope is a mixed evidence corpus, not a set of 417 academic publications: it also includes official sources, registers, internal syntheses, operational documents, and duplicates.
- Locator checks validate stored metadata syntax and canonical duplicate keys only. They do not make HTTP requests or prove live status, redirects, archive persistence, or availability.

## Seed And Database Reconciliation

| Set | Seed rows | Database rows | Delta | Parity |
|---|---:|---:|---:|---|
| Report | 139 | 139 | 0 | match |
| Thesis | 78 | 79 | +1 | mismatch |
| SourceDoc | 183 | 199 | +16 | mismatch |

Database total: 417. Seed total: 400.

### Identity reconciliation

| Set | Matched seed IDs | Seed-only IDs | Managed runtime IDs | Unclassified DB-only IDs | Missing managed IDs |
|---|---:|---|---|---|---|
| Report | 139 | — | — | — | — |
| Thesis | 78 | — | — | matsvinnloven-2025 | — |
| SourceDoc | 182 | src-lov-2025-06-20-103 | src-yt--TkOU0IeVq0; src-yt-6kP1Kfmzm9w; src-yt-8JZSIH4WC5A; src-yt-BOQZvBG_LBw; src-yt-EMeYsB6Vk2Y; src-yt-SgltfUW8Ymg; src-yt-UPYj1SNHYdw; src-yt-USSkCfpjGbM; src-yt-W2VaX150Uw8; src-yt-XcV4bZe0J_I; src-yt-aPzdVR0eaI4; src-yt-blx_7Jwq0Nc; src-yt-cvT_rOtTDBo; src-yt-fc50NCdLhL4; src-yt-hALbwiwHdOM; src-yt-n1qF1TRh2d0; src-yt-nvb9MJdwIzA | — | — |

Managed runtime IDs are deterministic, manifest-derived imports. They are expected DB identities but are not static seed rows and do not gain evidence provenance or citation readiness from this classification.

### Field-level metadata reconciliation

| Set | Matched IDs compared | Rows with field drift | Drifted fields | Drifted row IDs |
|---|---:|---:|---|---|
| Report | 139 | 0 | — | — |
| Thesis | 78 | 0 | — | — |
| SourceDoc | 182 | 0 | — | — |

## Database Metadata Coverage

| Set | Field | Present | Coverage | Modeled | Note |
|---|---|---:|---:|---|---|
| Report | year | 139/139 | 100.0% | yes | — |
| Report | institution | 139/139 | 100.0% | yes | — |
| Report | attribution* | 139/139 | 100.0% | yes | — |
| Report | valid absolute http(s) sourceUrl | 126/139 | 90.6% | yes | — |
| Report | author | 38/139 | 27.3% | yes | — |
| Report | valid DOI syntax | 22/139 | 15.8% | yes | — |
| Report | accessedAt | 92/139 | 66.2% | yes | — |
| Report | explicit provenanceType | 139/139 | 100.0% | yes | — |
| Report | valid absolute http(s) sourceUrl for externally classified rows | 101/101 | 100.0% | yes | — |
| Report | accessedAt for externally classified rows | 92/101 | 91.1% | yes | — |
| Report | rows outside duplicate canonical locator groups | 131/139 | 94.2% | yes | 8 live rows share canonical stored locator keys within Report. |
| Report | appraisal disposition | 0/139 | 0.0% | yes | Counts complete current reviewed or explicitly excluded dispositions; missing rows and drafts remain open. |
| Report | complete current structured appraisal or explicit exclusion | 0/139 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| Report | study design/risk of bias | 0/139 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| Report | external appraisal gate | 0/139 | 0.0% | yes | Requires a complete current review plus the conservative appraisal and citation policy; appraisal never upgrades citation readiness. |
| Report | external gate pass or explicit exclusion | 0/139 | 0.0% | yes | Every record must either pass the conservative external appraisal/citation gate or carry a complete current explicit exclusion; exclusions never authorize external use. |
| Report | claim-level anchor | 0/139 | 0.0% | yes | FieldCitation is modeled; only rows with claimText and a pageRef or quote count as anchored. |
| Report | syntactic claim anchor for externally qualified evidence | 0/0 | 0.0% | yes | Only records already passing the independent appraisal/citation gate enter this denominator. A syntactic record anchor does not authorize every claim. |
| Thesis | year | 79/79 | 100.0% | yes | — |
| Thesis | institution | 79/79 | 100.0% | yes | — |
| Thesis | authors | 79/79 | 100.0% | yes | — |
| Thesis | method | 79/79 | 100.0% | yes | — |
| Thesis | valid absolute http(s) url | 79/79 | 100.0% | yes | — |
| Thesis | recognized persistent identifier | 37/79 | 46.8% | yes | — |
| Thesis | valid DOI syntax | 1/79 | 1.3% | yes | — |
| Thesis | accessDate | 78/79 | 98.7% | yes | — |
| Thesis | appraisal disposition | 0/79 | 0.0% | yes | Counts complete current reviewed or explicitly excluded dispositions; missing rows and drafts remain open. |
| Thesis | complete current structured appraisal or explicit exclusion | 0/79 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| Thesis | study design/risk of bias | 0/79 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| Thesis | external appraisal gate | 0/79 | 0.0% | yes | Requires a complete current review plus the conservative appraisal and citation policy; appraisal never upgrades citation readiness. |
| Thesis | external gate pass or explicit exclusion | 0/79 | 0.0% | yes | Every record must either pass the conservative external appraisal/citation gate or carry a complete current explicit exclusion; exclusions never authorize external use. |
| Thesis | claim-level anchor | 0/79 | 0.0% | yes | FieldCitation is modeled; only rows with claimText and a pageRef or quote count as anchored. |
| Thesis | syntactic claim anchor for externally qualified evidence | 0/0 | 0.0% | yes | Only records already passing the independent appraisal/citation gate enter this denominator. A syntactic record anchor does not authorize every claim. |
| SourceDoc | year | 171/199 | 85.9% | yes | — |
| SourceDoc | author | 185/199 | 93.0% | yes | — |
| SourceDoc | valid absolute http(s) url | 118/199 | 59.3% | yes | — |
| SourceDoc | valid DOI syntax | 10/199 | 5.0% | yes | — |
| SourceDoc | accessedAt | 78/199 | 39.2% | yes | — |
| SourceDoc | archivedUrl | 0/199 | 0.0% | yes | — |
| SourceDoc | explicit provenanceType | 197/199 | 99.0% | yes | — |
| SourceDoc | valid absolute http(s) url for externally classified rows | 98/102 | 96.1% | yes | — |
| SourceDoc | accessedAt for externally classified rows | 78/102 | 76.5% | yes | — |
| SourceDoc | rows outside duplicate canonical locator groups | 199/199 | 100.0% | yes | 0 live rows share canonical stored locator keys within SourceDoc. |
| SourceDoc | appraisal disposition | 0/199 | 0.0% | yes | Counts complete current reviewed or explicitly excluded dispositions; missing rows and drafts remain open. |
| SourceDoc | complete current structured appraisal or explicit exclusion | 0/199 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| SourceDoc | study design/risk of bias | 0/199 | 0.0% | yes | Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count. |
| SourceDoc | external appraisal gate | 0/199 | 0.0% | yes | Requires a complete current review plus the conservative appraisal and citation policy; appraisal never upgrades citation readiness. |
| SourceDoc | external gate pass or explicit exclusion | 0/199 | 0.0% | yes | Every record must either pass the conservative external appraisal/citation gate or carry a complete current explicit exclusion; exclusions never authorize external use. |
| SourceDoc | claim-level anchor | 3/199 | 1.5% | yes | FieldCitation is modeled; only rows with claimText and a pageRef or quote count as anchored. |
| SourceDoc | syntactic claim anchor for externally qualified evidence | 0/0 | 0.0% | yes | Only records already passing the independent appraisal/citation gate enter this denominator. A syntactic record anchor does not authorize every claim. |

## Regression Minimums

| Set | Field | Present | Coverage | Minimum coverage | Minimum rows | Target | Status |
|---|---|---:|---:|---:|---:|---:|---|
| Report | year | 139/139 | 100.0% | 100% | 0 | 100% | pass |
| Report | institution | 139/139 | 100.0% | 100% | 0 | 100% | pass |
| Report | attribution* | 139/139 | 100.0% | 100% | 0 | 100% | pass |
| Report | valid absolute http(s) sourceUrl | 126/139 | 90.6% | 90% | 0 | 100% | pass |
| Report | author | 38/139 | 27.3% | 22% | 0 | 80% | pass |
| Report | valid DOI syntax | 22/139 | 15.8% | 15% | 0 | 50% | pass |
| Report | accessedAt | 92/139 | 66.2% | 66% | 92 | 100% | pass |
| Report | explicit provenanceType | 139/139 | 100.0% | 89% | 125 | 100% | pass |
| Thesis | year | 78/78 | 100.0% | 100% | 0 | 100% | pass |
| Thesis | method | 78/78 | 100.0% | 100% | 0 | 100% | pass |
| Thesis | valid absolute http(s) url | 78/78 | 100.0% | 100% | 0 | 100% | pass |
| Thesis | recognized persistent identifier | 37/78 | 47.4% | 45% | 0 | 90% | pass |
| Thesis | valid DOI syntax | 1/78 | 1.3% | 0% | 0 | 50% | pass |
| Thesis | accessDate | 78/78 | 100.0% | 100% | 78 | 100% | pass |
| SourceDoc | year | 172/183 | 94.0% | 93% | 0 | 100% | pass |
| SourceDoc | author | 169/183 | 92.3% | 90% | 0 | 100% | pass |
| SourceDoc | valid absolute http(s) url | 102/183 | 55.7% | 44% | 0 | 95% | pass |
| SourceDoc | valid DOI syntax | 10/183 | 5.5% | 3% | 0 | 40% | pass |
| SourceDoc | accessedAt | 79/183 | 43.2% | 41% | 76 | 100% | pass |
| SourceDoc | archivedUrl | 0/183 | 0.0% | 0% | 0 | 50% | pass |
| SourceDoc | explicit provenanceType | 181/183 | 98.9% | 85% | 156 | 100% | pass |

`attribution*` means that either a named author or an institution is present.

## URL Syntax Profile

| Set | Field | Non-empty strings | Valid absolute http(s) URLs | Invalid non-empty strings | Missing |
|---|---|---:|---:|---:|---:|
| Report | sourceUrl | 126/139 | 126/139 | 0 | 13 |
| Thesis | url | 78/78 | 78/78 | 0 | 0 |
| SourceDoc | url | 102/183 | 102/183 | 0 | 81 |

## Identifier Syntax Profile

The field named `doi` contains both DOI values and other persistent identifiers. They are counted separately; no identifier is upgraded or resolved by this audit.

| Set | Non-empty `doi` field | Valid DOI syntax | Other recognized persistent IDs | hdl | diva2 | slu | URN | Unrecognized non-empty |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Report | 22/139 | 22 | 0 | 0 | 0 | 0 | 0 | 0 |
| Thesis | 37/78 | 1 | 36 | 24 | 7 | 4 | 1 | 0 |
| SourceDoc | 10/183 | 10 | 0 | 0 | 0 | 0 | 0 | 0 |

## Academic And External Readiness

| Set | Dimension | Present | Coverage | Target | Status | Note |
|---|---|---:|---:|---:|---|---|
| Corpus | Live database available with seed identity parity | 0/1 | 0.0% | 100% | gap | Seed/database identity parity is mismatch; external readiness cannot be granted across mixed scopes. |
| Report | Explicit evidence provenance | 139/139 | 100.0% | 100% | ready | Unknown Report provenance remains fail-closed; internal syntheses, registers, composite rows, and blocked records do not require an invented work URL. |
| Report | Valid absolute http(s) locator syntax for externally classified rows | 101/101 | 100.0% | 100% | ready | Only Reports explicitly classified as external_report or external_article are in this denominator; URL syntax does not prove live availability. |
| Thesis | Valid absolute http(s) locator syntax | 79/79 | 100.0% | 100% | ready | Every externally used thesis needs verified work-level locator metadata; this count validates URL syntax only. |
| SourceDoc | Explicit evidence provenance | 197/199 | 99.0% | 100% | gap | Unknown SourceDoc provenance remains fail-closed; internal evidence and duplicates do not require a public publication URL. |
| SourceDoc | Valid absolute http(s) locator syntax for externally classified rows | 98/102 | 96.1% | 100% | gap | Only SourceDocs explicitly classified as external publications, official sources, self-reports, commissioned reports, peer-reviewed works, or advocacy positions are in this denominator. |
| Corpus | Rows outside duplicate canonical locator groups | 330/338 | 97.6% | 100% | gap | 8 Report/SourceDoc live rows share canonical stored locator keys and require record-level duplicate, generic-locator, or misbinding review. |
| Report | Access date for externally classified rows | 92/101 | 91.1% | 100% | gap | Source policy requires an evidence-based ISO access date for externally used URLs; internal and unknown rows are excluded. |
| Thesis | Access date | 78/79 | 98.7% | 100% | gap | Source policy requires an evidence-based ISO access date for externally used URLs. |
| SourceDoc | Access date for externally classified rows | 78/102 | 76.5% | 100% | gap | Source policy requires an evidence-based ISO access date for externally used URLs; internal and unknown rows are excluded from this denominator. |
| Corpus | Complete current appraisal disposition | 0/417 | 0.0% | 100% | gap | The structured model is active. Missing rows, drafts, stale source hashes, and incomplete reviews remain fail-closed; excluded rows close review disposition but never authorize external use. |
| Thesis | Method summary | 79/79 | 100.0% | 100% | ready | Method summaries are present but are not a risk-of-bias assessment. |
| Corpus | Complete current structured appraisal or explicit exclusion | 0/417 | 0.0% | 100% | gap | Reviewed rows require full-text basis, design, applicability, limitations, risk-of-bias, reviewer provenance, basis citation, and current source hash. Complete current exclusions close the row without authorizing it. |
| Corpus | External-use disposition resolved | 0/417 | 0.0% | 100% | gap | 0 records currently pass the conservative external gate. Every other row needs a complete current explicit exclusion; exclusions never authorize use, and an appraisal cannot promote a citation. |
| Corpus | Externally qualified records with a syntactic claim anchor | 0/0 | 0.0% | 100% | gap | The denominator contains only records already passing the independent appraisal/citation gate and must be non-empty. One claimText plus pageRef/quote is still only a record-level onboarding check; every emitted claim remains separately fail-closed under citation and appraisal policy. |

## Use Boundary

- Descriptive mapping and internal synthesis remain possible under the existing claim-lock and citation gates.
- Causal, health, intervention-effect, or authoritative academic claims remain blocked until the relevant source has appraisal, method, access-date, locator, and claim-anchor evidence.
- AI drafts and internal-background records are not upgraded by this audit.

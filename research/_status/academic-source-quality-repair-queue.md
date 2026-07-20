# Evidence Source Quality Repair Queue

Generated: 2026-07-20T03:49:32.796Z

This queue records missing evidence. It does not manufacture metadata or authorize external use.
URL checks validate stored syntax and canonical duplicate keys only; they do not make HTTP requests or prove live status, redirects, archive persistence, or availability.

## Prioritized Execution Waves

| Priority | Wave | Scope | Named targets | Human review | Exit criteria |
|---:|---|---:|---|---|---|
| 1 | identity_truth_gate: Resolve unclassified database-only evidence identities | 1 | Thesis:matsvinnloven-2025 | required | Zero unclassified database-only Report, Thesis, or SourceDoc identities. |
| 2 | appraisal_pilot: Run the first full-text appraisal and claim-anchor pilot | 3 | SourceDoc:src-30; SourceDoc:src-32; SourceDoc:src-45 | required | Three named-reviewer dispositions pass structural, current-hash, target-binding, and citation-policy checks; external eligibility may remain blocked. |
| 3 | external_access_dates: Capture evidence-based access dates for externally classified works | 34 | generated queue | required | All externally classified Report, Thesis, and SourceDoc rows have verified access dates. |
| 4 | provenance_classification: Classify remaining unknown evidence roles | 2 | generated queue | required | Zero unknown Report and SourceDoc provenance rows in the live corpus. |
| 5 | appraisal_corpus: Complete the remaining evidence-appraisal corpus | 414 | generated queue | required | Every evidence record has a complete current reviewed or explicit excluded disposition; only conservative-gate reviews can support external claims. |
| 6 | claim_anchor_expansion: Expand claim-level page, section, table, and quote anchors | 0 | generated queue | required | Every externally used claim is mapped to an exact evidence anchor and independently passes citation plus appraisal policy. |

### Wave 1: identity_truth_gate

- Verify the named work from an authoritative source before promotion.
- Do not copy synthetic or unverified identifiers into seed data.

### Wave 2: appraisal_pilot

- Use the already verified full-text hash and page/quote anchor as review evidence.
- Bind the appraisal to a citation for the same target; never infer review fields from metadata.

### Wave 3: external_access_dates

- Re-open the authoritative work-level locator.
- Record the actual verification date; never manufacture or bulk-assume dates.

### Wave 4: provenance_classification

- Inspect the underlying work or local artifact.
- Keep internal syntheses, composite records, duplicates, and blocked material distinct from external publications.

### Wave 5: appraisal_corpus

- Complete the appraisal pilot and approve its review runbook.
- Require full text, reviewer identity, current source hash, same-target basis citation, method, applicability, limitations, and risk of bias.

### Wave 6: claim_anchor_expansion

- Define the external-claim denominator for each reviewed work.
- Do not treat one anchored claim as complete source coverage.

## System Gaps

| Gap | Affected rows | Required action |
|---|---:|---|
| report_provenance_review | 0 | Classify each unknown Report as an external report/article, internal synthesis/register, composite record, or blocked source before applying locator and citation policy. |
| invalid_source_doc_url_syntax | 0 | For externally classified SourceDocs only, replace bare-domain, relative, or malformed values with verified absolute http(s) work-level URLs; syntax validation does not prove availability. |
| source_doc_provenance_review | 2 | Classify each unknown row as external evidence, internal primary material, internal synthesis, or duplicate before applying locator and citation policy. |
| internal_evidence_identity | 78 | Preserve local path or document identity and content hash for internal evidence; do not invent a public URL. |
| duplicate_locator_reconciliation | 8 | Review shared canonical locator groups for true duplicates, generic landing pages, and likely misbindings before external use; do not auto-correct URLs from titles. |
| access_dates | 34 | Capture verified ISO access dates from evidence; never backfill dates by assumption. |
| peer_review_appraisal | 417 | Complete named, full-text appraisal dispositions in the active model; bind each review to the current source hash and a citation for the same target. Never infer appraisal from metadata. |
| study_design_and_bias | 417 | Add structured methodology/applicability, sample/coverage, limitations, and risk-of-bias fields before causal use, or record a complete current explicit exclusion. Thesis.method alone is not a risk-of-bias assessment; exclusions never authorize external use. |
| claim_anchors | 0 | The count is externally qualified records without even one syntactic anchor; zero qualifying records is handled by the appraisal gate, not hidden here. Map every emitted claim to page, section, table, quote, or equivalent evidence; one anchored claim must not mark a record complete. |

## Access Date Verification (29 seed-known rows; 34 live gap rows)

These rows are candidates, not verified dates. Open each authoritative locator and record the actual access date only after confirming the named work.

| Set | ID | URL | Title | Required action |
|---|---|---|---|---|
| Report | akademia-sifo-kundeprogram-2026 | https://www.regjeringen.no/contentassets/139405f88a35456986e5aa579de7f290/sifo-rapport-1-2026-kunnskapsgrunnlag-om-kundeprogrammene-i-dagligvaremarkedet.pdf | SIFO: Lojalitetsprogrammer og prisdata | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | arla-farmahead-check-2024 | https://www.arla.com/sustainability/ | Arla FarmAhead Check — Sustainability Incentive Model 2024 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | beredskap-nibio-selvforsyning-2026 | https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk | NIBIO: Norsk selvforsyningsgrad 2026 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | beredskap-nibio-selvforsyning-metode | https://hdl.handle.net/11250/3105805 | NIBIO: Metode for selvforsyningsberegning | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | coop-2024 | https://www.coop.no/om-coop/virksomheten/arsrapport | Coop Aarsresultat 2024 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | dk-salling-coop-decision-2025 | https://kfst.dk/konkurrenceforhold/afgoerelser/afgoerelser-paa-konkurrenceomraadet/raads-og-styrelsesafgoerelser/2025/20250326-salling-group-dele-af-coop-danmark | Salling Group A/S erhvervelse af dele af Coop Danmark A/S (Konkurrencerådsafgørelse 26. marts 2025) | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | emv-kartlegging-2023 | https://www.regjeringen.no/contentassets/41847427caa14feb8b8578af3d6d45bc/r15-2023-kartlegging-av-egne-merkevarer-og-vertikal-integrasjon-i-dagligvaremarkedet.pdf | Kartlegging av egne merkevarer og vertikal integrasjon i dagligvaremarkedet | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | kt-markedsundersokelser-2026 | https://www.regjeringen.no/no/aktuelt/i-dag-far-konkurransetilsynet-et-nytt-verktoy-for-a-bekjempe-alvorlige-konkurranseproblemer/id3113837/ | Markedsundersokelser § 14 — Status | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| Report | meld-st-4-dagligvare | https://www.regjeringen.no/no/dokumenter/meld.-st.-4-20242025/id3056808/ | Status dagligvaretiltak (10-punktsplanen) | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-147 | https://stiftelsennorskmat.no/ | Stiftelsen Norsk Mat - Lokalmatrapport 2025 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-150 | https://www.motiva.fi/ | Motiva - Guide for Responsible Procurement of Food (januar 2026) | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-152 | https://www.arla.com/sustainability/ | Arla FarmAhead Check sustainability data 2024 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-158 | https://mst.dk/media/sexld3zc/potential-for-denmark-as-a-circular-economy-2015.pdf | Delivering the Circular Economy: A Toolkit for Policymakers — Denmark case study | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-163 | https://sjavarklasinn.is/wp-content/uploads/2022/03/Analysis-mar22-2.pdf | Seafood in the Circular Economy — Analysis March 2022 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-17 | https://www.norgesgruppen.no/om-oss/rapporter/ | Års- og bærekraftsrapport 2024 / Halvårsrapport 2025 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-170 | https://doi.org/10.18174/563389 | Identifying and implementing circular applications of agri-residues | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-18 | https://coop.no/om-coop/virksomheten/finansiell-informasjon/ | Coops årsresultat og medlemsnytte 2024 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-182 | https://www.norden.org/en/publication/future-nordic-diets | Future Nordic Diets: Exploring ways for sustainably feeding the Nordics | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-20 | https://www.nhh.no/en/research-centres/food/ | Media attention and price competition: Evidence from Norwegian grocery retailing | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-21 | https://oda.oslomet.no/ | Kunnskapsgrunnlag om kundeprogrammene i dagligvaremarkedet | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-23 | https://www.stockholmresilience.org/ | Nordic Food Systems for Improved Health and Sustainability | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-54 | https://www.reitanretail.no/rapportering | Reitan Retail Års- og ansvarsrapport 2024 / Foreløpige tall 2025 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-74 | https://eatforum.org/eat-lancet-commission/ | EAT-Lancet Commission 2.0: Food in the Anthropocene | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-81 | https://stat.fi/til/ktutk/2012/ktutk_2012_2014-05-26_tie_001_en.html | Statistics Finland HBS 2012: Butikkavstand | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-82 | https://dlf.se/download/1167-E8CD2BD7C83DEB69C493BFA61DBE64A0/dagligvarukartan2024-PPT.pdf | ECR Dagligvarukartan 2024/2025 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-86 | https://www.nhh.no/en/research-centres/food/food-news/2024/all-retail-sectors-are-highly-concentrated/ | NHH FOOD: Prof. Frode Steen markedsanalyse april 2024 | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-97 | https://www.skretting.com/en-es/sustainability/sustainability-reporting/ | Skretting Sustainability Report 2024: MicroBalance FLX | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-98 | https://www.nmbu.no/en/research/projects/nordicfeed | NordicFeed EUR 10M NordForsk-prosjekt: Gjaer/soppprotein | Open the authoritative work-level locator, verify the named work, and record the actual access date. |
| SourceDoc | src-99 | https://sa.uit.no/nyheter/artikkel?p_document_id=745023 | Green Platform NOK 93.3M: Mikroalger CO2-basert | Open the authoritative work-level locator, verify the named work, and record the actual access date. |

## Report Provenance Review (0 unknown; 38 explicitly internal/composite/blocked)

| ID | Category | Stored URL | Title | Required action |
|---|---|---|---|---|

## SourceDoc Provenance Review (2 unknown; 78 explicitly internal/duplicate)

| ID | Source type | Stored URL | Title | Filename | Required action |
|---|---|---|---|---|---|
| src-77 | forskning | https://www.cresse.info/wp-content/uploads/2023/09/2023_ps13_pa2_Strom-Halseth.pdf | Lokal HHI i norsk dagligvare: median 1.0 paa postnummernivaet | halseth-nhh-2023.md | Classify the evidence role from the record and underlying artifact before deciding whether it needs a public locator, local evidence identity, or duplicate handling. |
| src-87 | forskning | — | Competition and Grocery Retail Formats: CID-analyse | halseth-phd-2024.md | Classify the evidence role from the record and underlying artifact before deciding whether it needs a public locator, local evidence identity, or duplicate handling. |

## SourceDoc Valid Absolute URL Queue (4 total; 4 active; 0 declared duplicate rows)

| ID | State | Locator issue | Stored URL | Title | Filename | Repository matches | Valid DOI syntax | Next action |
|---|---|---|---|---|---|---|---|---|
| src-79 | active | missing_url | — | KFST fusjonsanalyse Salling/Coop 2024-2025 (drive-time HHI) | kfst-fusjon-2024.md | none | — | Resolve the named source manually and record verified canonical locator metadata plus an evidence-based access date; keep it internal until verified. |
| src-83 | active | missing_url | — | PTY Finnish Grocery Trade Statistics 2024/2025 | pty-grocery-2024.md | none | — | Resolve the named source manually and record verified canonical locator metadata plus an evidence-based access date; keep it internal until verified. |
| src-90 | active | missing_url | — | Enacting a Circular Economy: An Ethnography of Multiple Possible Futures | lehtokunnas-phd-2023.md | research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md | — | Inspect the matched repository file for a named primary locator; do not infer a URL from the title. |
| src-91 | active | missing_url | — | Matsvinnutvalgets rapport 2024: 75% reduksjon mulig | matsvinnutvalget-2024.md | none | — | Resolve the named source manually and record verified canonical locator metadata plus an evidence-based access date; keep it internal until verified. |

## Duplicate Canonical Locator Review (4 Report groups / 8 rows; 0 SourceDoc groups / 0 rows)

4 groups contain valid absolute http(s) URL syntax; 0 groups contain repeated invalid URL syntax. Shared locators may be legitimate duplicate records, generic landing pages, or misbindings and require record-level review.

| Set | Syntax | Canonical locator | Rows | Likely misbinding | Required action |
|---|---|---|---|---|---|
| Report | valid_absolute_http_url | https://kfst.dk/konkurrenceforhold/afgoerelser/afgoerelser-paa-konkurrenceomraadet/raads-og-styrelsesafgoerelser/2025/20250326-salling-group-dele-af-coop-danmark | dk-salling-coop-decision-2025: Salling Group A/S erhvervelse af dele af Coop Danmark A/S (Konkurrencerådsafgørelse 26. marts 2025); kfst-salling-coop-2025: Salling Group / Coop Danmark-oppkjop | none flagged | Verify that the canonical URL identifies each named work. Merge true duplicate records or replace generic/misbound locators with authoritative work-level URLs; do not auto-correct from titles. |
| Report | valid_absolute_http_url | https://www.coop.no/om-coop/virksomheten/arsrapport | coop-2024: Coop Aarsresultat 2024; coop-norge-2024: Coop Norge ÅRS- og bærekraftsrapport 2024 | none flagged | Verify that the canonical URL identifies each named work. Merge true duplicate records or replace generic/misbound locators with authoritative work-level URLs; do not auto-correct from titles. |
| Report | valid_absolute_http_url | https://www.nhh.no/en/research-centres/food | akademia-nhh-butikkstruktur-2024: NHH: Butikkstruktur og lokal konkurranse; akademia-nhh-matbors-historie: NHH: Matboersens historie og matprisdannelse | none flagged | Verify that the canonical URL identifies each named work. Merge true duplicate records or replace generic/misbound locators with authoritative work-level URLs; do not auto-correct from titles. |
| Report | valid_absolute_http_url | https://www.regjeringen.no/contentassets/41847427caa14feb8b8578af3d6d45bc/r15-2023-kartlegging-av-egne-merkevarer-og-vertikal-integrasjon-i-dagligvaremarkedet.pdf | emv-kartlegging-2023: Kartlegging av egne merkevarer og vertikal integrasjon i dagligvaremarkedet; soa-emv-2023: SOA — EMV og Vertikal integrasjon | none flagged | Verify that the canonical URL identifies each named work. Merge true duplicate records or replace generic/misbound locators with authoritative work-level URLs; do not auto-correct from titles. |

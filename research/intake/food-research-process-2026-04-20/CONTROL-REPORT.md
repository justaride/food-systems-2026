# Control Report

Generated: 2026-04-20T16:21:27.857Z

- Batch: `food-research-process-2026-04-20`
- Source folder: `Food Research Process 20.04.26`
- Input artifacts: `manifest.json`, `review.csv`, `import-summary.json`, `title-remediation.csv`, `title-remediation-summary.json`, `promotion-candidates.csv`, `promotion-candidates-summary.json`
- Output JSON summary: `research/intake/food-research-process-2026-04-20/control-report-summary.json`
- Report is read-only: no database writes.
- Batch consistency checks: passed (7 checks).

## Status Snapshot

| Metric | Count | Notes |
| --- | ---: | --- |
| Source batch files seen | 264 | Reviewable rows plus exact duplicates excluded from review. |
| Reviewable rows | 250 | Rows represented in current `review.csv`. |
| Exact duplicates excluded | 14 | Files filtered out before review. |
| Rows marked import in review.csv | 225 | Human-selected intake rows. |
| Rows still on hold in review.csv | 25 | Intake rows still outside import. |
| Rows with unclassified review actions | 0 | Action values not recognized as `import` or `hold`. |
| Imported rows in import summary | 225 | `selected=225`, `skipped=0`, `dryRun=false`. |
| Unresolved weak-title queue | 17 | 13 with candidate replacements, 4 manual-only. |
| Typed promotion recommendations | 217 | SourceDoc + Report + Thesis recommendations. |
| Promotion blockers | 8 | Rows still labeled Hold or Manual review by the promotion pass. |
| Unique rows needing manual attention | 48 | Deduplicated union of review hold, title queue, and promotion blockers. |

## Source Intake Summary

- Source batch size: 264
- Duplicates excluded before review: 14
- Reviewable rows: 250
- Live review.csv action counts: `hold=25`, `import=225`

### Live Review Action Counts

- hold: 25
- import: 225

### Unclassified Review Actions

- None

### Review Hold Rows By Folder

- 00_Working_Files: 19
- 01_Data_And_Archives: 6

## Import Status

- Import summary generated: 2026-04-20T15:22:09.467Z
- Selected rows: 225
- Imported rows: 225
- Skipped rows during import: 0
- Import mode: live import summary already completed

## Title Remediation Status

- Title remediation summary generated: 2026-04-20T15:48:14.207Z
- Weak imported titles flagged: 17
- Unresolved queue remaining: 17
- Suggested replacements available: 13
- Manual-only title cases: 4
- Applied title updates: 0
- Review CSV rows changed by remediation script: 0
- DB title changes applied: 0

### Weak Title Reasons

- artifact_label: 8
- generic_short_title: 6
- leading_identifier: 1
- truncated_source_title: 3

### Title Queue By Confidence

- low: 4
- medium: 13

### Title Queue By Suggestion Source

- filename: 1
- manual-review: 4
- pdf-heading: 12

## Promotion Candidate Status

- Promotion summary generated: 2026-04-20T16:09:44.356Z
- Imported rows analyzed: 225
- Hold rows skipped from intake review: 25

### Counts By Target

- Hold: 7
- Manual review: 1
- Report: 71
- SourceDoc: 126
- Thesis: 20

### Counts By Confidence

- high: 70
- low: 27
- medium: 128

### Counts By Target And Confidence

- Hold: high 0 / medium 0 / low 7
- Manual review: high 0 / medium 0 / low 1
- Report: high 28 / medium 25 / low 18
- SourceDoc: high 30 / medium 96 / low 0
- Thesis: high 12 / medium 7 / low 1

### Typed Promotion Readiness

- Typed recommendations total: 217
- Typed recommendations ready without unresolved title blockers: 202
- Typed recommendations still carrying unresolved title issues: 15

#### Ready Typed Recommendations By Target

- Report: 63
- SourceDoc: 123
- Thesis: 16

#### Typed Recommendations Blocked By Title Review

- Report: 8
- SourceDoc: 3
- Thesis: 4

## Manual Attention Summary

- Review hold rows: 25
- Review rows with unclassified action values: 0
- Title review queue rows: 17
- Promotion Hold/Manual review rows: 8
- Overlap between title queue and promotion blockers: 2
- Unique source rows requiring manual attention: 48

## Next-Step Checklist

- Confirm the 25 `review.csv` hold rows should stay excluded. If any should enter intake, update `action` and rerun the import workflow before promotion work.
- Resolve the 17 weak-title rows in `title-remediation.csv`, starting with the 4 rows that have no automatic replacement suggestion.
- Re-run title remediation or apply confirmed title fixes before typed promotion on the 15 typed candidates still carrying title blockers.
- Promote the 202 clean typed recommendations first. Current ready split: Report 63, SourceDoc 123, Thesis 16.
- Keep the 8 promotion-blocked rows out of typed layers until their titles or metadata are clarified.

## Review Hold Queue

- `Food Research Process 20.04.26/00_Working_Files/Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden.docx`
  folder: `00_Working_Files`
  proposed title: Alternative distribusjonskanaler som utfordrer og kompletterer dagligvarekjedene i Norden
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/compass_artifact_wf-ec2d735b-d33b-4ffa-a5ba-7877ce1d1a3c_text_markdown.md`
  folder: `00_Working_Files`
  proposed title: compass artifact wf ec2d735b d33b 4ffa a5ba 7877ce1d1a3c text markdown
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (39).md`
  folder: `00_Working_Files`
  proposed title: deep research report (39)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (40).md`
  folder: `00_Working_Files`
  proposed title: deep research report (40)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (41).md`
  folder: `00_Working_Files`
  proposed title: deep research report (41)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (42).md`
  folder: `00_Working_Files`
  proposed title: deep research report (42)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (43).md`
  folder: `00_Working_Files`
  proposed title: deep research report (43)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (44).md`
  folder: `00_Working_Files`
  proposed title: deep research report (44)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (45).md`
  folder: `00_Working_Files`
  proposed title: deep research report (45)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/deep-research-report (46).md`
  folder: `00_Working_Files`
  proposed title: deep research report (46)
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Eiendomsmakt i dagligvaremarkedet i Norge og Norden.docx`
  folder: `00_Working_Files`
  proposed title: Eiendomsmakt i dagligvaremarkedet i Norge og Norden
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Evidensnotat for Food Systems 2026.docx`
  folder: `00_Working_Files`
  proposed title: Evidensnotat for Food Systems 2026
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Framstillinger av mat, makt og beredskap i norsk offentlighet.docx`
  folder: `00_Working_Files`
  proposed title: Framstillinger av mat, makt og beredskap i norsk offentlighet
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare.docx`
  folder: `00_Working_Files`
  proposed title: Makt, fryktkultur og svak enforcement i norsk og nordisk dagligvare
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Nordisk analyse av HORECA, offentlige måltider og institusjonelle innkjøp i matsystemet.docx`
  folder: `00_Working_Files`
  proposed title: Nordisk analyse av HORECA, offentlige måltider og institusjonelle innkjøp i matsystemet
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Nordiske dagligvarecase som mislyktes og hva de avslører om etableringsbarrierer.docx`
  folder: `00_Working_Files`
  proposed title: Nordiske dagligvarecase som mislyktes og hva de avslører om etableringsbarrierer
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Nordiske og internasjonale benchmark-case for matsystemomstilling.docx`
  folder: `00_Working_Files`
  proposed title: Nordiske og internasjonale benchmark case for matsystemomstilling
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/Research-Report-Norges-matrevolusjon-2026.pdf`
  folder: `00_Working_Files`
  proposed title: Research Report
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/00_Working_Files/URL-MANIFEST.numbers`
  folder: `00_Working_Files`
  proposed title: URL MANIFEST
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/cei_pc035_esmsip2.sdmx.zip`
  folder: `01_Data_And_Archives`
  proposed title: cei pc035 esmsip2 sdmx
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/cellar_d34251c8-d865-11ef-be2a-01aa75ed71a1.xml`
  folder: `01_Data_And_Archives`
  proposed title: cellar d34251c8 d865 11ef be2a 01aa75ed71a1
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/Engrosforbruk per innbygger 1999-2024.xlsx`
  folder: `01_Data_And_Archives`
  proposed title: Engrosforbruk per innbygger 1999 2024
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/ng-2025-12-31-1-no.zip`
  folder: `01_Data_And_Archives`
  proposed title: ng 2025 12 31 1 no
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/ngasa-2023-12-31-no.zip.zip`
  folder: `01_Data_And_Archives`
  proposed title: ngasa 2023 12 31 no zip
  priority/project fit: `P3` / `maybe`
  notes: —
- `Food Research Process 20.04.26/01_Data_And_Archives/ngasa-2024-12-31-no.zip`
  folder: `01_Data_And_Archives`
  proposed title: ngasa 2024 12 31 no
  priority/project fit: `P3` / `maybe`
  notes: —

## Unclassified Review Actions

- No unclassified or legacy review action values were found.

## Title Review Queue

- `Food Research Process 20.04.26/03_Policy_Governance_And_Market/2022-68-EMV-og-innovasjon-i-dagligvare-1.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: 2022 68 EMV og innovasjon i dagligvare 1
  suggested title: Egne Merkevarer (EMV) og Innovasjon i Dagligvare
  weak reasons: leading_identifier
- `Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport-marginstudie.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Rapport marginstudie
  suggested title: KONKURRANSETILSYNETS MARGINSTUDIE 2024 Del 1. Lønnsomhetsberegninger på virksomhetsnivå
  weak reasons: generic_short_title
- `Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport+om+samarbeidsklimaet+i+dagligvarebransjen+2024_Final_17.10.24.pdf`
  confidence/source: `low` / `manual-review`
  current title: Samarbeidsklimaet i Dagligvarebransjen
  suggested title: — manual review needed
  weak reasons: truncated_source_title
- `Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Zero waste solutions in hospitality technology alignment and agile management practices for responsible consumption and production of food.pdf`
  confidence/source: `medium` / `filename`
  current title: Zero waste solutions in hospitality: technology alignment and agile management practices for respons
  suggested title: Zero waste solutions in hospitality technology alignment and agile management practices for responsible consumption and production of food
  weak reasons: truncated_source_title
- `Food Research Process 20.04.26/06_Company_And_Annual_Reports/2024 Environmental Footprint Report ENG.pdf`
  confidence/source: `low` / `manual-review`
  current title: Environmental footprint of the food saved by Too Good To Go V1.1
  suggested title: — manual review needed
  weak reasons: artifact_label
- `Food Research Process 20.04.26/06_Company_And_Annual_Reports/Annual report 2024.pdf`
  confidence/source: `low` / `manual-review`
  current title: Annual report 2024
  suggested title: — manual review needed
  weak reasons: generic_short_title
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/806685_Master_Thesis_Assessment_of_Grocery_eCommerce_in_Scandinavia_jumi18ab.pdf`
  confidence/source: `low` / `manual-review`
  current title: 806685 Master Thesis Assessment of Grocery eCommerce in Scandinavia jumi18ab
  suggested title: — manual review needed
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/978-952-03-2923-5.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: 978 952 03 2923 5
  suggested title: TARU LEHTOKUNNAS Enacting a Circular Economy A multi-sited ethnography on food waste practices
  weak reasons: generic_short_title
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/about-oecd-environmental-performance-reviews-brochure-2022-web.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: about oecd environmental performance reviews brochure 2022 web
  suggested title: Environmental Performance Reviews oe.cd/epr EVIDENCE-BASED, SYSTEMATIC, COUNTRY-TAILORED
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/Bilgic2025tht_VoR.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: untitled
  suggested title: © 2025 The Authors Water Science & Technology Vol 91 No 11, 1234 doi: 10.2166/wst.2025.068 Thermal hydrolysis treatment of digestates derived from food waste and sewage sludge – effect on residual methane potential
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/Hybrid-Supply-Chain-Models-in-Swedish-Grocery-Retail.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Bachelor Thesis
  suggested title: Hybrid Supply Chain Models in Swedish Grocery Retail: Balancing Cost Drivers, Environmental Sustainability and Social Responsibility BACHELOR THESIS WITHIN: Major in Business Administration
  weak reasons: generic_short_title
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/luke-luobio_51_2025.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Robust Food Waste Management Method for Food Services (Romance) : Final report.
  suggested title: Robust Food Waste Management Method for Food Services (Romance)
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/Marie+Hebrok.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Doctor Thesis
  suggested title: Marie Hebrok Marie Hebrok Food Waste: A practice-oriented design for
  weak reasons: generic_short_title
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/ng_arsrapport-2025-web.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Årsrapport
  suggested title: Innhold Dette ER Norgesgruppen Strategi Ledelse og Styring Økonomi 2025 Bærekraft 2025 Årsrapport 2025
  weak reasons: generic_short_title, truncated_source_title
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/OrriJohannsson FoodSecurity Final.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: Food_Security_-_Final.pdf
  suggested title: Food Security in Iceland Present Vulnerabilities, Possible Solutions Orri Jóhannsson
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/PhD_Thesis_Nina_N_rgaard_S_rensen_print_final.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: PhD Thesis Nina N rgaard S rensen print final
  suggested title: Organic food conversion in Danish public kitchens The effects of the Danish Organic Action Plan 2020 on organic public procurement and wellbeing at work
  weak reasons: artifact_label
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/SUSFOOD STRATEGIC SCENE review report 2018-final.pdf`
  confidence/source: `medium` / `pdf-heading`
  current title: SUSFOOD STRATEGIC SCENE review report 2018 final
  suggested title: Susfood Strategic Scene Review Report 2018 a H2020 Era-net Cofund on Sustainable Food Production and Consumption
  weak reasons: artifact_label

## Promotion Blockers

- `Food Research Process 20.04.26/03_Policy_Governance_And_Market/NORDIC_FOOD_MARKETS.pdf`
  target/confidence: `Hold` / `low`
  analysis title: 543348.indd
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —
- `Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Food-waste-reduction-corporate-responsibility-and-national-policies-2024.pdf`
  target/confidence: `Hold` / `low`
  analysis title: BFJ-11-2023-0982_proof 470..485
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —
- `Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Zero waste solutions in hospitality technology alignment and agile management practices for responsible consumption and production of food.pdf`
  target/confidence: `Manual review` / `low`
  analysis title: Zero waste solutions in hospitality: technology alignment and agile management practices for respons
  reason: Signals are weak or mixed across SourceDoc, Report, and Thesis. Review manually before promoting into a typed layer.
  caution flags: title-remediation weak-title flags: truncated_source_title \| unapplied title-remediation suggestion exists but was not used for classification
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/Bilgic2025tht_VoR.pdf`
  target/confidence: `Hold` / `low`
  analysis title: untitled
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: title-remediation weak-title flags: artifact_label \| unapplied title-remediation suggestion exists but was not used for classification
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_2.pdf`
  target/confidence: `Hold` / `low`
  analysis title: cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 2
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_3.pdf`
  target/confidence: `Hold` / `low`
  analysis title: cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 3
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_4.pdf`
  target/confidence: `Hold` / `low`
  analysis title: cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 4
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —
- `Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_5.pdf`
  target/confidence: `Hold` / `low`
  analysis title: cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 5
  reason: Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  caution flags: —

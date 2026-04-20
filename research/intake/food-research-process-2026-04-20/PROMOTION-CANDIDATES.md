# Promotion Candidates

Generated: 2026-04-20T16:09:44.356Z

- Batch: `food-research-process-2026-04-20`
- Review CSV input: `research/intake/food-research-process-2026-04-20/review.csv`
- Imported rows analyzed: 225
- Intake rows skipped because they remain on hold: 25
- Output CSV: `research/intake/food-research-process-2026-04-20/promotion-candidates.csv`
- Output JSON summary: `research/intake/food-research-process-2026-04-20/promotion-candidates-summary.json`

## Recommendation Counts

- SourceDoc: 126
- Report: 71
- Thesis: 20
- Hold: 7
- Manual review: 1

## Confidence Counts

- high: 70
- medium: 128
- low: 27

## Counts By Target And Confidence

- SourceDoc: high 30 / medium 96 / low 0
- Report: high 28 / medium 25 / low 18
- Thesis: high 12 / medium 7 / low 1
- Hold: high 0 / medium 0 / low 7
- Manual review: high 0 / medium 0 / low 1

## Heuristics Used

- `Thesis`: explicit thesis, master, phd, dissertation, avhandling, bachelor thesis, or afgangsprojekt patterns; review metadata that already proposed `thesis` also counts as supporting evidence.
- `Report`: annual/interim/year-end/impact/sustainability report patterns, official-report markers such as `SOU`, `NOU`, `Dokument 3`, and `tildelingsbrev`, plus report-oriented metadata like `annual_report`, `policy_report`, or `typed_layer_candidate=report`.
- `SourceDoc`: webpage/article/factsheet/brochure/announcement/journal capture patterns, known publisher or domain markers, DOI or journal citation markers, and web-style title shapes such as `|` or homepage captures.
- `Hold`: placeholder or artifact titles such as `untitled`, `cellar`, `doc N`, `proof`, or `.indd` when there is still no strong typed-layer signal.
- `Manual review`: weak or mixed evidence where the script could not justify a conservative typed-layer recommendation.

## Attention Queue

- Manual review (1):
  Zero waste solutions in hospitality: technology alignment and agile management practices for respons -> Signals are weak or mixed across SourceDoc, Report, and Thesis. Review manually before promoting into a typed layer.
- Hold (7):
  543348.indd -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  BFJ-11-2023-0982_proof 470..485 -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  untitled -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 2 -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 3 -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 4 -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.
  cellar 1fefebb0 1b4e 11ee 806b 01aa75ed71a1 0001 02 DOC 5 -> Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.

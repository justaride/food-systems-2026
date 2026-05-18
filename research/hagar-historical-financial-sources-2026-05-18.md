# Hagar hf historical annual-report sources - 2026-05-18

Scope: official Hagar hf consolidated annual-report sources for DB years 2020-2023. No DB, Prisma, script, test, or central status-file mutation was performed.

Access date for all archived sources: 2026-05-18.

## Source archive

| DB year | Fiscal year | Official Hagar discovery page | Official PDF | Local PDF | PDF SHA-256 | Text extraction |
| --- | --- | --- | --- | --- | --- | --- |
| 2020 | 2020/21 | https://www.hagar.is/fjarfestar/hluthafafundir/2021/ | https://www.hagar.is/media/bhshw3h2/hagar-%C3%A1rsreikningur-28-2-2021-%C3%ADsl.pdf | `research/evidence-pack/arsrapporter/hagar-historical/hagar-2020-21-annual-report.pdf` | `9bd06a1aab48243edbd407bdc48141210ea75ddb640e2cea4b1e100b0127e08a` | `research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2020-21-annual-report.txt` |
| 2021 | 2021/22 | https://www.hagar.is/fjarfestar/hluthafafundir/2022/ | https://www.hagar.is/media/2kwpdvkn/hagar-%C3%A1rsreikningur-28-2-2022-%C3%ADsl.pdf | `research/evidence-pack/arsrapporter/hagar-historical/hagar-2021-22-annual-report.pdf` | `4cea1f9f14dff8472685f7a9511981b041ac2525c154158a4a9e30f5be324074` | `research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2021-22-annual-report.txt` |
| 2022 | 2022/23 | https://www.hagar.is/fjarfestar/hluthafafundir/2023/ | https://www.hagar.is/media/3oypylpj/hagar-%C3%A1rsreikningur-28-2-2023-%C3%ADsl_undirrita%C3%B0ur.pdf | `research/evidence-pack/arsrapporter/hagar-historical/hagar-2022-23-annual-report.pdf` | `66f4d25ceb24894a49828fc894a3ba688c87c6a950936a549311f190d86f19ee` | `research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2022-23-annual-report.txt` |
| 2023 | 2023/24 | https://www.hagar.is/fjarfestar/hluthafafundir/2024/ | https://www.hagar.is/media/2sipvkg4/hagar-%C3%A1rsreikningur-29-02-2024-%C3%ADsl_signed.pdf | `research/evidence-pack/arsrapporter/hagar-historical/hagar-2023-24-annual-report.pdf` | `dc3238411cc457727e1a98cfc7d927d4f52b0513c21491b6609e56b42efcf82b` | `research/evidence-pack/arsrapporter/hagar-historical/text/hagar-2023-24-annual-report.txt` |

Download method: `curl -L --fail --silent --show-error` from the official Hagar PDF URLs above, followed by `pdftotext -layout` for local text extraction.

## Extracted source values

Amounts are stated in ISK millions in the annual accounts (`Fjarhaedir eru i milljonum krona`). The source uses `Vorusala` for sales/revenue, `Rekstrarhagnadur fyrir afskriftir (EBITDA)` for EBITDA, and `Rekstrarhagnadur` for operating profit/EBIT.

| DB year | Fiscal period | Reporting currency | Sales/revenue | EBITDA | Operating profit/EBIT | Evidence in text extraction |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 2020 | 2020-03-01 to 2021-02-28 | ISK | 119,582 | 8,805 | 4,547 | period lines 222-223; income statement lines 497-514; unit line 546 |
| 2021 | 2021-03-01 to 2022-02-28 | ISK | 135,758 | 10,518 | 6,277 | period lines 216-217; income statement lines 512-530; unit line 566 |
| 2022 | 2022-03-01 to 2023-02-28 | ISK | 161,992 | 12,041 | 7,588 | period lines 216-217; income statement lines 507-529; unit line 552 |
| 2023 | 2023-03-01 to 2024-02-29 | ISK | 173,270 | 13,063 | 8,035 | period lines 208-209; income statement lines 498-520; unit line 539 |

## Applicability decision

All four DB years are now source-found and applied. The DB convention was confirmed against the already-applied Hagar 2024/25 row: DB year equals fiscal-year start year. NOK conversion used the separate Norges Bank FX reconciliation in `research/hagar-historical-fx-reconciliation-2026-05-18.csv`.

| DB year | Status | Decision |
| --- | --- | --- |
| 2020 | applied_2026-05-18 | Official Hagar consolidated annual accounts found for FY 2020/21 and applied with SourceCitation `cit_76c23f6da256eb945d346ad3d627208c`. |
| 2021 | applied_2026-05-18 | Official Hagar consolidated annual accounts found for FY 2021/22 and applied with SourceCitation `cit_7215a2b35d2177866068980684189c0a`. |
| 2022 | applied_2026-05-18 | Official Hagar consolidated annual accounts found for FY 2022/23 and applied with SourceCitation `cit_6423c8607e8a537792fdc44bc27aef2a`. |
| 2023 | applied_2026-05-18 | Official Hagar consolidated annual accounts found for FY 2023/24 and applied with SourceCitation `cit_a4b49e450d81ac1fa4bc03d9c2ff510e`. |

Residual blocker: none for Hagar historical financial values. Broader registry/role-document blockers are tracked separately in `research/nordic-registry-source-acquisition-queue-2026-05-18.csv`.

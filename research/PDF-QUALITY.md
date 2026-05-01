# PDF-/tekstuttrekkskvalitet — research/

> Auto-generert av `scripts/check-pdf-quality.ts` — ikke rediger manuelt.
> Generert: 2026-05-01T02:21:37.255Z
> Catalog: **399** PDFs (kilde: `research/pdf-katalog.json`)
> Analysert: **110** | Skippet (>50 MB): **0** | Manglende fil: **289**
> pdftotext: **IKKE tilgjengelig — kun header-sjekk**

## Klassifiseringsfordeling

| Klassifisering | Antall | Severity |
|---|---:|---|
| missing-file | 289 | MEDIUM |
| ok | 110 | NONE |

## Severity-fordeling

| Severity | Antall |
|---|---:|
| MEDIUM | 289 |
| NONE | 110 |

## Topp 30 verste funn (etter severity)

| # | Severity | Klassifisering | Størrelse (KB) | Ord | Tetthet | Sti |
|---:|---|---|---:|---:|---:|---|
| 1 | MEDIUM | missing-file | 1 | 0 | 0 | `…cy amid financial challenges - RASTECH MagazineRASTECH Magazine.pdf` |
| 2 | MEDIUM | missing-file | 7 | 0 | 0 | `…t_Protein_And_Innovation/Protix - Join the future of food today.pdf` |
| 3 | MEDIUM | missing-file | 8 | 0 | 0 | `…culture_And_Seafood/Lite kunnskap om hva laksen spiser _ Nofima.pdf` |
| 4 | MEDIUM | missing-file | 8 | 0 | 0 | `…And_Seafood/Security of supply in Finland - Huoltovarmuuskeskus.pdf` |
| 5 | MEDIUM | missing-file | 11 | 0 | 0 | `…ory of Planned Behavior and Value Belief Norm theory_ _ Skemman.pdf` |
| 6 | MEDIUM | missing-file | 53 | 0 | 0 | `…ucing food waste for a green Nordic Region _ Nordic cooperation.pdf` |
| 7 | MEDIUM | missing-file | 67 | 0 | 0 | `…earch_And_Theses/cheffelo-publicerar-trading-update-for-q1-2026.pdf` |
| 8 | MEDIUM | missing-file | 78 | 0 | 0 | `pdf-downloads-20-04-26/sf-20260417-0601.pdf` |
| 9 | MEDIUM | missing-file | 94 | 0 | 0 | `…4_Food_Waste_And_Circularity/Circular economy butterfly diagram.pdf` |
| 10 | MEDIUM | missing-file | 132 | 0 | 0 | `…icy_Governance_And_Market/KFST - fremtidens detailhandel (2024).pdf` |
| 11 | MEDIUM | missing-file | 150 | 0 | 0 | `pdf-downloads-20-04-26/nl-20200417-029.pdf` |
| 12 | MEDIUM | missing-file | 152 | 0 | 0 | `…And_Seafood/Billund Aquaculture _ Bankruptcy _ Factsheet 201509.pdf` |
| 13 | MEDIUM | missing-file | 162 | 0 | 0 | `…port om krav til åpenhet i dagligvarebransjen - regjeringen.no.pdf` |
| 14 | MEDIUM | missing-file | 162 | 0 | 0 | `…g is still the future, despite all the recent business failures.pdf` |
| 15 | MEDIUM | missing-file | 165 | 0 | 0 | `…som motvirker konkurranse i dagligvaremarkedet - regjeringen.no.pdf` |
| 16 | MEDIUM | missing-file | 170 | 0 | 0 | `…e-reduction-corporate-responsibility-and-national-policies-2024.pdf` |
| 17 | MEDIUM | missing-file | 181 | 0 | 0 | `…te_And_Circularity/Norways-Food-Waste-Reduction-Governance-2022.pdf` |
| 18 | MEDIUM | missing-file | 207 | 0 | 0 | `…lorisation business _ British Food Journal _ Emerald Publishing.pdf` |
| 19 | MEDIUM | missing-file | 216 | 0 | 0 | `…gssvar om endringer i lov om god handelsskikk handheving (2024).pdf` |
| 20 | MEDIUM | missing-file | 225 | 0 | 0 | `…/approval insect novel food - Food Safety - European Commission.pdf` |
| 21 | MEDIUM | missing-file | 240 | 0 | 0 | `….26/05_Foodtech_Alt_Protein_And_Innovation/PROMYC, mycoproteins.pdf` |
| 22 | MEDIUM | missing-file | 243 | 0 | 0 | `…sumer food waste prevention - Food Safety - European Commission.pdf` |
| 23 | MEDIUM | missing-file | 256 | 0 | 0 | `…eringen - konkurransetilsynet kt tildelingsbrev for 2026 (2024).pdf` |
| 24 | MEDIUM | missing-file | 260 | 0 | 0 | `…tak for bedre konkurranse i dagligvarebransjen - regjeringen.no.pdf` |
| 25 | MEDIUM | missing-file | 261 | 0 | 0 | `…s on digestate in a bubble-insulated greenhouse - ScienceDirect.pdf` |
| 26 | MEDIUM | missing-file | 263 | 0 | 0 | `…04.26/07_Academic_Research_And_Theses/prp202520260004000dddpdfs.pdf` |
| 27 | MEDIUM | missing-file | 271 | 0 | 0 | `…edish vertical farming company Plantagon International bankrupt.pdf` |
| 28 | MEDIUM | missing-file | 272 | 0 | 0 | `…_And_Circularity/Food Waste - Food Safety - European Commission.pdf` |
| 29 | MEDIUM | missing-file | 301 | 0 | 0 | `…4.26/00_Working_Files/Research-Report-Norges-matrevolusjon-2026.pdf` |
| 30 | MEDIUM | missing-file | 332 | 0 | 0 | `…_Policy_Governance_And_Market/Paivittaistavarakauppa-ry-2024-EN.pdf` |

## Alle html-mis-saved (KRITISK — bryter direkte med KI/RAG)

*Ingen html-mis-saved funn.*

## Alle invalid (ikke gyldig PDF)

*Ingen invalid funn.*

## Klassifiseringsregler

- **html-mis-saved**: første 1024 byte starter med `<!DOCTYPE`, `<html`, `<HTML`, eller `<head`. Filen har `.pdf`-endelse, men er HTML.
- **invalid**: filen starter ikke med `%PDF-` og er ikke HTML (sannsynligvis korrupt eller annet format).
- **scanned**: gyldig PDF, men `word_density` (ord per MB) < 50 — image-only PDF som trenger OCR.
- **low-text**: gyldig PDF med `word_density` mellom 50 og 500 — sparsom tekst (chart/figur-tunge dokumenter).
- **encoding-issue**: gyldig PDF, men > 5% av ekstrahert tekst er Unicode-erstatningstegn (U+FFFD).
- **ok**: gyldig PDF med `word_density` ≥ 500 og ren tekst.
- **skipped-too-large**: filstørrelse > 50 MB (cap for analysetid).
- **missing-file**: katalogoppføring uten fysisk fil på disk.

## Severity-regler

- **HIGH**: `html-mis-saved`, `invalid` — direkte ødelagte poster som påvirker KI/RAG-uthenting.
- **MEDIUM**: `scanned`, `missing-file` — krever OCR eller restoration før KI-ingest.
- **LOW**: `low-text`, `encoding-issue`, `skipped-too-large` — kvalitetsforbedring.
- **NONE**: `ok` — ingen tiltak.

## Tekstuttrekksmetode

- pdftotext er IKKE tilgjengelig på dette systemet. Kun header-baserte klassifikasjoner (`html-mis-saved`, `invalid`) er pålitelige; `scanned`, `low-text` og `encoding-issue` blir ikke detektert.
- Word density = antall ord (split på whitespace + punctuation) delt på filstørrelse i MB.
- 60-sekunders timeout per fil; tomstrenger ved feil tolkes som 0 ord.

## Spesialtilfelle: agrianalyse-bondens-andel-2025

Ikke til stede i `pdf-katalog.json` — filen finnes ikke på disk i nåværende state. Den er dokumentert i `research/seed-pdf-map.json` og `research/REPORT-SOURCEURL-GAP-13.md` som kjent HTML-feil-lagret som PDF, men kan ikke verifiseres maskinelt herfra.


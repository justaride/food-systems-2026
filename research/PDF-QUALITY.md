# PDF-/tekstuttrekkskvalitet — research/

> Auto-generert av `scripts/check-pdf-quality.ts` — ikke rediger manuelt.
> Generert: 2026-05-20T00:50:06.950Z
> Catalog: **399** PDFs (kilde: `research/pdf-katalog.json`)
> Analysert: **398** | Skippet (>50 MB): **1** | Manglende fil: **0**
> pdftotext: **tilgjengelig (Poppler)**

## Klassifiseringsfordeling

| Klassifisering | Antall | Severity |
|---|---:|---|
| scanned | 5 | MEDIUM |
| low-text | 44 | LOW |
| skipped-too-large | 1 | LOW |
| ok | 349 | NONE |

## Severity-fordeling

| Severity | Antall |
|---|---:|
| MEDIUM | 5 |
| LOW | 45 |
| NONE | 349 |

## Topp 30 verste funn (etter severity)

| # | Severity | Klassifisering | Størrelse (KB) | Ord | Tetthet | Sti |
|---:|---|---|---:|---:|---:|---|
| 1 | MEDIUM | scanned | 5819 | 0 | 0 | `…ocess 20.04.26/07_Academic_Research_And_Theses/drager-og-vagene.pdf` |
| 2 | MEDIUM | scanned | 1 | 0 | 0 | `…cy amid financial challenges - RASTECH MagazineRASTECH Magazine.pdf` |
| 3 | MEDIUM | scanned | 5819 | 0 | 0 | `evidence-pack/akademia/drager-vagene-2017.pdf` |
| 4 | MEDIUM | scanned | 207 | 0 | 0 | `…lorisation business _ British Food Journal _ Emerald Publishing.pdf` |
| 5 | MEDIUM | scanned | 31079 | 287 | 9 | `…s 20.04.26/06_Company_And_Annual_Reports/2021 Impact Report ENG.pdf` |
| 6 | LOW | low-text | 11324 | 705 | 64 | `…_And_Innovation/Plantagon's Fall_ Lessons for AgTech Innovators.pdf` |
| 7 | LOW | low-text | 4613 | 295 | 65 | `…Gott & Näringsrikt. 100% Veganskt såklart, för allas bästa!.pdf` |
| 8 | LOW | low-text | 8882 | 654 | 75 | `…oop må slutte å motarbeide frukt-… _ Framtiden i våre hender.pdf` |
| 9 | LOW | low-text | 13131 | 1095 | 85 | `…h_And_Theses/Gapet i klimapolitikken _ Framtiden i våre hender.pdf` |
| 10 | LOW | low-text | 12227 | 1093 | 92 | `…ckeld Dreamery Shuts As Plant-Based Decline Foils Funding Plans.pdf` |
| 11 | LOW | low-text | 10437 | 1197 | 117 | `…Slik får vi sunn og bærekraftig mat _ Framtiden i våre hender.pdf` |
| 12 | LOW | low-text | 4516 | 601 | 136 | `…Years of Operations - vegconomist - the vegan business magazine.pdf` |
| 13 | LOW | low-text | 50505 | 7357 | 149 | `…s 20.04.26/06_Company_And_Annual_Reports/2022 Impact Report ENG.pdf` |
| 14 | LOW | low-text | 7681 | 1138 | 152 | `…den i våre hender åpner matbutikk! _ Framtiden i våre hender.pdf` |
| 15 | LOW | low-text | 7 | 1 | 154 | `…t_Protein_And_Innovation/Protix - Join the future of food today.pdf` |
| 16 | LOW | low-text | 1803 | 329 | 187 | `…nde næringsklynge innen bioøkonomi og bærekraftig matproduksjon.pdf` |
| 17 | LOW | low-text | 3286 | 682 | 213 | `…n-makers can manage global crises - Stockholm Resilience Centre.pdf` |
| 18 | LOW | low-text | 9137 | 1953 | 219 | `…ic_Research_And_Theses/Nordic-Bankruptcy-Statistics-Report-2024.pdf` |
| 19 | LOW | low-text | 10501 | 2650 | 258 | `…/The Nordic alternative protein research ecosystem - GFI Europe.pdf` |
| 20 | LOW | low-text | 9672 | 2652 | 281 | `…_Research_And_Theses/Meningsbryteren _ Framtiden i våre hender.pdf` |
| 21 | LOW | low-text | 48053 | 18135 | 386 | `…And_Annual_Reports/Matsmart-Ars-och-hallbarhetsredovisning-2024.pdf` |
| 22 | LOW | low-text | 1828 | 846 | 474 | `…Mycorena to boost the mycelium and alt-protein market - Tech.eu.pdf` |
| 23 | LOW | low-text | 2679 | 1274 | 487 | `…how the world leader in insects ended up in receivership — ONEI.pdf` |
| 24 | LOW | skipped-too-large | 74506 | 0 | 0 | `…20.04.26/07_Academic_Research_And_Theses/ng_arsrapport-2025-web.pdf` |
| 25 | LOW | low-text | 12824 | 874 | 70 | `…s/Nordmenn vil spise sunnere og mer… _ Framtiden i våre hender.pdf` |
| 26 | LOW | low-text | 15122 | 1245 | 84 | `…od/Klimakrisen presser norske bønder _ Framtiden i våre hender.pdf` |
| 27 | LOW | low-text | 12444 | 1049 | 86 | `… er mye penger å tjene på matsvinn _ Framtiden i våre hender.pdf` |
| 28 | LOW | low-text | 1919 | 164 | 88 | `…vae for green development of the agricultural and food industry.pdf` |
| 29 | LOW | low-text | 8285 | 724 | 89 | `….04.26/08_Food_Security_Agriculture_And_Seafood/Forsiden - NCCE.pdf` |
| 30 | LOW | low-text | 11 | 1 | 95 | `…ory of Planned Behavior and Value Belief Norm theory_ _ Skemman.pdf` |

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

- `pdftotext -enc UTF-8 -q <file> -` (Poppler) brukes for tekstuttrekk.
- Word density = antall ord (split på whitespace + punctuation) delt på filstørrelse i MB.
- 60-sekunders timeout per fil; tomstrenger ved feil tolkes som 0 ord.

## Spesialtilfelle: agrianalyse-bondens-andel-2025

Ikke til stede i `pdf-katalog.json` — filen finnes ikke på disk i nåværende state. Den er dokumentert i `research/seed-pdf-map.json` og `research/REPORT-SOURCEURL-GAP-13.md` som kjent HTML-feil-lagret som PDF, men kan ikke verifiseres maskinelt herfra.


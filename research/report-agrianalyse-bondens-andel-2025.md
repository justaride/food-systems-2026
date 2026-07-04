# Bondens andel av forbrukerkronen 2025

> Local Document.filePath snapshot generated from existing DB `Document.content`.
> This is a locator/coverage remediation artifact, not fresh source verification.
> Canonical external URL remains authoritative where listed below.

## Metadata

- Document ID: cmppajyyl001ynjvm4bdc2jvs
- Slug: report-agrianalyse-bondens-andel-2025
- Author: AgriAnalyse
- Year: 2025
- Document type: bransje
- Category: bibliotek
- Subcategory: reports
- Country: NO
- Content SHA256: 4aaad126722013f54a3b49145f4bf39ebdcdb7bd306a8b72342ff4763c480ee7

## Source Text Snapshot

# Bondens andel av forbrukerkronen 2025
- **Institusjon:** AgriAnalyse
- **År:** 2025
- **Kategori:** BRANSJE
- **Utgiver:** AgriAnalyse
## Relevans (Relevance)
AgriAnalyses årlige analyse av hvor stor andel av forbrukerkronen som går til primærprodusenten. Nøkkeltall for verdikjededebatten.
## Hovedfunn (Key Findings)
- BLOKKERT — lokal fil er HTML-landingsside (starter med <!DOCTYPE html>), ikke ekte PDF. Må lastes ned manuelt fra AgriAnalyse før enrichment kan fullføres.
- Se `research/seed-pdf-map.overrides.json` — filen ligger under `reports.agrianalyse-bondens-andel-2025` men innholdet må reerstattes.
- Fremgangsmåte: Åpne rapport-URL i browser, last ned ekte PDF, erstatt fil på samme path, re-kjør `build-pdf-catalog.ts` + `build-seed-pdf-map.ts`, og enrich deretter keyFindings basert på faktisk innhold.
## Anbefalinger (Recommendations)
- Manuell intervensjon: last ned faktisk PDF fra AgriAnalyse og erstatt den HTML-maskerte filen før denne entryen kan brukes i analyse.

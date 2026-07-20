# Evidence Appraisal Pilot Source Receipts — 2026-07-19

## Boundary

This is a machine acquisition, integrity, text-extraction, and visual-render
receipt for the three pilot review artifacts. It is not an EvidenceAppraisal,
does not attest that a human read the full sources, and does not authorize any
external claim. Every substantive appraisal field remains blank pending a
named-human review disposition.

## Artifact contract

| Target | Work | Review path | Bytes | Pages | SHA-256 | Manifest |
|---|---|---|---:|---:|---|---|
| `SourceDoc:src-30` | *Bærekraft i ASKO 2024* | `research/evidence-pack/arsrapporter/asko-barekraft-2024.pdf` | `18 646 489` | 48 | `94b68068c89e9713e968f3c5ef17ed0f4e74fa57206ea5dd383aac6b44529108` | **PASS** |
| `SourceDoc:src-32` | *Faktaark om matsvinn i Norge 2024* | `research/evidence-pack/forskningsinstitutt/norsus-matsvinn-2024.pdf` | `1 374 879` | 4 | `39523279d3afff6f0f41b5baea04590f2ce6499f2a2518a04fa82b29395c7fcf` | **PASS** |
| `SourceDoc:src-45` | *Konkurransen i dagligvaremarkedet — betydelig bedre enn sitt rykte!* | `research/evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf` | `780 076` | 18 | `6155c0f06fea09224f3ec235453af91641aa99302493d97faad0f0c772ccc8de` | **PASS** |

All three files begin with the PDF signature, are unencrypted, contain no PDF
JavaScript, and match the exact hashes pinned in
`research/review/evidence-appraisal-pilot-manifest.ts`.

## Source identities and pinned review anchors

### `SourceDoc:src-30`

- Work: *Bærekraft i ASKO 2024*
- Publisher/source role: ASKO Norge AS corporate self-report
- Exact PDF:
  `https://asko.no/globalassets/om-asko/miljo/barekraft-i-asko-2024.pdf`
- Accessed: `2026-07-19`
- Layout: 48 landscape pages (`1057.32 × 595.276 pt`)
- Pinned anchor: PDF page 25, headed *Mindre energi, mer fornybar*, reports
  95 GWh renewable-energy production in 2024 and states that this represented
  96 percent of ASKO's total electricity consumption.

### `SourceDoc:src-32`

- Work: *Faktaark om matsvinn i Norge 2024*
- Publisher: NORSUS, publication `OR.27.25`, year 2025
- Authors shown in the PDF: Lina Plataniti and Bram van de Glind
- Commissioning statement: prepared by NORSUS on behalf of Matvett
- Work page:
  `https://norsus.no/publikasjon/faktaark-om-matsvinn-i-norge-2024/`
- Exact PDF:
  `https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf`
- Accessed: `2026-07-19`
- Layout: four A4 pages
- Pinned anchor: PDF page 2 reports an estimated 24 percent per-capita
  reduction in Norwegian food waste from 2015 to 2024 and explicitly excludes
  agriculture from that change estimate.

### `SourceDoc:src-45`

- Work: *Konkurransen i dagligvaremarkedet — betydelig bedre enn sitt rykte!*
- Author/publisher: Oslo Economics
- Commissioner shown on PDF page 2: NorgesGruppen
- Report number: `2024-53`, published June 2024
- Exact PDF:
  `https://osloeconomics.no/wp-content/uploads/2024/06/Oslo-Economics-Konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte.pdf`
- Accessed: `2026-07-19`
- Layout: 18 A4 pages
- Pinned anchor: PDF page 2 identifies Oslo Economics as author and
  NorgesGruppen as commissioner. This commissioning context must remain
  explicit in any later appraisal or claim.

## Text and visual checks

- `pdfinfo`: **PASS** for format, page counts, dimensions, encryption, and
  JavaScript checks on all three artifacts.
- Full-document text extraction: **PASS** for the named works and their pinned
  anchor content.
- Full-document rendering: **PASS** for all 70 pages (48 + 4 + 18).
- Visual inspection: **PASS** for every rendered page; title pages, body text,
  figures, tables, footers, and final pages are legible without clipping,
  blank-page corruption, or broken glyphs.
- High-detail anchor inspection: **PASS** for ASKO page 25, NORSUS page 2, and
  Oslo Economics page 2.

## Storage boundary

The ASKO and Oslo Economics PDFs are existing tracked artifacts. The NORSUS
PDF is intentionally ignored by the repository's `research/**/*.pdf` policy;
Git carries this receipt plus its pinned path and hash, while another host must
obtain the exact bytes from approved artifact storage before human review.

## Workflow result

`review:evidence-appraisal:template-check` verifies the complete three-file
target contract and returns
`b7fe6a8a5bf471b33e51551ab32e876a1d1ba07e5420123802b538db951327ee`.
`readyForDatabaseDryRun` remains `false`, correctly, because `src-30`, `src-32`,
and `src-45` still require complete named-human review dispositions.

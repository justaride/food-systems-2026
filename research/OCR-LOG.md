# OCR-LOG — scanned PDFs

> Auto-generert av `scripts/ocr-scanned-pdfs.ts` — ikke rediger manuelt.
> Generert: 2026-05-20T01:01:58.145Z
> Verktøy: pdftoppm (300 dpi PNG) + tesseract -l eng+nor
> Kilde: `research/PDF-QUALITY.csv` (filter classification=scanned)
> Totalt prosessert: **5** | Tid: **687.4 s**

## Sammendrag

| Aksjon | Antall |
|---|---:|
| Document oppdatert | 0 |
| Kun arkivert (research/ocr-output/) | 4 |
| Hoppet over | 1 |
| **Totalt OCR-ord** | **69 334** |

## Per PDF

| # | Fil | KB | Sider | Original ord | OCR ord | Aksjon | Begrunnelse |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | `…rch Process 20.04.26/06_Company_And_Annual_Reports/2021 Impact Report ENG.pdf` | 31079 | 39 | 287 | 7984 | archived | No Document with matching filePath — archived only |
| 2 | `…esearch Process 20.04.26/07_Academic_Research_And_Theses/drager-og-vagene.pdf` | 5819 | 112 | 0 | 30522 | archived | No Document with matching filePath — archived only |
| 3 | `…e bankruptcy amid financial challenges - RASTECH MagazineRASTECH Magazine.pdf` | 1 | 0 | 0 | 0 | skipped | File size 1057 B < 10240 B threshold (likely corrupt) |
| 4 | `evidence-pack/akademia/drager-vagene-2017.pdf` | 5819 | 112 | 0 | 30522 | archived | Document already has 30647 words (>500) — archived only |
| 5 | `…s waste valorisation business _ British Food Journal _ Emerald Publishing.pdf` | 207 | 1 | 0 | 306 | archived | No Document with matching filePath — archived only |

## Document-oppdateringer

*Ingen Document-oppdateringer.*

## Konstanter

- DPI: `300`
- Språk: `eng+nor`
- Per-PDF timeout: `15 min`
- Min filstørrelse (skip-grense): `10 KB`
- "Substantial content" terskel: `500 ord`

## Fremgangsmåte

1. Les `research/PDF-QUALITY.csv`, filtrer `classification=scanned`.
2. For hver PDF: skip hvis < 10 KB (sannsynlig korrupt).
3. `pdftoppm -r 300 -png INPUT $TMPDIR/page` → en PNG per side.
4. `tesseract page-N.png stdout -l eng+nor` per side, sammenslått tekst.
5. Arkiver alltid OCR-tekst i `research/ocr-output/<basename>.md`.
6. Slå opp `Document` på `filePath` (eksakt match, så filename-fallback).
7. Oppdater `Document.content` kun hvis OCR gir flere ord enn eksisterende, og 
   eksisterende ikke allerede er "substantial" (> 500 ord).
8. Bevar eksisterende kontekst: `existing + "\n\n--- OCR-extracted text ---\n\n" + ocr`.


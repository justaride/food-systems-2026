---
tittel: DRO-1206 Deep Research-mottak - sikrede resultatfiler
status: Mottak - ikke kildegrunnlag
eier: Gabriel
dato: 2026-06-13
scope: Repo-sikring av dedupliserte Markdown-resultater fra `/Users/gabrielfreeman/Downloads/Food - Deep Research Process 12.06.26/`.
bruksregel: Filene er mottaksdokumenter under Food TG-mottaksprotokollen. De er IKKE siterbare kilder, IKKE claim-grunnlag og skal IKKE importeres i source-shortlist, PCQ, claim-lock eller deck som helhet. Bare enkeltkilder og datapunkter som ekstraheres, åpnes og locator-sjekkes i kontrollstacken kan brukes videre.
relaterte_filer:
  - docs/project/analysis/case-avsjekk/README.md
  - docs/project/analysis/case-avsjekk/kjoreordre-case-avsjekk-prompter-2026-06-12.md
  - docs/project/analysis/case-avsjekk/mottak-deep-research-1206-2026-06-13.md
  - docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md
  - research/external/dro-0906/README.md
---

# DRO-1206 Deep Research-mottak

Denne mappen sikrer de unike resultatfilene fra `Food - Deep Research Process 12.06.26`. Downloads-mappen inneholdt 14 Markdown-filer, hvor fire var eksakte duplikater. Ti unike filer er kopiert hit med normaliserte filnavn.

Kopiene er Markdown-hygiene-normalisert ved at trailing whitespace er fjernet. Innhold, struktur og kildemarkører er ellers ikke redigert. Derfor kan enkelte repo-hasher avvike fra originalhashene i Downloads.

## Filregister

| DRR-ID | Fil her | Original i Downloads | Linjer | Repo sha256 | Rolle i mottaket |
|---|---|---|---:|---|---|
| DRR-1206-001 | `drr-1206-001-valio-kort-svar.md` | `1.md` | 158 | `113ea2fc8fbb692458248fd4b4acf45e191b3a45bd1c5497ab2fa8dd50f9a150` | Valio-kortvalidering; soyafri governance med caveat. |
| DRR-1206-002 | `drr-1206-002-brasil-kaffe-natural-state.md` | `Brazil Coffee Case Validation for Natural State.md` | 181 | `b8843d753a1ebd1c068eb34815b877d1a89038914c338f70c77c29a4185b9058` | Brasil/kaffe/Natural State casevalidering. |
| DRR-1206-003 | `drr-1206-003-brasil-kaffe-lenkeoversikt.md` | `La meg søke opp de konkrete kildene og verifisere lenkene.md` | 83 | `c7d9b8db18027dc887aa310c4fab661ff493fd4f1ed7e19a62eb8e165acd6815` | Lenkeoversikt per kaffe-hypotese; kildekandidater, ikke kildeimport. |
| DRR-1206-004 | `drr-1206-004-brasil-kaffe-source-validation.md` | `compass_artifact_wf-c0bc0152-c04e-4e78-aa41-01c23489c2cb_text_markdown.md` | 88 | `c6c3225f13680e9f9799131b22fbfa43ff65dc153aa5fa58b918b8b5544fc3a6` | Kaffe/Brasil kildevalidering mot fem hypoteser. |
| DRR-1206-005 | `drr-1206-005-kakao-ci-source-validation.md` | `compass_artifact_wf-de947e8b-fd77-4736-ba06-9c7d6012b31a_text_markdown.md` | 101 | `a74c6e5e880814883757adb5b0a1ab4f837b4cb8b5f3d6d95476ff4e3aa824c8` | Kakao/Cote d'Ivoire kildevalidering. |
| DRR-1206-006 | `drr-1206-006-valio-soy-free-governance.md` | `deep-research-report (8).md` | 190 | `e4ed0620f943287552a6aba0fdd1774feea330f3543ccc5ba32472a343a1c26d` | Valio soy-free dairy-feed governance. |
| DRR-1206-007 | `drr-1206-007-100-fish-iceland-benchmark.md` | `deep-research-report (9).md` | 175 | `8ab876521526a449cf76a7165223fcb99f4e9e4293c0820ad97ae6d19c7662f4` | 100% Fish/Iceland Ocean Cluster benchmark. |
| DRR-1206-008 | `drr-1206-008-spillvarme-food-production.md` | `deep-research-report (10).md` | 186 | `a954c99ceaab4cc7c27b0c86c68df4aebde9f118bab5244ca079bc3092ae60fd` | Nordisk spillvarme til matproduksjon caseledger. |
| DRR-1206-009 | `drr-1206-009-distribusjon-adoption-gate.md` | `deep-research-report (11).md` | 186 | `b11f2aa0d91b81e3325b0e49dd25427d2be0cecdcf1fb8ee2e292156eb6b4e21` | Norsk produce distribution som adoption gate. |
| DRR-1206-010 | `drr-1206-010-kakao-ci-case-validation.md` | `deep-research-report (12).md` | 153 | `8adf9e28a8e38cccaa4990789d69d02dda726d2ee740bafd32b6bfbabab98a73` | Cote d'Ivoire cocoa casevalidering. |

## Duplikater utelatt

| Utelatt fil | Beholdt som | Original sha256 |
|---|---|---|
| `La meg søke opp de konkrete kildene og verifisere lenkene (1).md` | DRR-1206-003 | `c7d9b8db18027dc887aa310c4fab661ff493fd4f1ed7e19a62eb8e165acd6815` |
| `compass_artifact_wf-c0bc0152-c04e-4e78-aa41-01c23489c2cb_text_markdown (1).md` | DRR-1206-004 | `c6c3225f13680e9f9799131b22fbfa43ff65dc153aa5fa58b918b8b5544fc3a6` |
| `compass_artifact_wf-de947e8b-fd77-4736-ba06-9c7d6012b31a_text_markdown (1).md` | DRR-1206-005 | `1fe596472f137a6863c322477c72936b759a46da4b3e71f3a61badb3eadd45fb` |
| `deep-research-report (13).md` | DRR-1206-010 | `3b10542625e803d150fe833a88efba38000d409e5f7f68dea6fee2f1e3d0d164` |

## Kontrollregel

Bruk `docs/project/analysis/case-avsjekk/mottak-deep-research-1206-2026-06-13.md` som tolkning av hva filene betyr for case-avsjekk-promptene. Denne README-en er kun filregister og bruksregel.

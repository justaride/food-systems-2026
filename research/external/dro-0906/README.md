---
tittel: DRO-0906 Deep Research-mottak — sikrede råfiler
status: Mottak — ikke kildegrunnlag
eier: Gabriel
dato: 2026-06-12
scope: Repo-sikring av de åtte Deep Research-outputene fra 10.06-runden (DRR-0906-001 til -008), tidligere kun lagret i ~/Downloads.
bruksregel: Råfilene er mottaksdokumenter under mottaksprotokollen (food-tg-mottaksprotokoll-v1-2026-06-15.md). De er IKKE kilder, IKKE claim-grunnlag og skal IKKE importeres i DB, source-shortlist eller PCQ som helhet. Kun enkeltkilder som ekstraheres herfra og består gate-sekvensen (DRR-rad → DASK → PCQ → source-shortlist → claim-lock) kan brukes videre. Importbeslutningene per rad i food-tg-deep-research-results-intake-2026-06-10.md gjelder uendret.
relaterte_filer:
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
---

# DRO-0906 Deep Research-mottak

Filene under er kopiert fra `~/Downloads` 2026-06-12 (originalene datert 10.06.2026) og repo-normalisert for Markdown-hygiene: trailing whitespace og ekstra blanklinje ved EOF er fjernet slik at `git diff --check` kan brukes som kontrollgate. Det substansielle innholdet er ikke redigert. Sha256-hashene under gjelder repo-kopiene etter denne normaliseringen.

| DRR-ID | Fil her | Original i Downloads | Repo sha256 |
|---|---|---|---|
| DRR-0906-001 | `drr-0906-001-brasil-kaffe.md` | `deep-research-report (7).md` | `388c460ba0b767282dfe7605145abac6bbee8832aba19cca9f6a1d42a925dcf9` |
| DRR-0906-002 | `drr-0906-002-elfenbenskysten-kakao-eudr.md` | `_EUDR-_sporbarhetscase Deep Research.md` | `854793bc5d76ba7d625a02e4054850052a9b677300dcdb20739f7c7acf5d221d` |
| DRR-0906-003 | `drr-0906-003-valio-importfritt-for-case.md` | `“importfritt fôr”-case.md` | `3af5ef2e012185a76a35978f30fd272ac8b336b9aafb1ce00b9e6ded59e09f84` |
| DRR-0906-004 | `drr-0906-004-valio-soyafritt-dairy-feed-governance.md` | `oyafritt dairy-feed governance-case.md` | `86ea72bc10424eba991d90efa63bdb26ca336742a5f80cbcc12e24a0ac6ac0d2` |
| DRR-0906-005 | `drr-0906-005-distribusjon-adoption-gate.md` | `Bama-case”.md` | `3d01a7dd115228517839d3785cd891559b707821de3a4f8dfc2b89728efb39ca` |
| DRR-0906-006 | `drr-0906-006-spillvarme-green-mountain-hima.md` | `Green Mountain–Hima.md` | `fa99fb7a015cc8be432eeb7fff611d6466f966952a3c9fbd5aa11d2282df9b3a` |
| DRR-0906-007 | `drr-0906-007-100-fish-iceland-ocean-cluster.md` | `100% Fish_Iceland Ocean Cluster.md` | `53e28b0c16e708e93565579a620a92a01f09e8c60423afc52f720e16661d5810` |
| DRR-0906-008 | `drr-0906-008-skottland-polen.md` | `Food TG-case.md` | `48dc7cc43189a0f7394690b185def248e2ef60f34ed84f08aa576aeda6f74fd2` |

Hash-kontroll: kjør `shasum -a 256 *.md` i denne mappen.

## Hvorfor dette er innenfor mottaksprotokollen

Protokollens stoppsignal sier at Downloads-materiale holdes utenfor repoet *til* det har mottaksrad, locator og bruksregel. Alle åtte filer har DRR-rad i intake-loggen (mottaksrad), denne mappen + filnavn er locator, og bruksregelen står i frontmatter over. Sikringen endrer ingen import- eller claimbeslutninger.

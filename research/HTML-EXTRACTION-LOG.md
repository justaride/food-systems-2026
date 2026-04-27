# HTML extraction log — Fase C Group N

> Auto-generert av `scripts/extract-html-to-md.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T12:11:19.795Z
> Verktøy: **pandoc 3.8.2.1**
> Resultat: 5 ok, 0 short, 0 error (av 5)

## Per fil

| # | Status | Words | Extractor | Source | Target | Notes |
|---:|---|---:|---|---|---|---|
| 1 | ok | 1023 | pandoc | research/cathrine-ten-step-oppsummering.html | research/cathrine-ten-step-oppsummering.md |  |
| 2 | ok | 251 | pandoc | research/evidence-pack/beredskap/beredskap-island-food-stockpiles-2025.html | research/evidence-pack/beredskap/beredskap-island-food-stockpiles-2025.md |  |
| 3 | ok | 635 | pandoc | research/evidence-pack/beredskap/beredskap-island-melmolle-2025.html | research/evidence-pack/beredskap/beredskap-island-melmolle-2025.md |  |
| 4 | ok | 472 | pandoc | research/evidence-pack/bransje/dlf-leverandor-2025.html | research/evidence-pack/bransje/dlf-leverandor-2025.md |  |
| 5 | ok | 822 | pandoc | research/statusrapport-mars-2026.html | research/statusrapport-mars-2026.md |  |

## Notater

- **MIN_WORD_COUNT**: 100 ord — output under denne grensen flagges som `short` for manuell oppfølging.
- HTML-en pre-renses i Node før pandoc-kall: `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<form>`, `<svg>`, `<iframe>` og kommentarer fjernes; deretter isoleres artikkel-body via klasse-heuristikk (`elementor-widget-theme-post-content`, `entry-content`, `post-content`, `article-body`, `markdown-body`) eller `<article>`/`<main>`/`<body>` som fallback.
- Pandoc-kall: `pandoc -f html-native_divs-native_spans -t gfm-raw_html --wrap=none --strip-comments`.
- Frontmatter: `source_html` (relativ til .md-filens katalog), `extracted_at` (ISO), `extractor` (`pandoc-x.y` eller `regex-fallback`), `title` (fra `<title>` eller `<h1>`).

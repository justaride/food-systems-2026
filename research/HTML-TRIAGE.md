# HTML triage — research/ snapshots

> Auto-generert av `scripts/triage-html.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T11:53:38.629Z
> Totalt: **5** HTML-filer skannet (utelater `_plans/`, `_status/`, `intake/`)

## Klassifisering

| Klasse | Antall |
|---|---:|
| ok-snapshot | 0 |
| needs-md-extraction | 5 |
| navigation-only | 0 |
| error-page | 0 |

## Severity

| Severity | Antall |
|---|---:|
| HIGH | 3 |
| MEDIUM | 2 |
| LOW | 0 |

## Error-pages

_Ingen error-pages funnet._

## Navigation-only

_Ingen navigation-only-filer funnet._

## Topp 30 needs-md-extraction (prioritet)

> Sortert: referenced_in_seed først, deretter word_count desc.

| # | Severity | Referenced | Words | Path | Tittel |
|---:|---|---|---:|---|---|
| 1 | HIGH | yes | 964 | evidence-pack/beredskap/beredskap-island-melmolle-2025.html | Iceland’s Only Flour Mill Set to Be Scrapped |
| 2 | HIGH | yes | 962 | evidence-pack/beredskap/beredskap-island-food-stockpiles-2025.html | Iceland Needs Emergency Food Stockpiles, Say University Rese |
| 3 | HIGH | yes | 498 | evidence-pack/bransje/dlf-leverandor-2025.html | Dagligvaretilsynet legges ned - mer ansvar til Konkurranseti |
| 4 | MEDIUM | no | 1028 | cathrine-ten-step-oppsummering.html | Ten Step Start v2.0 — Oppdatering med Cathrines innspill |
| 5 | MEDIUM | no | 824 | statusrapport-mars-2026.html | Food Systems 2026 — Oppdatering 26. mars |

## Severity-regler

- **HIGH**: `needs-md-extraction` AND `referenced_in_seed` AND no `.md`-companion — kritisk for KI-bruk
- **MEDIUM**: `needs-md-extraction` uten `referenced_in_seed` — bør ekstraheres for fremtidig bruk
- **LOW**: `navigation-only`, `error-page`, eller `ok-snapshot` med eksisterende companion

## Klassifiserings-heuristikk

- **error-page**: title eller body matcher 404/403/Access Denied/Not Found, ELLER body har <30 ord etter stripping
- **navigation-only**: <200 ord etter at `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>` og kommentarer er fjernet
- **ok-snapshot**: 200+ ord — antas å være artikkelinnhold
- **needs-md-extraction**: ok-snapshot UTEN `.md`-companion (samme basename, samme katalog)

## Skanne-noter

- Lest første 100 KB per fil (rask heuristikk).
- Filer >5 MB utelatt fra parsing: ingen
- Krysset mot 3 HTML-referanser fra `Report.supportingSources[].documentPath` i `src/lib/data/reports.ts`.

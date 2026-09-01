# HTML triage — research/ snapshots

> Auto-generert av `scripts/triage-html.ts` — ikke rediger manuelt.
> Generert: 2026-09-01T02:07:03.219Z
> Totalt: **41** HTML-filer skannet (utelater `_plans/`, `_status/`, `intake/`)

## Klassifisering

| Klasse | Antall |
|---|---:|
| ok-snapshot | 40 |
| needs-md-extraction | 1 |
| navigation-only | 0 |
| error-page | 0 |

## Severity

| Severity | Antall |
|---|---:|
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 40 |

## Error-pages

_Ingen error-pages funnet._

## Navigation-only

_Ingen navigation-only-filer funnet._

## Topp 30 needs-md-extraction (prioritet)

> Sortert: referenced_in_seed først, deretter word_count desc.

| # | Severity | Referenced | Words | Path | Tittel |
|---:|---|---|---:|---|---|
| 1 | MEDIUM | no | 946 | innhenting-2026-08-05/staging/stockmann.html | Stockmann to sell its Delicatessen business in Finland to S  |

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
- Krysset mot 3 HTML-referanser fra `Report.supportingSources[].documentPath` i `prisma/seed-data/reports.ts`.

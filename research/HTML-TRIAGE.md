# HTML triage — research/ snapshots

> Auto-generert av `scripts/triage-html.ts` — ikke rediger manuelt.
> Generert: 2026-06-01T02:11:23.075Z
> Totalt: **29** HTML-filer skannet (utelater `_plans/`, `_status/`, `intake/`)

## Klassifisering

| Klasse | Antall |
|---|---:|
| ok-snapshot | 23 |
| needs-md-extraction | 0 |
| navigation-only | 3 |
| error-page | 3 |

## Severity

| Severity | Antall |
|---|---:|
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 29 |

## Error-pages

| Path | Tittel | Word count |
|---|---|---:|
| evidence-pack/okologisk-norden-2026-04-29/downloads/is-lifraent-island-home-2026.html | Afhverju lífrænt? - Lífrænt Ísland | 22 |
| evidence-pack/okologisk-norden-2026-04-29/downloads/is-tun-vottunarskra-2026-refresh.html | Lífrænt Vottaðir aðilar   Vottunarstofan Tún | 23 |
| evidence-pack/okologisk-norden-2026-04-29/downloads/is-tun-vottunarskra-2026.html | Lífrænt Vottaðir aðilar   Vottunarstofan Tún | 23 |

## Navigation-only

| Path | Tittel | Word count |
|---|---|---:|
| evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-effektrapport-page-2026.html | Effektrapport - KRAV | 131 |
| evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-ekobarometer-page-2026.html | KRAVs Ekobarometer - KRAV | 196 |
| evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-rapporter.html | Rapporter - KRAV | 155 |

## Topp 30 needs-md-extraction (prioritet)

> Sortert: referenced_in_seed først, deretter word_count desc.

_Ingen needs-md-extraction-filer funnet._

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

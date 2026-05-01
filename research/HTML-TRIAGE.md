# HTML triage — research/ snapshots

> Auto-generert av `scripts/triage-html.ts` — ikke rediger manuelt.
> Generert: 2026-05-01T02:21:38.462Z
> Totalt: **29** HTML-filer skannet (utelater `_plans/`, `_status/`, `intake/`)

## Klassifisering

| Klasse | Antall |
|---|---:|
| ok-snapshot | 5 |
| needs-md-extraction | 18 |
| navigation-only | 3 |
| error-page | 3 |

## Severity

| Severity | Antall |
|---|---:|
| HIGH | 0 |
| MEDIUM | 18 |
| LOW | 11 |

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

| # | Severity | Referenced | Words | Path | Tittel |
|---:|---|---|---:|---|---|
| 1 | MEDIUM | no | 7942 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-eea-area-under-organic-farming-2025.html | Area under organic farming | Iceland | Europe&#x27;s environ |
| 2 | MEDIUM | no | 2694 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-jordbruksverket-ekologisk-vaxtodling-2024.html | Ekologisk växtodling 2024 - Jordbruksverket.se |
| 3 | MEDIUM | no | 2438 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-jordbruksverket-ekologisk-animalieproduktion-2024.html | Ekologisk animalieproduktion 2024 - Jordbruksverket.se |
| 4 | MEDIUM | no | 1811 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-mast-arsskyrsla-2024.html | Ársskýrsla MAST 2024 | Matvælastofnun |
| 5 | MEDIUM | no | 984 | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-proluomu-organics-in-finland.html | Organics in Finland - Pro Luomu |
| 6 | MEDIUM | no | 823 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-ekomatsligan-2024-page.html | Ekomatsligan 2024 – En Årsrapport om hållbara offentliga mål |
| 7 | MEDIUM | no | 794 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-nationella-rapporter-statistik-marknadsrapporter-2026.html | Rapporter & Statistik hållbara måltider i offentligsektor &# |
| 8 | MEDIUM | no | 749 | evidence-pack/okologisk-norden-2026-04-29/downloads/no-landbruksdirektoratet-okologiske-jordbruksvarer-2025-press.html | Mer økologisk mat - seminar hos Landbruksdirektoratet torsda |
| 9 | MEDIUM | no | 539 | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-proluomu-market-2024.html | The organic market in Finland is searching for direction – a |
| 10 | MEDIUM | no | 432 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-offentlig-sektor-2023-page.html | Sverige, bäst i världen på ekologisk mat i offentlig sektor. |
| 11 | MEDIUM | no | 416 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-ekomatligan-2025-page.html | Ekomatligan 2025 &#8211; Ekomatcentrum &#8211; The Swedish C |
| 12 | MEDIUM | no | 369 | evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-ekologiska-marknadsdagen-2024-page.html | Ekologiska Marknadsdagen 2024 &#8211; Ekomatcentrum &#8211;  |
| 13 | MEDIUM | no | 310 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-production-in-agriculture-2024-news-2026.html | Production in agriculture 2024 - Statistics Iceland |
| 14 | MEDIUM | no | 309 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-production-value-agriculture-2024-news-2026.html | Production value of agriculture 2024 - Statistics Iceland |
| 15 | MEDIUM | no | 307 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-agriculture-2026.html | Agriculture - Statistics Iceland |
| 16 | MEDIUM | no | 240 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-hagstofa-sdg-2-4-1-2026.html | Indicator 2.4.1 -
        
        Proportion of agricultura |
| 17 | MEDIUM | no | 226 | evidence-pack/okologisk-norden-2026-04-29/downloads/is-tun-lifraent-vottun-2026.html | Lífræn vottun   Vottunarstofan Tún |
| 18 | MEDIUM | no | 211 | evidence-pack/okologisk-norden-2026-04-29/downloads/fi-ruokavirasto-luomuvalvonta-2024.html | Luomuvalvonta Suomessa 2024 - Ruokavirasto |

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

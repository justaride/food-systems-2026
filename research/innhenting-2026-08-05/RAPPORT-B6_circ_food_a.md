# RAPPORT — B6_circ_food_a (Innhentingssesjon 2026-08-05)

Tema: sirkulær mat (Norden). 13 rader fra `download-backlog-circular-food-media-2026-04-23.csv`.

## Sammendrag
- **Hentet fullt:** 11
- **Metadata_only (blokkert):** 1 (RISE)
- **Død lenke:** 1 (Nutricycle)
- **Paywall:** 0
- **Findings totalt:** 31 (spredt over alle 13 poster)

Ekstrakt: `ekstrakt/innhenting-B6_circ_food_a.jsonl` · CSV-status: `ekstrakt/csv-status-B6_circ_food_a.jsonl` · Kilder: `staging/*.md`

## Per kilde
| # | Kilde | retrieval | findings | nøkkeltall |
|---|-------|-----------|----------|-----------|
| 1 | NCH — Beyond the Bean (2023) | fetched_full | 4 | Nordisk økonomi 6 % sirkulær; Norden 0,33 % av verdens befolkning |
| 2 | NCH — Circular Economy Outlook 2024 | fetched_full | 4 | Circular Business Index 21 %; 79 % venter sirkulære konkurrenter; 42 % har mål |
| 3 | NORSØK — CIRCULANDIA (2026) | fetched_full | 1 | kvalitativ (lokale verdikjeder Møre og Romsdal) |
| 4 | Nofima — Upcycled Food (2025) | fetched_full | 2 | 76 ord/konsepter (kvalitativ fokusgruppe) |
| 5 | NMBU — FeedLoop (2025) | fetched_full | 1 | kvalitativ (2025–2027, fôr-mat-konkurranse) |
| 6 | CARE — Circular Food Pilot (2024) | fetched_full | 4 | 59 Mt matsvinn EU/år; 8–10 % av globale klimagassutslipp; mål −50 % |
| 7 | Nutricycle/Columbi Farms (2024) | **dead_link** | 2 | 9 kg grønt per kg laks (selskapsanslag, projisert) |
| 8 | Renewable Matter — Norway (2020) | fetched_full | 5 | Norge 2,4 % sirkulær; 97,6 % materialer tapt; 44,3 tonn/capita |
| 9 | RISE — Circular food in practice (2025) | **metadata_only** | 1 | 3 mill. offentlige måltider/dag i Sverige |
| 10 | New Food — Carlsberg Brewed & Renewed (2025) | fetched_full | 2 | ~80 000 tonn drank (spent grain)/år i Sverige |
| 11 | Smart Built — Gottsunda (2024) | fetched_full | 3 | opptil 30 % mat kastes; mål −50 % innen 2026 |
| 12 | KTH PLENTY — Rethinking Food (2026) | fetched_full | 1 | forskerprofil (ingen tall) |
| 13 | KTH PLENTY — de Jong (2026) | fetched_full | 1 | forskerprofil (ingen tall) |

## Basis / proveniens-merknader
- **Materialstrøm-tallene er nesten alle `modellert`** (sirkularitetsgap-metodikk: Renewable Matter/Circularity Gap, NCH Circular Business Index) eller **`aktoropplysning`** (CARE 59 Mt, New Food 80 000 t, RISE 3 mill.). Ingen egen målt materialflyt i denne skiva.
- **Pilot-/prosjekt-prosenter (CARE −50 %, Gottsunda −50 %/15 %/3 %, Columbi 9 kg/kg)** er **mål/projeksjoner**, ikke oppnådde resultater — merket `modellert`.
- **Målte data (`maalt`)** finnes kun som survey-svar (NCH CEO 79/42/21 %) og kvalitativ tematikk (Nofima 76 ord).
- `fillsGap` dominert av **materialstrommer** + **nordisk_dybde**; sekundært lokale_verdikjeder, alternativt_protein, kvalitativt_lag, offentlig_innkjop, okologi_jordhelse.

## Avvik / advarsler
- **Nutricycle (rad 7):** manifest-URL `nutricycle.no` er død (Wix domenefeil, 404 på root og /about). Substitutt hentet: SINTEF-nyhet (norwegianscitechnews.com) + søkesnutt av columbifarms.no. **9 kg-per-kg-tallet er kun sett i søkesnutt, ikke sideverifisert** (columbifarms.no ga ECONNREFUSED) — må reverifiseres.
- **RISE (rad 9):** siden er sikkerhetsblokkert (CAPTCHA) mot både curl og WebFetch. Metadata (3 mill. måltider/dag) hentet fra WebSearch-sammendrag av samme side — ikke fullt sideverifisert.
- **Datoavvik:** Renewable Matter-artikkelen er datert 2020-08-28 (manifest oppga 2024); New Food-artikkelen 2025-03-25 (manifest oppga 2024). Registrert med faktisk år.
- **Nofima (rad 4):** curl 403 på landing; abstrakt/metadata hentet via WebFetch. Full artikkeltekst bak forlag.

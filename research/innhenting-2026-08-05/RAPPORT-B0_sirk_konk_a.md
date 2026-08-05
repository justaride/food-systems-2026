# RAPPORT — B0_sirk_konk_a (Nordiske sirkulære konkurser)

Innhentingssesjon 2026-08-05. Innhenter: skive B0_sirk_konk_a.
Manifest-rader: 15 (1 uten URL). Ekstraksjonsposter skrevet: **14** (24 975 B), findings totalt: **36**.
Ekstrakt: `ekstrakt/innhenting-B0_sirk_konk_a.jsonl` · CSV-status: `ekstrakt/csv-status-B0_sirk_konk_a.jsonl`

## Status per kilde

| # | Kilde | retrieval | staging |
|---|-------|-----------|---------|
| 1 | Vegconomist — Mycorena konkurs (2024) | fetched_full | media-vegconomist-mycorena-2024.md |
| 2 | Green Queen — Mycorena CEO-intervju (2024) | fetched_full | media-greenqueen-mycorena-ceo-2024.md |
| 3 | ArcticStartup — Mycorena kjøpt av Naplasol/VEOS (2024) | fetched_full | media-arcticstartup-mycorena-2024.md |
| 4 | Vegconomist — DUG Foodtech konkurs (2025) | fetched_full | media-vegconomist-dug-2025.md |
| 5 | Green Queen — Hooked Foods nedlagt (2026) | fetched_full | media-greenqueen-hooked-2026.md |
| 6 | CB Insights — Mycorena-profil | fetched_full | cbinsights-mycorena-profile.md |
| 7 | Erhvervplus — ENORM BioFactory (registeragg.) | fetched_partial | erhvervplus-enorm-profile.md |
| 8 | HSFO.dk — insektfabrik konkurs (2025) | **paywalled** | media-hsfo-enorm-2025.md |
| 9 | Erhvervplus/DLG — 70 mio. tap på Enorm | fetched_partial | erhvervplus-dlg-loss-2026.md |
| 10 | Groentennieuws — Grønt fra Nord interim-CFO (2026) | fetched_full | media-groentennieuws-grontfranord-2026.md |
| 11 | Saltenposten — Grønt fra Nord (2026) | **paywalled** (ingress) | media-saltenposten-grontfranord-2026.md |
| 12 | Case-anker (intern analyse, **ingen URL**) | ikke hentet | — |
| 13 | Green Queen — 40+ alt-protein konkurser (2025) | fetched_full | greenqueen-consolidation-2025.md |
| 14 | Brønnøysund Enhetsregister — Rest Restaurant AS | **metadata_only** | rest-brreg-enhet.json |
| 15 | Brønnøysund kunngjøring — konkursåpning Rest 05.09.2024 | **metadata_only** | — |

## Oppsummering
- **Hentet fullt/delvis:** 11 · **Paywall:** 2 (HSFO, Saltenposten) · **Metadata_only/ikke løst:** 2 (Brreg) · **Ingen URL:** 1 (case-anker).
- Alle media/sekundær-findings bærer `basis: aktoropplysning` (aldri `maalt`), med `locator` per tall. Volumtall har `systemBoundary` (f.eks. ENORM-salgssum «knapp 66 mio. DKK» = fabrikk+jord, ikke totale krav; DLG «~70 mio. DKK» = DLGs eget tap; Green Queens «40+» = eget anslag over «major» alt-protein-selskaper).

## Felt dekket (fillsGap)
`makt_eierskap` (oppkjøp/eierskifter: Mycorena→Naplasol/VEOS, ENORM→Euro Steel-datter, DUG-tender), `alternativt_protein` (Mycorena, DUG, Hooked, ENORM insektprotein, 40+-oversikt), `kausalitet` (fundraising-«catch-22», offtake, markedskorreksjon, leverandørkonkurs), `aktordybde`, `lokale_verdikjeder` (Grønt fra Nord, Nord-Norge), `beredskap_import` (DLG ~900 000 t soya/år).

## Nøkkelforbehold / ærlige hull
- **Rest Restaurant AS (rad 14–15):** manifestet er DB_confirmed_case, men uten org-nr. Åpent navnesøk i Enhetsregisteret gir kun urelaterte selskaper (REST AS, REST INVEST AS, REST PROPERTIES AS — eiendom/holding). Kunngjøringssøket er JS-drevet; `data.brreg.no/kunngjoring`-API-stiene returnerte HTML, ikke JSON. Datoen 05.09.2024 er fra manifestet, ikke verifisert mot kunngjøring. **Ingen org-nr eller innhold gjettet.** (En annen agent la igjen 0-byte `rest-restaurant-enhet.json` i staging — samme blindvei.) Trenger org-nr fra prosjekt-DB for å lukke.
- **HSFO / Saltenposten:** abonnementssperre; kun tittel, byline, dato (+ Saltenposten-ingress) hentbart.
- **Enhetsoverlapp i staging:** deling med andre skiver; egne artefakter prefikset entydig.

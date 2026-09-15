# Beredskap og kompetanse – researchmateriale 15. september 2026

Materiale fra ChatGPT Pro-promptene i [CHATGPT-RESEARCHPROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/CHATGPT-RESEARCHPROMPTER.md) og Grok-planen i [GROK-RESEARCHPLAN.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/GROK-RESEARCHPLAN.md), med kontroll mot kildene.

**Start her:** [KUNNSKAPSGRUNNLAG.md](KUNNSKAPSGRUNNLAG.md). Vurdering av Grok: [GROK-VURDERING.md](GROK-VURDERING.md).

## Innhold

| Fil | Hva |
|---|---|
| `chatgpt/P1-*-begreper.md` | Begreper og teori |
| `chatgpt/P2-*-historikk.md` | Historikk 1945 til i dag |
| `chatgpt/P3-*-kriser.md` | Erfaringer fra kriser |
| `chatgpt/P4-*-matkjeden.md` | Arbeidskraft og kompetanse i matkjeden |
| `chatgpt/P5-*-husholdninger.md` | Husholdningenes kompetanse og egenberedskap |
| `chatgpt/P6-B-institusjoner.md` | Institusjoner, øvelser, revisjoner og forskningsstatus (bare én versjon) |
| `pastander-samlet.csv` | Alle 399 påstander fra de elleve ChatGPT-rapportene. `id_unik` = versjon:id, fordi samme ID kan bety ulike påstander i A og B. |
| `grok/` | Grok-leveransen: hovedfil, morgenbrief, status, pakkene G1–G6 med rapport og påstandstabell, og samlet tabell i `raw/` |
| `kontroll/P1–P6-kontroll.md` | Første kontroll av ChatGPT-påstandene |
| `kontroll/UVERIFISERTE-andre-runde.md` | Nytt forsøk på de 20 påstandene som ikke kunne sjekkes |
| `kontroll/GROK-*-kontroll.md` | Kontroll av Grok-leveransen |

A og B er to uavhengige kjøringer av samme ChatGPT-prompt. Rapportene er lagret uendret, bortsett fra at mellomrom på slutten av linjer og tomme sluttlinjer er fjernet i P6 og i Grok-filene.

## Kontroll av ChatGPT-materialet

De bærende påstandene, alle tall og alle avvik mellom A og B ble sjekket mot kildene med nettoppslag. For P6 ble alle radene kontrollert.

| Prompt | Behold | Rett | Forkast | Ikke verifisert |
|---|---:|---:|---:|---:|
| P1 | 21 | 5 | 0 | 7 |
| P2 | 31 | 4 | 0 | 1 |
| P3 | 51 | 9 | 0 | 2 |
| P4 | 78 | 4 | 0 | 3 |
| P5 | 52 | 0 | 0 | 4 |
| P6 | 23 | 16 | 0 | 3 |
| **Første runde** | **256** | **38** | **0** | **20** |
| **Etter andre runde** | **269** | **43** | **0** | **2** |

I andre runde ble 18 av de 20 avklart med den innebygde nettleseren og alternative kopier: 13 behold og 5 rett. Fortsatt låst er Tendall mfl. 2015 (ScienceDirect og ResearchGate) og Statsforvalterens beredskapsside (robotsjekk).

For P6 inngår 10 tekstpåstander uten egen rad. Én av dem (at det ikke finnes et nordisk systematisk review om temaet) er vurdert som «ikke motbevist» og står ikke i tabellen. Tallene gjelder dommer per `id_unik`. Mange påstander finnes i begge versjoner, så antallet unike påstander er lavere.

## Kontroll av Grok-leveransen

| Del | Behold | Rett | Forkast | Ikke verifisert | Intern kilde |
|---|---:|---:|---:|---:|---:|
| G1–G2 | 22 | 6 | 0 | 0 | 0 |
| G3–G4 | 19 | 8 | 0 | 1 | 0 |
| G5–G6 | 16 | 6 | 0 | 0 | 2 |
| **Sum** | **57** | **20** | **0** | **1** | **2** |

Kontrollen dekker de 54 utvalgte påstandene i Groks del D og de viktigste påstandene fra del A–C, ikke alle ca. 286 rader i pakkene. «Intern kilde» betyr at påstanden bare viser til prosjektets egne filer.

## Grenser

- P6 har bare én versjon og ingen uavhengig kjøring å sammenligne med.
- Kontrollen er KI-basert. Den er ikke faglig godkjenning.
- Groks anbefalinger om tema, konsortium og satsingsområder er forslag, ikke kontrollerte funn.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.
- Originalpakken fra Grok ligger fortsatt usporet i hovedmappen under `research/_status/kompetanse-beredskap-2026-09-14/`. Kopien her er den som er kontrollert.

## Neste steg for researchen

1. Les Nordic Food Alert-rapporten (TemaNord 2025:528). Den er den eneste nordiske matkrisesimuleringen som er funnet.
2. Finn ut om Norge, Danmark, Finland og Island har beredskapsplaner for offentlige måltider, slik Sverige har målt.
3. Valget mellom NordForsk tema 1 (Grok) og tema 2 (gap-studien 2. september) er en beslutning for Gabriel og JT.

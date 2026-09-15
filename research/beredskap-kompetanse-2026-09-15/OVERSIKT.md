# Beredskap og kompetanse – researchmateriale 15. september 2026

Materiale fra ChatGPT Pro-promptene i [CHATGPT-RESEARCHPROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/CHATGPT-RESEARCHPROMPTER.md), med kontroll mot kildene.

**Start her:** [KUNNSKAPSGRUNNLAG.md](KUNNSKAPSGRUNNLAG.md)

## Innhold

| Fil | Hva |
|---|---|
| `chatgpt/P1-*-begreper.md` | Begreper og teori |
| `chatgpt/P2-*-historikk.md` | Historikk 1945 til i dag |
| `chatgpt/P3-*-kriser.md` | Erfaringer fra kriser |
| `chatgpt/P4-*-matkjeden.md` | Arbeidskraft og kompetanse i matkjeden |
| `chatgpt/P5-*-husholdninger.md` | Husholdningenes kompetanse og egenberedskap |
| `chatgpt/P6-B-institusjoner.md` | Institusjoner, øvelser, revisjoner og forskningsstatus (bare én versjon) |
| `pastander-samlet.csv` | Alle 399 påstander fra de elleve rapportene. `id_unik` = versjon:id, fordi samme ID kan bety ulike påstander i A og B. |
| `kontroll/P1–P6-kontroll.md` | Dom per påstand, A/B-avvik og rettelser |

A og B er to uavhengige kjøringer av samme prompt. Rapportene er lagret uendret, bortsett fra at mellomrom på slutten av linjer er fjernet i P6.

## Kontroll

De bærende påstandene, alle tall og alle avvik mellom A og B ble sjekket mot kildene med nettoppslag. For P6 ble alle radene i påstandstabellen kontrollert.

| Prompt | Behold | Rett | Forkast | Ikke verifisert |
|---|---:|---:|---:|---:|
| P1 | 21 | 5 | 0 | 7 |
| P2 | 31 | 4 | 0 | 1 |
| P3 | 51 | 9 | 0 | 2 |
| P4 | 78 | 4 | 0 | 3 |
| P5 | 52 | 0 | 0 | 4 |
| P6 | 23 | 16 | 0 | 3 |
| **Sum** | **256** | **38** | **0** | **20** |

For P6 inngår 10 tekstpåstander uten egen rad, i tillegg til de 33 radene. Én av dem (at det ikke finnes et nordisk systematisk review om temaet) er vurdert som «ikke motbevist» og står ikke i tabellen. Tallene gjelder dommer per `id_unik`. Mange påstander finnes i begge versjoner, så antallet unike påstander er lavere. «Ikke verifisert» betyr at kilden ikke kunne åpnes (for eksempel 403 fra DSB, Wiley eller Nordisk ministerråd). Det betyr ikke at påstanden er feil. Mange av rettelsene i P6 gjelder sitater som ikke er ordrette, der innholdet likevel stemmer.

## Grenser

- P6 har bare én versjon og ingen uavhengig kjøring å sammenligne med.
- Kontrollen er KI-basert. Den er ikke faglig godkjenning.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.

## Neste steg for researchen

1. Sjekk de 20 ikke-verifiserte påstandene manuelt, særlig Bornholm-rapporten (TemaNord 2022:528), DSBs historikk for egenberedskapsrådet, DSBs veileder for kommunal beredskapsplan og Kuns mfl. 2023 om Ringsted.
2. Les Nordic Food Alert-rapporten (TemaNord 2025:528). Den er den eneste nordiske matkrisesimuleringen som er funnet.
3. Sammenlign med Grok-leveransen når den foreligger.

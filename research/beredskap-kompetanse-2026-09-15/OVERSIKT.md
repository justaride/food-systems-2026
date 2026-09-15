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
| `pastander-samlet.csv` | Alle 366 påstander fra de ti rapportene. `id_unik` = versjon:id, fordi samme ID kan bety ulike påstander i A og B. |
| `kontroll/P1–P5-kontroll.md` | Dom per påstand, A/B-avvik og rettelser |

A og B er to uavhengige kjøringer av samme prompt. Rapportene er lagret uendret.

## Kontroll

De bærende påstandene, alle tall og alle avvik mellom A og B ble sjekket mot kildene med nettoppslag.

| Prompt | Behold | Rett | Forkast | Ikke verifisert |
|---|---:|---:|---:|---:|
| P1 | 21 | 5 | 0 | 7 |
| P2 | 31 | 4 | 0 | 1 |
| P3 | 51 | 9 | 0 | 2 |
| P4 | 78 | 4 | 0 | 3 |
| P5 | 52 | 0 | 0 | 4 |
| **Sum** | **233** | **22** | **0** | **17** |

Tallene gjelder dommer per `id_unik`. Mange påstander finnes i begge versjoner, så antallet unike påstander er lavere. «Ikke verifisert» betyr at kilden ikke kunne åpnes (for eksempel 403 fra DSB, Wiley eller Nordisk ministerråd). Det betyr ikke at påstanden er feil.

## Grenser

- P6 (institusjoner, øvelser og forskningsstatus) er ikke kjørt.
- Kontrollen er KI-basert. Den er ikke faglig godkjenning.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.

## Neste steg for researchen

1. Kjør P6.
2. Sjekk de 17 ikke-verifiserte påstandene manuelt, særlig Bornholm-rapporten (TemaNord 2022:528), DSBs historikk for egenberedskapsrådet og Kuns mfl. 2023 om Ringsted.
3. Sammenlign med Grok-leveransen når den foreligger.

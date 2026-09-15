# Beredskap og kompetanse – samlet sammenstilling (R9)

15. september 2026. Sammenstilling og analyse av runde 1 og runde 2, laget i repoet på de kontrollerte filene. Oppgaven står i R9-avsnittet i [RUNDE2-R5-R8-PROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/RUNDE2-R5-R8-PROMPTER.md) og i [HANDOVER-R9.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/HANDOVER-R9.md).

**Start her:** [KUNNSKAPSGRUNNLAG-SAMLET.md](KUNNSKAPSGRUNNLAG-SAMLET.md).

## Innhold

| Fil | Hva |
|---|---|
| `KUNNSKAPSGRUNNLAG-SAMLET.md` | 14 hovedinnsikter på tvers, forklaringsmodell, endringer fra runde 1 til runde 2, motstrid, svake punkter, landbilder, kunnskapshull og ordliste |
| `OVERSIKT.md` | Grunnlag, metode, tall og grenser |

## Grunnlag

- **Runde 1:** [KUNNSKAPSGRUNNLAG.md](../beredskap-kompetanse-2026-09-15/KUNNSKAPSGRUNNLAG.md), [OVERSIKT.md](../beredskap-kompetanse-2026-09-15/OVERSIKT.md) og [GROK-VURDERING.md](../beredskap-kompetanse-2026-09-15/GROK-VURDERING.md).
- **Runde 2:** [KUNNSKAPSGRUNNLAG-RUNDE2.md](../beredskap-kompetanse-runde2/KUNNSKAPSGRUNNLAG-RUNDE2.md) og [OVERSIKT.md](../beredskap-kompetanse-runde2/OVERSIKT.md).
- **Kontrollfilene** i `kontroll/` i begge mappene: oppsummeringen i hver fil, og enkeltrader der to filer sa noe ulikt, der sikkerheten var uklar, eller der et funn manglet presis ID.
- **`pastander-samlet.csv` i runde 1:** brukt til å finne ID-er for funn som kunnskapsgrunnlaget bare viste til med prompt, for eksempel P4 og P5.

Rapportene i `chatgpt/`, `grok/` og `rapporter/` er ikke brukt som kilde, fordi de inneholder feil som bare er rettet i kontrollfilene.

## Tall

| | Kontrollert | Behold | Rett | Forkast | Ikke verifisert | Intern kilde | Hovedinnsikter |
|---|---:|---:|---:|---:|---:|---:|---:|
| Runde 1 ChatGPT (P1–P6) | 314 | 269 | 43 | 0 | 2 | 0 | 22 (hele runde 1) |
| Runde 1 Grok (G1–G6) | 80 | 57 | 20 | 0 | 1 | 2 | |
| Runde 2 (R1–R8 og X) | 313 | 206 | 106 | 1 | 0 | 0 | 30 |
| **Sum** | **707** | **532** | **169** | **1** | **3** | **2** | **52** |

R9 samler de 52 hovedinnsiktene i 14 innsikter på tvers. Tallene for runde 1 er dommer per `id_unik`. Mange påstander finnes i både A- og B-versjonen, så antallet unike påstander er lavere.

## Metode

1. **Gjennomgang.** Begge kunnskapsgrunnlagene ble lest mot hverandre og mot kontrollfilene for å finne overlapp, motstrid, uklare formuleringer og svake funn.
2. **Motstrid.** Hvert avvik er forklart med definisjon, år eller kilde. Åtte nye avvik ble funnet, og alle kunne avgjøres i kontrollfilene. Ingen kilde ble åpnet på nettet, og ingen ny research er gjort.
3. **Analyse på tvers** av tema og land, med skillene fra runde 1 (kapasitet, handling og utfall; krav, aktivitet og effekt; antall og erstattbarhet), kodene K1–K4 og status- og bruksnivåskalaene fra runde 2.
4. **Regler.** Bare kontrollerte funn er brukt, med rettelsene. De opprinnelige ID-ene er beholdt. Sikkerheten er beholdt eller senket, aldri hevet. Tolkning er merket «Sammenstilling:». Filen har ingen anbefalinger eller tiltak.

## Presiseringer som gjelder foran kunnskapsgrunnlagene

R9 fant formuleringer i materialet for runde 2 som sier mer enn kontrollfilene dekker. Kunnskapsgrunnlagene er ikke skrevet om. Presiseringene står i del 4 av sammenstillingen:

- **Del 3 i runde 2, rad 8:** blander to kilder om omdisponering i svenske kommuner (A:P3-006 og R3-TEKST-012).
- **Innsikt 26 i runde 2:** modellen til Rikkonen mfl. *beskriver*, den *viser* ikke (R7-007). Tapet på Bornholm er utsagn fra intervjuede (R7-013).
- **Oversikten for runde 2, Grenser:** MSBs ASF-evaluering er lest i fulltekst i R5-kontrollen, ikke bare via omtale.

## Grenser

- Sammenstillingen er KI-basert og ikke faglig godkjent.
- Tolkningene merket «Sammenstilling:» er ikke kontrollert av noen andre.
- Grensene i kontrollen gjelder fortsatt: høyst ca. 35 påstander per rapport i runde 2, fraværsfunn er ikke kontrollert, og noen kilder er lest via sammendrag eller sekundærkilde.
- Groks anbefalinger og den analytiske syntesen i R7 og X er ikke brukt.
- Valget mellom NordForsk tema 1 og tema 2 ligger utenfor R9.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.

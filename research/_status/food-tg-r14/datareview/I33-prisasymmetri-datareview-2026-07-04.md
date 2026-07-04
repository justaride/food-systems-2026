---
tittel: I33 prisasymmetri datareview
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I33 prisasymmetri datareview

## Kort dom

I33 skal fortsatt være parkert etter datareview. AP-7 er et nyttig internt prisatferdsfunn for laks→foredling, med eksplisitte SSB-serier og klar metodepresedens. Men det er ikke nok til ny I33-innsiktsnode eller ekstern møtefigur: valuta er ikke kontrollert, nedstrømsserien er bredere enn laks, og det opprinnelige fôr→oppdrett-leddet mangler native månedlig fôr-/prisserie.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| `docs/project/analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md` | Hovedanalyse, claim-lock-utkast, valuta-/kategori-forbehold og needs-data for fôr→oppdrett. |
| `research/norge/kvantitativ-dybdeanalyse.md` | Metodepresedens for asymmetri-testen, brukt som intern sammenligningsramme. |
| SSB 03024, `https://data.ssb.no/api/v0/no/table/03024/` | Oppstrøms laks, eksport av oppalen laks, kilopris. |
| SSB 12462, `https://data.ssb.no/api/v0/no/table/12462/` | Nedstrøms PPI SNN102 for bearbeiding fisk, skalldyr og bløtdyr. |
| `docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg` | Intern figurflate; ikke ekstern uten claim-lock og valutakontroll. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Testet domene eksplisitt | Ja. AP-7 tester laks→foredling for 2019M01-2025M12. | Kan ikke generaliseres til grønt, dagligvare, fôr→oppdrett eller hele havbruksøkonomien. |
| Serietilpasning | Delvis. Oppstrøms er laksespesifikk, nedstrøms er SNN102 for all fisk/skall/bløtdyr. | Ikke les funnet som ren laksespesifikk margin- eller markedsmaktclaim. |
| Valutakontroll | Ikke lukket. AP-7 sier eksplisitt at NOK-svekkelse kan løfte eksport-PPI. | Ekstern bruk krever valutadeflatering, USD/EUR-kontroll eller separat hjemmemarkedsserie. |
| Native fôr-/prisseriesjekk | Ikke lukket. Norsk månedlig fôr-PPI finnes ikke i SSB-underlaget; fôr→oppdrett er proxy-testbart, men ikke native tilfredsstilt. | I33 må ikke bli fôr/import- eller fôrkost-asymmetri-node uten ny PCQ. |
| Metode/reproduserbarhet | Delvis. NARDL/distribuert-lag er subagent-beregnet og internt dokumentert; 2025-illustrasjonen er enklere å etterprøve. | Bruk internt som metode-/prisatferdsindikator; reproduser beregning før ekstern claim. |
| Publiserbar formulering | Nei som I33 nå. Ja som caveat: "AP-7 peker på asymmetrisk prisatferd, men svakeste punkt styrer gate." | Behold i researchkø/claim-lock, ikke ny Obsidian-node eller møtefigur. |

## Beslutning

- I33 forblir parkert etter datareview.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I33 ...` skal genereres i denne runden.
- AP-7 kan brukes internt som prisatferds-/metodecaveat, men ikke som ekstern margin-, intensjons- eller fôr→oppdrett-claim.
- En senere I33 kan bare åpnes etter eksplisitt ny beslutning og PCQ/claim-lock som lukker valuta, SNN102-kategori, metode-reproduksjon og native/proxy-seriegrense.

## Ikke si

- Ikke si at proxy-testen dokumenterer fôr→oppdrett-prisasymmetri.
- Ikke si at stigende foredlings-PPI mens råpris faller beviser marginbygging, intensjon eller misbruk av markedsmakt.
- Ikke behandle SNN102 som en ren lakseforedlingsserie.
- Ikke generaliser AP-7 til dagligvare, grønt, fôrkjede eller andre domener.
- Ikke bruke AP-7 eksternt uten valutakontroll, kategoriavgrensning og claim-lock.
- Ikke generer I33 uten eksplisitt menneskelig beslutning.

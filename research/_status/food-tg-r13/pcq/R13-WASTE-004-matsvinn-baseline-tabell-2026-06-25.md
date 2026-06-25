# R13-WASTE-004 - matsvinn baseline-tabell PCQ control artifact

**Dato:** 2026-06-25
**Status:** PCQ-only, ikke claim-lock
**Kildegrunnlag:** `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md`, Matvett/NORSUS, SSB metodekilder
**Bruksregel:** Intern kontroll. Ikke figur, deck, whitepaper eller ekstern claim.

## Kort dom

Matvett/NORSUS gir et nyttig 2024-baselineanker for kartlagt matsvinn. Baseline kan likevel ikke brukes som én harmonisert sektorserie uten synlig metodefelt, fordi sektortallene kan ha ulike måleperioder, definisjoner og datakvalitet.

## Radvis uttrekk

| Rad | Kilde | Lokator | År/periode | Klasse | Uttrekk | Enhet | Scope | Metodegap | Tom celle |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Matvett/NORSUS | faktaark matsvinn 2024 | 2024 | A/B | 407 100 kartlagt matsvinn | tonn | Norge, kartlagt matsvinn | sektorvise metoder | harmonisert metode |
| 2 | Matvett/NORSUS | faktaark matsvinn 2024 | 2024 | A/B | 73,4 per innbygger | kg/person | per capita | samme sektorgrunnlag | usikkerhet |
| 3 | Matvett/NORSUS | faktaark matsvinn 2024 | 2024 | B | husholdninger 47 prosent | prosent | sektorandel | ikke nødvendigvis direkte 2024-målt | 2024 husholdningsmåling |
| 4 | Matvett/NORSUS | faktaark matsvinn 2024 | 2024 | B | dagligvare 12 prosent | prosent | sektorandel | prosjekt/oppdatering pågår | oppdatert dagligvaretall |
| 5 | Matvett | tall og fakta/KuttMatsvinn | 2015-2024 | A/B | 24 prosent reduksjon kg/person ekskl. jordbruk | prosent | trend | scope-eksklusjon må vises | jordbruk |
| 6 | SSB | notat 2025/37 og husholdningsavfall | 2025 | A | metodeutvikling og mat/våtorganisk avfall | tekst/avfallskategori | offisiell statistikk/metode | avfallskategori er ikke spiselig matsvinn | spiselig andel |

## Kontrollert intern formulering

- Matvett/NORSUS kan støtte 2024-baseline for kartlagt matsvinn med metodecaveat.
- Husholdning, dagligvare og servering må vises med år, definisjon og kildeklasse per rad.
- SSB avfallskategori kan brukes som metodekontekst, ikke som synonym for spiselig matsvinn.

## Fortsatt ikke claim-lock

| Mangler | Hvorfor det stopper claim/figur |
|---|---|
| Direkte 2024 husholdningsmåling | Uklart om husholdningsandelen bygger på siste måling fra annen periode. |
| Oppdatert dagligvaretall | Ny kartlegging/prosjekt må inn før fersk sektorclaim. |
| Harmonisert sektormetode | Sektorene kan ikke sammenlignes uten metodefelt. |
| Skille spiselig/uspiselig | Matavfall, matsvinn og våtorganisk avfall må ikke blandes. |

## Ikke si

- Ikke si at denne raden er claim-locket.
- Ikke bruk URL-status som bevis for tallinnhold.
- Ikke fyll tomme celler med estimat.
- Ikke si at SSB mat/våtorganisk husholdningsavfall er lik spiselig matsvinn.

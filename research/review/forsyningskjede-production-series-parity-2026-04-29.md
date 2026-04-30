# Forsyningskjede production series parity

Dato: 2026-04-29  
Kilde: `research/data/nordic/core-series/production_annual_first_panel.csv`

## Status

Produksjonspanelet har fem land, men ikke full paritet.

| Land | Nåværende serie | Siste verdi | Vurdering |
| --- | --- | ---: | --- |
| NO | Havreproduksjon | 243.7 tusen tonn i 2025 | Sammenlignbar med SE/FI |
| SE | Havreproduksjon | 622.5 tusen tonn i 2024 | Sammenlignbar med NO/FI |
| FI | Havreproduksjon | 1 207.5 tusen tonn i 2024 | Sammenlignbar med NO/SE |
| DK | Kornproduksjon, verdi | 11 534 mill. DKK i 2024 | Verdi-fallback, ikke sammenlignbar med havrevolum |
| IS | Biffproduksjon | 4 674 tonn i 2025 | Smal volum-fallback, ikke samme varegruppe |

## Proxy-kandidater funnet lokalt

Se `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`.

- DK har lokale kandidater for korn totalt, havre, melk, svin, poteter, villfangst og akvakultur.
- IS har lokale kandidater for villfangst, akvakultur, foredlingsgrad, melk, kjøtt, drivhusgrønnsaker og poteter.
- DK korn totalt 2024, IS villfangst 2024 og IS akvakultur 2024 har nå `official_primary_snapshot`; resten står som `needs_primary_check`.

## Bruksregel

- NO/SE/FI kan brukes som et smalt, sammenlignbart havre-subpanel.
- DK og IS skal ikke vises i samme produksjonsgraf som om de måler samme fenomen.
- For nordisk paritet trengs enten felles produksjonskurv eller eksplisitt landspesifikk proxy med tydelig metode.

## Neste kildejakt

1. DK: finn direkte korn-/havrevolum eller bredere produksjonskurv fra StatBank.
2. IS: bygg produksjonsproxy rundt sjømatfangst/foredling pluss relevante landbruksserier, ikke bare biff.
3. Alle land: vurder minimumskurv med korn/plante, husdyr/meieri og sjømat der relevant.

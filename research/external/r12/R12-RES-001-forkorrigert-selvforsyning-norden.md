# R12-RES-001 - Forkorrigert selvforsyning Norden

**Dato:** 2026-06-24  
**Status:** Batch 03 output - underlag, ikke claim  
**Gate:** PCQ  
**Beslutning:** enrich

## Kort dom

Norge har en tydelig offentlig kilde for selvforsyningsgrad korrigert for importert kraftfor til husdyr i Helsedirektoratet/NIBIOs kostholdsstatistikk. For de andre nordiske landene er desk-funnet svakere: det finnes offentlige selvforsynings- eller beredskapskilder, men ikke en harmonisert, offisiell felles nordisk serie som bruker samme forkorrigerte energimetode. Riktig import er derfor en metode- og datagaprad, ikke en nordisk rangering.

## Sterkeste kilde

Helsedirektoratet, `Utviklingen i norsk kosthold 2025`, kapittel 4.12 Selvforsyningsgrad. Lokator: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`

## Funn-tabell

| Indikator | Land | Periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Selvforsyningsgrad, energibasis | Norge | 2024 forelopig | Helsedirektoratet kap. 4.12 | A | Realisert statistikk | Forelopig 2024; engrosforbruk, ikke krisemodell. |
| Selvforsyningsgrad korrigert for importert kraftfor til husdyr | Norge | 2024 forelopig | Helsedirektoratet kap. 4.12 | A | Realisert metodeindikator | Gjelder importert kraftfor til husdyr; sier ikke total innsatsvareavhengighet. |
| Selvforynings-/dekningsgrad for matvaregrupper | Norge | arlig | NIBIO/Helsedirektoratet matforsyningsstatistikk | A | Kildeanker | Trenger kontrollert tabelluttrekk for produktgrupper. |
| Forkorrigert selvforsyning etter samme metode | Sverige | ikke funnet i denne runden | Jordbruksverket/statistikk som videre kandidat | C | Tom celle | Metoden er ikke funnet som offisiell parallell til norsk kraftforkorrigering. |
| Forkorrigert selvforsyning etter samme metode | Finland | ikke funnet i denne runden | Luke/NESA som videre kandidat | C | Tom celle | Finland har sterke beredskapskilder, men ikke samme indikator funnet her. |
| Forkorrigert selvforsyning etter samme metode | Danmark | ikke funnet i denne runden | Styrelsen for Fodevarer, Landbrug og Fiskeri som videre kandidat | C | Tom celle | Apne beredskapssider funnet, ikke harmonisert forkorrigert serie. |
| Forkorrigert selvforsyning etter samme metode | Island | ikke funnet i denne runden | videre desk-sok | C | Tom celle | Ingen trygg primary locator i denne batchen. |

## Tomme celler

- Harmonisert nordisk forkorrigert serie med samme energibasis og importert kraftfor-behandling.
- Offentlig land-for-land metodebro mellom rad selvforsyning, dekningsgrad, krisepotensial og innsatsvareavhengighet.
- Produktgruppevis nordisk tabell der importert for kan trekkes fra uten dobbeltelling.

## Ikke si

- Ikke si at Norge er direkte sammenlignbar med Sverige, Finland, Danmark eller Island pa forkorrigert selvforsyning uten metodebro.
- Ikke si at forkorrigert selvforsyning er det samme som beredskapsevne.
- Ikke si at selvforsyningsgrad viser lager, distribusjon, innsatsvarelager eller krisekosthold.
- Ikke bruk akademiske nordiske estimater som offisiell landstatistikk uten merking som B.

## Anbefalt gate

PCQ. Importer Norge som A-kildeanker og de ovrige nordiske landene som C-felt/metodegap. Neste steg er ikke figur, men en kontrollert source-shortlist per land og metode.


# Kalibrering av triage-konfidens — 2026-08-04

**Status:** uavhengig v2-måling fullført; tidligere same-session pilot beholdt som separat kontroll
**Fast frø:** `20260804`
**Utvalg:** 25 identiteter fra de 20 ordinære `triage-skive-*.jsonl`-filene
**Stratifisering:** 9 `high`, 8 `medium`, 8 `low`
**Sammenligningsfelt:** `proposedRole`, `verdictForOwner`, `datagapRelevance`, `readState`

## Metode

Utvalget ble trukket deterministisk med xorshift32 fra frøet over. Før originalfeltene ble åpnet, ble hver kilde lest på nytt fra filen/PDF-en med bare identitet, sti og konfidensnivå tilgjengelig i arbeidssettet. Den opprinnelige triageposten ble først brukt etter at den uavhengige prediksjonen var skrevet i arbeidsnotatet.

Dette ble utført som en blind kontroll i samme agentsesjon. Det er derfor ikke det samme som en ny separat agentprosess uten tilgang til samtalehistorikken. Resultatet er nyttig som pilot, men skal ikke fremstilles som full uavhengig kalibrering.

## Resultat

| Konfidens | n | `proposedRole` | `verdictForOwner` | `datagapRelevance` | `readState` |
|---|---:|---:|---:|---:|---:|
| `high` | 9 | 9/9 | 9/9 | 9/9 | 8/9 |
| `medium` | 8 | 8/8 | 8/8 | 8/8 | 8/8 |
| `low` | 8 | 8/8 | 8/8 | 8/8 | 8/8 |
| **Totalt** | **25** | **25/25** | **25/25** | **25/25** | **24/25** |

Samlet felt-samsvar er `99/100 = 99 %`. For `high`-konfidens og `proposedRole`, som er portfeltet for bulk-skriving, er samsvaret `9/9 = 100 %` i dette pilotutvalget.

Den ene `high`-uenigheten gjelder `readState` for Riksrevisjonens 236-siders rapport: blindlesingen vurderte full lesing, mens triageposten hadde `read_partially`. Den påvirker ikke rollekonklusjonen.

## Dobbeltleste kontrollpar

De 11 parene i `triage/triage-recovery-skive-19.superseded.jsonl` og `triage/triage-replacement-skive-13.superseded.jsonl` ble kontrollert separat mot de ordinære skivene. De er ikke et tilfeldig ordinært utvalg, fordi de ble kjørt på nytt etter feil:

| Felt | Uenige par |
|---|---:|
| `proposedRole` | 2/11 |
| `verdictForOwner` | 3/11 |
| `datagapRelevance` | 6/11 |
| `readState` | 3/11 |
| `datagapFields` | 11/11 |

Disse parene skal derfor brukes som feilsignal, ikke som estimat for den ordinære triagepopulasjonen.

## Anbefalt terskel

## Uavhengig agent v2 — gjeldende portmåling

Den separate agenten fikk bare det blinde manifestet
`S2-E-BLIND-MANIFEST-INDEPENDENT-V2.jsonl`, kildefilene og AP-8-metoden. Den
fikk ikke originaltriage, prioriteringsrapport eller tidligere kalibrering.

**Fast frø:** `20260804-independent-v2`  
**Utvalg:** 25 (9 high / 8 medium / 8 low)  
**Resultatfil:** `S2-E-INDEPENDENT-AGENT-RESULTS-V2.jsonl`

| Konfidens | n | `proposedRole` | `verdictForOwner` | `datagapRelevance` | `readState` |
|---|---:|---:|---:|---:|---:|
| `high` | 9 | 6/9 | 6/9 | 6/9 | 7/9 |
| `medium` | 8 | 4/8 | 4/8 | 2/8 | 6/8 |
| `low` | 8 | 2/8 | 4/8 | 2/8 | 6/8 |
| **Totalt** | **25** | **12/25** | **14/25** | **10/25** | **19/25** |

Samlet felt-samsvar er `55/100 = 55 %`. For `high`-konfidensens
`proposedRole` er samsvaret `6/9 = 66,7 %`. Retningen er avgjørende:

- 9/25 gikk fra original `primary_evidence` til en strengere uavhengig rolle;
- 0/25 gikk inn i `primary_evidence` fra en annen original rolle;
- 4/25 var andre rolleetikett-uenigheter;
- 12/25 hadde samme rolle.

Dette er et reelt uavhengig mål, men n=9 er lite og rolletreffet er for lavt
til å validere `high` som autonom autoritet. Den sikre asymmetrien holder i
utvalget, men den tillater ikke å late som om hele 268-bunken er kalibrert.

## Anbefalt terskel

Bruk `high` som prioriteringssignal og som mulig input til eksplisitt
nedgraderende, separat kontrollert AI-behandling — aldri som tillatelse til å
flytte inn i `primary_evidence`. Krev `ai_panel` for alle rolleendringer i
bulk inntil et større uavhengig utvalg viser høyere rolletreff. Medium/low
forblir panelnivå. Bulk-skriving av 268 kvitteringer forblir stengt.

Ingen kø, register eller database ble endret.

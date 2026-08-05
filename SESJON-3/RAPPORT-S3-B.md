# Rapport S3-B — blind uavhengig kalibrering n=100

**Dato:** 4. august 2026  
**Sample:** `20260804-independent-v3`  
**Metode:** én uavhengig agent fikk bare manifestet og de 100 angitte kildefilene. Tidligere triage, S2-resultater, S3-A-resultater, kø og rapporter var eksplisitt utenfor leseflaten.

## Resultat

| Måling | Resultat |
|---|---:|
| Manifestrader | 100 / 100 |
| Resultatrader | 100 / 100 |
| Lest fullt | 85 |
| Lest delvis | 11 |
| Ikke lest | 4 |
| Manifestets kildekonfidens | 36 høy / 40 medium / 24 lav |
| Agentens konfidens | 39 høy / 44 medium / 17 lav |
| `primary_evidence` | 52 |
| `internal_synthesis` | 31 |
| `operational_control` | 8 |
| `unknown` | 9 |

Agentens rårespons manglet `document:`-prefikset i identitetsfeltene. Resultatfilen binder derfor identitetene deterministisk til manifestrekkefølgen; rolle-, gap-, lese- og begrunnelsesfeltene er ikke endret.

## Sammenhold mot maskinell foreløpig rolle

Sammenholdet er gjort etterpå mot `provisionalRole` i den eksisterende rolleklassifiseringskøen. Dette er en kalibreringsmåling, ikke en automatisk korrigering.

| Måling | Resultat |
|---|---:|
| Samme rolle | 52 / 100 |
| Annen rolle | 48 / 100 |
| Ut av `primary_evidence` | 48 |
| Inn i `primary_evidence` | 0 |
| Uendret | 52 |

Den uavhengige lesingen utfordrer dermed den foreløpige `primary_evidence`-rollen for 48 av 100 kilder, hovedsakelig mot `internal_synthesis` eller `unknown`. Resultatet er et eier- og metode-signal, ikke en kømutasjon.

## Kontrollflate

Fullt resultatgrunnlag ligger i `SESJON-3/S3-B-INDEPENDENT-AGENT-RESULTS-N100.jsonl`, og blindmanifestet ligger i `SESJON-3/S3-B-BLIND-MANIFEST-N100.jsonl`. Ingen kø-, register- eller databaseendringer ble gjort.

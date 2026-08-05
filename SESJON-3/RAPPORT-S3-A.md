# Rapport S3-A — panel på rolleklassifisering

**Dato:** 4. august 2026  
**Metode:** tre uavhengige, lesende panelprosesser per identitet i korrigeringssettet på 288 identiteter i §6 i `NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md`; rapporten beholder pilotmålingen separat.
**Policy:** `AUTONOMIPOLICY-2026-08-04`  
**Kontrakt:** `knowledge/corpus/CORPUS-ROLE-CLASSIFICATION-RECEIPTS-CONTRACT.md`

## Resultat

Panelet brukte tre separate agentprosesser per identitet. Hver agent fikk kun en lesbar kildefil, rolle-schemaet og identitetsnøkkelen. Ingen agent fikk triageposten, prioriteringsrapporten eller de andre stemmene.

| Måling | Resultat |
|---|---:|
| Identiteter i pilot | 25 |
| Panelstemmer | 75 |
| Enstemmige paneler | 16 |
| Eskalerte paneler | 9 |
| Enstemmighetsrate | **64,0 %** |
| Stoppgrense i START-HER | 60 % |
| Validerbare `ai_panel`-kvitteringer skrevet | **16** |
| Kø-/register-/databaseendringer | 0 |

Enstemmighetsraten er over stoppgrensen. S3-A kan derfor fortsette med samme panelmekanisme på resten av korrigeringssettet. Det betyr ikke at `high` igjen er autonom bulk-autoritet: alle aksepterte pilotbeslutninger er merket `decidedBy: "ai_panel"`.

## Retningsfordeling etter policy §2

Alle 25 pilotradene hadde `previousRole: primary_evidence`.

| Retning | Enstemmige paneler | Alle 75 stemmer |
|---|---:|---:|
| Ut av `primary_evidence` — strengere/sikker retning | 7 | 39 |
| Inn i `primary_evidence` — løsere/farlig retning | 0 | 0 |
| Uendret `primary_evidence` | 9 | 36 |

Ingen panelstemme flyttet en identitet inn i `primary_evidence`.

## Kvitteringer

De 16 enstemmige beslutningene er materialisert som hashbundne kvitteringer i:

`worktrees/nordic-knowledge-canonical-v1/knowledge/corpus/corpus-role-classification-receipts.v1.jsonl`

Kvitteringene ble laget gjennom den eksisterende receipt-mekanismen og validert mot rolle-schemaet, queue-row-hashene og panelreglene før materialisering. De er pilotkvitteringer; de er ikke skrevet til køen og er ikke en databaseendring.

Fullt bevart stemmegrunnlag for både enstemmige og eskalerte paneler ligger i:

`SESJON-3/S3-A-PILOT-PANEL-RESULTS.json`

## Eskaleringsliste

Uenighet betyr ingen kvittering. Alle tre stemmer og begrunnelser er bevart i resultatfilen.

| # | Identity key | Stemmer |
|---:|---|---|
| 5 | `document:cmp8xyoa500jyvvvm176c9i0n` | `primary_evidence / unknown / primary_evidence` |
| 7 | `document:cmp8xypc500luvvvme9ehlnlr` | `operational_control / internal_synthesis / operational_control` |
| 13 | `document:cmp8xypx200ntvvvmkvtxx1yv` | `internal_synthesis / primary_evidence / internal_synthesis` |
| 19 | `document:cmppajyr30003njvmka3xvjsc` | `unknown / unknown / primary_evidence` |
| 20 | `document:cmppajyrn0007njvmd1h15xme` | `unknown / unknown / primary_evidence` |
| 21 | `document:cmppajysv000dnjvm5uvvmk08` | `unknown / operational_control / unknown` |
| 22 | `document:cmppajyuc000qnjvmm7gsitu3` | `unknown / primary_evidence / primary_evidence` |
| 23 | `document:cmppajyw8001bnjvm9rn9oa2w` | `unknown / unknown / primary_evidence` |
| 25 | `document:cmppajywp001gnjvmm2tb78w5` | `unknown / unknown / primary_evidence` |

Eskaleringene samler seg rundt locator-/ankerfiler og ufullstendige nettsidefangster. Dette er et innholdsproblem som panelet skal stoppe, ikke en feil som skal jevnes ut med flertallsregel.

## Teknisk avvik og kontroll

Den refererte rolle-kontrakten manglet i hovedarbeidsflaten, men ble verifisert i canonical-worktree på commit `462bb2f`/`4f38830` og lest i sin helhet. For å gjøre agentenes leseflate tilgjengelig ble de 25 kildene og schemaet speilet midlertidig under `SESJON-3/.s3-a-inputs/`. Speilet inneholdt ikke kø-, triage- eller prioriteringsmetadata.

`npm run knowledge:processing-contracts:check` er grønn etter materialiseringen: 282 tester, 282 pass, 0 feil.

## Fullt korrigeringssett — S3-A

Alle 288 identiteter ble behandlet med tre stemmer hver, totalt 864 panelstemmer. Enstemmighet betyr samme foreslåtte rolle fra alle tre og tre substansielle begrunnelser. Ulik konfidens er bevart og gjør ikke i seg selv rollen uenstemmig; receipt-konfidensen velges konservativt.

| Måling | Resultat |
|---|---:|
| Identiteter behandlet | 288 / 288 |
| Panelstemmer | 864 |
| Enstemmige paneler | 214 |
| Eskalerte paneler | 74 |
| Enstemmighetsrate | **74,3 %** |
| Rolle: `primary_evidence` | 42 |
| Rolle: `internal_synthesis` | 159 |
| Rolle: `operational_control` | 10 |
| Rolle: `unknown` | 3 |
| Ut av `primary_evidence` | 172 |
| Inn i `primary_evidence` | 0 |
| Uendret `primary_evidence` | 42 |
| Kø-/register-/databaseendringer | 0 |

Enstemmighetsraten er over pilotens stoppgrense på 60 %. Ingen panelstemme flyttet en identitet inn i `primary_evidence`. De 74 eskaleringene har ingen AI-panelkvittering og skal stå som owner-review-kandidater.

Fullt stemmegrunnlag for alle 288 identiteter ligger i `SESJON-3/S3-A-PANEL-RESULTS-N288.json`. De 214 hashbundne `ai_panel`-kvitteringene ligger i canonical-worktree på `knowledge/corpus/corpus-role-classification-receipts.v1.jsonl`; receipt-loggen er validert mot køen og schemaet. Dette er fortsatt ikke en kø-, register- eller databaseendring.

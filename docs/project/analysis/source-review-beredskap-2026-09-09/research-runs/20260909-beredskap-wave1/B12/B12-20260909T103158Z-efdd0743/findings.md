# B12 findings — Institusjonsmåltider (C4)

programRunId: `20260909-beredskap-wave1`  
runId: `B12-20260909T103158Z-efdd0743`  
planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`  
foundationCommit: `4026a90d62edf129d4323f7f0971ace716b03983`  
status: `waiting_owner`  
human_verified: false

## Spørsmål 1 — Kan Hyltes datomotsigelse og faktisk tids-/måltidslogg avklares i primærprotokoll?

**Svar (presist stopp):** Nei, ikke med offentlig tilgjengelige kilder i denne kjøringen.

- Frossen kommunal nyhet (MEAL-S001) sier fortsatt «Tisdagen den 16 april» for øvelse Patricia; sivilkalenderen for 2025-04-16 er onsdag. Ingen stille retting.
- Tertialrapport 1 / SBN-underlag (B12-S23, B12-S26) bekrefter bare at en realistisk krisøvelse skjedde **under våren** med fokus matförsörjning/vattenlogistik ved lengre el- og vannbortfall, finansiert via Livsmedelsverkets pilot — uten kalenderdato, ukedag, tidslogg, matkontrollskjema eller næringsberegning.
- MeetingPlus-søk (`text=Patricia|krisövning|matförsörjning`, …) fant tertialvedlegg og generiske styrdokumenter; synlige sidetitler på Patricia side 1 er ikke navngitt øvelsesprotokoll. Side 2 ble ikke hentet (UI 1 av 2; page/pageSize-parametre endret ikke lista) — registrert som delgap `B12-20260909T103158Z-efdd0743-G01`, ikke som bevis på at protokoll mangler i arkivet.
- **Eierbehov:** usendt forespørsel `unsent-requests/B12-MEAL-G001-unsent.json` (ikke sendt).

## Spørsmål 2 — Spist egnet mat, spesialkost, spiselig svinn, arbeid, kostnad, vann og brensel over flere måltider?

**Svar (presist stopp / målebehov):** Ukjent under identisk avbrudd.

- Nyheten oppgir operatørrapportert **ett** måltid for 180 personer, samling innen én time, fire timers etableringsmål og at livsmedelskontroll ble dokumentert — ikke spist egnet volum, spesialkost, spiselig svinn, vannliter, brensel, arbeidstimer eller kostnad.
- Tertial 2 (B12-S24) nevner pilotstøtte **700 000 kr** til utstyr/hållbara måltider og at øvelse er gjennomført, pluss ordinær drift («270 gram» oppäten mängd i snitt) og planlagte fremtidige beredskapsmatlagingsøvelser. Dette er **ikke** flerdøgns avbruddsmåling. Stoppregel: én økt ≠ flerdøgnskapasitet; mindre avfall kan skyldes mindre servering.
- MEAL-T001 forblir `proposed_not_executed`. Fysiske tester er ikke autorisert i B12.

## Spørsmål 3 — Konkret nordisk metodetillegg utover kjøkkenets nasjonale baseline?

**Svar (presist stopp / metodebehov):** Ikke spesifisert.

- Svensk lokal øvelse + svensk nasjonalt pilottilskudd er metodeeksempler / finansiering, ikke dokumentert nordisk tillegg etter norsk lokal baseline på samme kjøkken/scenario (MEAL-G004).
- Flere nasjonale øvelsesberetninger beviserer ikke nordisk tillegg.

## Kjent vs ukjent

| Kjent (kildebundet) | Ukjent |
|---|---|
| Nyhetspåstand om Patricia, 180-måltid, 1 t samling, 4 t mål | Eksakt dato/ukedag, faktiske serveringstider |
| Tertial: øvelse under våren; pilot; 700000 SEK støtte | Primærprotokoll, matkontrollrådata, næringsberegning |
| MEAL-T001 feltliste fra veiledning | Utført før/etter-måling under identisk avbrudd |
| Ordinær 270 g-påstand i tertial 2 | Spiselig svinn/ernæring under avbrudd over flere måltider |

## Motsigelser

- Ukedag i nyhet («Tisdagen») vs kalender onsdag 2025-04-16 — uløst.
- Ingen annen tallmotsigelse introdusert; 180 og 700000 og 270 er holdt i sine kilders roller (øvelsesutfall / pilotstøtte / ordinær drift).

## Stoppregel etterlevd

- Ingen ny bred øvelsesnyhetsrunde.
- Ingen fysisk test.
- Ingen skalering av én økt til døgnkapasitet.
- Ingen e-post/kontakt/publisering/endring av research-plan eller prior rounds.

## Neste steg

Koordinator/eier: innhent Hylte primærprotokoll (B12-REQ-01..08). Ny `runId` for hashbinding. Parallelt: spesifiser MEAL-G004 metodeinnhold før eventuell autorisert MEAL-T001.

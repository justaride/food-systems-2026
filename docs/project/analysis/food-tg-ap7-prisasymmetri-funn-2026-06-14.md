---
tittel: Food TG AP-7 — Pris-asymmetri replikert til havbruk/foredling: funn 2026-06-14
status: Internt analysefunn (fan-out-subagent + coordinator-verifikasjon) — STØTTET, valuta-forbehold
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-7 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: SSB åpne tabeller 03024 (lakseeksport kilopris) + 12462 (PPI bearbeiding fisk, SNN102); metodepresedens research/norge/kvantitativ-dybdeanalyse.md §H-NY1
bruksregel: Internt analysefunn. Formuleres som prisatferd/mønster i kjeden, ikke som intensjon eller margin-anklage. Gjelder testet domene (laks→foredling), ikke generalisert. Valuta er ikke kontrollert (se §4). Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - research/norge/kvantitativ-dybdeanalyse.md
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-section8-3-4-funn-2026-06-14.md
  - docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg
---

# AP-7 — Pris-asymmetri replikert til havbruk/foredling

## 1. Kort funn

«Rockets and feathers»-asymmetrien (priser stiger raskere enn de faller) — dokumentert for dagligvare i `kvantitativ-dybdeanalyse.md` (H-NY1, PPI→KPI) — finnes **uavhengig også i havbruks-/fiskeforedlingskjeden**. Nedstrøms produsentprisindeks for fiskeforedling fanger kumulativt **~0,27 av oppstrøms lakseråpris-økninger, men kun ~0,13 av prisfall** — en statistisk sterk asymmetri (NARDL β_opp−β_ned = +0,14, t=14,0; 2019M01–2025M12, n=84). Den reneste illustrasjonen er 2025: gjennomsnittlig lakseråpris falt ~13 % (94,4 → 81,8 kr/kg), mens foredlings-PPI **steg ~10 %**. Funnet er et selvstendig domene-funn, ikke en overføring av dagligvarefunnet — men med ett vesentlig forbehold: **valuta er ikke kontrollert**, så deler av PPI-løftet kan være NOK-svekkelse snarere enn ren marginbygging.

## 2. Domene og serier

| Rolle | Serie | SSB-tabell | Måler | Periode |
|---|---|---|---|---|
| Oppstrøms (råpris) | Eksport oppalen laks, fersk, kilopris (kr/kg) | 03024 | Førstehåndspris oppdretter/eksportør; uke→måned | 2019M01–2025M12 |
| Nedstrøms (produsentpris) | PPI SNN102 «Bearbeiding fisk, skalldyr, bløtdyr» (2021=100) | 12462 | Prisen foredlerne tar ut | 2019M01–2025M12 |

84 matchede månedsobservasjoner. Fôr→oppdrett-leddet (det opprinnelig spesifiserte) kunne ikke testes rent — SSB publiserer ingen separat månedlig fôr-PPI (se §6).

## 3. Asymmetri-test

Metoden fra H-NY1 operasjonaliserer asymmetri som: gjennomslaget er raskere/større når oppstrøms stiger enn når den faller.

- **Distribuert-lag (lag 0–3), opp/ned-splittet:** kumulativt gjennomslag +0,272 (opp) vs +0,081 (ned); asymmetri +0,191; signifikant lag-3 på stigninger (t=+3,49); R²=0,43.
- **NARDL kumulativ (R²=0,94):** β_opp = +0,272 (t=11,1), β_ned = +0,134 (t=4,1); **asymmetri β_opp−β_ned = +0,139, t=14,0** — sterkt signifikant. Nedstrøms fanger ~2× mer av oppstrøms økninger enn av fall.
- **Fortegnstest:** av 40 måneder med stigende lakspris steg foredlings-PPI i 78 %; av 43 måneder med fallende lakspris steg PPI likevel i 51 %.
- **Årsnivåer:** lakspris 2022→2025 = 80,8 / 95,3 / 94,4 / 81,8 kr/kg; foredlings-PPI = 124,6 / 140,2 / 148,2 / 162,8 — PPI fortsetter monotont opp også når råprisen snur ned.

Resultat: **bekreftet** for dette domenet, med høyere statistisk styrke enn dagligvarefunnet (formell Wald-asymmetri t=14,0 mot dagligvarens fasebaserte vurdering).

Figur: `docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg` (β_opp +0,272 vs β_ned +0,134; 2025-illustrasjon råpris −13 % / PPI +10 %; valuta-forbehold markert).

## 4. Tolkning og det avgjørende forbeholdet

Retningen er identisk med dagligvare: prisøkninger slår raskt og fullt gjennom nedstrøms, prisfall tregt/ufullstendig. Men funnet sier noe om **prisatferd i kjeden**, ikke nødvendigvis ren marginbygging, av to grunner som **må** følge claimen:

1. **Valuta ikke kontrollert.** Foredlings-PPI inkluderer eksportmarked; NOK-svekkelse løfter eksport-PPI uavhengig av råpris. At PPI stiger mens NOK-laksprisen faller kan derfor delvis være en valutaeffekt. Før ekstern bruk: deflater laksprisen (EUR/USD) eller bruk hjemmemarkeds-PPI separat.
2. **SNN102 dekker all fisk** (skalldyr/bløtdyr inkludert), ikke kun laks. Råpris er laksespesifikk, nedstrøms er kategori-bred.

Generaliseres **ikke** til grønt eller andre domener — de er ikke testet.

## 5. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP7-001 (utkast) |
| Påstand | Asymmetrisk pristransmisjon er bekreftet også i havbruks-/fiskeforedlingskjeden: nedstrøms PPI (SSB 12462, SNN102) fanger kumulativt ~0,27 av oppstrøms lakspris-økninger (SSB 03024) men kun ~0,13 av prisfall (NARDL β_opp−β_ned = +0,14, t=14,0; 2019M01–2025M12, n=84). I 2025 falt råprisen ~13 % mens foredlings-PPI steg ~10 %. |
| Evidens | SSB 03024 (lakseeksport kilopris) + 12462 (PPI SNN102); NARDL + distribuert-lag + fortegnstest; metodepresedens H-NY1. |
| Dekning | 84 månedsobservasjoner 2019–2025; ett domene (laks→foredling). |
| Risiko | Valutaeffekt ikke renset (NOK-svekkelse løfter eksport-PPI); SNN102 = all fisk, ikke kun laks; uke→måned-aggregering. |
| Stoppspråk | Formuler som prisatferd/mønster, ikke intensjon eller margin-anklage. Ikke generaliser til andre domener. Ikke lån funnet til det utestede fôr→oppdrett-leddet. |
| Status | `intern STØTTET / medium-høy tillit` — ikke ekstern faktastemme før valutakontroll (deflater EUR/USD) og claim-lock. |

## 6. needs-data (det opprinnelige fôr→oppdrett-leddet)

Et rent fôr→laks-funn krever en fôr-prisindeks SSB ikke publiserer separat månedlig. Eksakt:

- Fôr-PPI: NACE 10.9 «Produksjon av dyrefôr» som egen rad i tabell 12462 (finnes ikke; nærmeste SNN108 er sammenblandet).
- Alternativt importprisindeks for fiskefôr-råvarer (fiskemel/-olje, soya) — egen tabell/varegruppe trengs (vurder Nofima/Fiskeridirektoratets fôrfaktor-/kostnadsstatistikk, ikke i SSBs åpne JSON-stat-API).

Inntil en av disse foreligger står fôr→oppdrett-leddet som `needs-data`; verken dagligvare- eller foredlingsfunnet skal lånes til det.

## 7. Verifikasjon

Tall regnet av subagent fra SSBs åpne JSON-stat-API (tabell 03024 + 12462), metode replikert fra `kvantitativ-dybdeanalyse.md` §H-NY1. Coordinator-forbehold: regresjonskoeffisientene (β, t) er subagent-beregnet og bør re-verifiseres med valutadeflatering før ekstern bruk; den retningsbestemte 2025-illustrasjonen (laks −13 %, PPI +10 %) er den enkleste etterprøvbare påstanden. Ingen committet fil endret; ingen påstand løftet til ekstern bruk.

## 8. Kilder

- SSB tabell 03024 «Eksport av oppalen laks» (varegruppe 01 fersk, kilopris, ukentlig) — <https://data.ssb.no/api/v0/no/table/03024/>
- SSB tabell 12462 «Produsentprisindeks» (SNN102 bearbeiding fisk, indeksnivå, måned) — <https://data.ssb.no/api/v0/no/table/12462/>
- SSB tabell 14700 (KPI mat, referanse til dagligvarefunn) — <https://data.ssb.no/api/v0/no/table/14700/>
- Metodepresedens: `research/norge/kvantitativ-dybdeanalyse.md` §H-NY1.

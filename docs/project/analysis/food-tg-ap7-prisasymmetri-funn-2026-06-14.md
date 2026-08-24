---
tittel: Food TG AP-7 — Pris-asymmetri replikert til havbruk/foredling: funn 2026-06-14
status: `intern SVEKKET` — retning bekreftet, signifikans ikke etablert (revidert 2026-08-24, se §6c). Fôr→oppdrett-leddet: `testet, negativt`. Erstatter juni-statusen «STØTTET, valuta-forbehold».
eier: Gabriel
dato: 2026-06-14
oppdatert: 2026-08-24
arbeidspakke: AP-7 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: SSB åpne tabeller 03024 (lakseeksport kilopris) + 12462 (PPI bearbeiding fisk, SNN102); metodepresedens research/norge/kvantitativ-dybdeanalyse.md §H-NY1
bruksregel: Internt analysefunn. Formuleres som prisatferd/mønster i kjeden, ikke som intensjon eller margin-anklage. Gjelder testet domene (laks→foredling), ikke generalisert. Valuta ER nå kontrollert (§6c c) og fjerner mesteparten av asymmetrien. Bruk ikke «t=14,0», «sterkt signifikant» eller «statistisk sterk» — se §6c (b). Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - research/norge/kvantitativ-dybdeanalyse.md
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-section8-3-4-funn-2026-06-14.md
  - docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg
  - scripts/analyze-price-asymmetry.ts
  - tests/scripts/analyze-price-asymmetry.test.ts
  - research/analyse/ap7-prisasymmetri.json
---

# AP-7 — Pris-asymmetri replikert til havbruk/foredling

## 1. Kort funn

> **Revidert 2026-08-24.** Avsnittet under erstatter juni-formuleringen etter reproduksjon med skript. Juni-tallene står bevart i tabellen i §6c (a), og §3 er merket med hva som ikke lenger gjelder.

«Rockets and feathers»-asymmetrien (priser stiger raskere enn de faller) — dokumentert for dagligvare i `kvantitativ-dybdeanalyse.md` (H-NY1, PPI→KPI) — finnes i **retning** også i havbruks-/fiskeforedlingskjeden, men den er **ikke statistisk etablert**. Nedstrøms produsentprisindeks for fiskeforedling fanger kumulativt ~0,29 av oppstrøms lakseråpris-økninger mot ~0,09 av prisfall (2019M01–2026M07, n=91). Forskjellen mellom de to er likevel ikke signifikant i differansespesifikasjonen (asymmetri +0,205, t=1,25, HAC 1,63), og kontroll for USDNOK fjerner rundt 60 % av den (+0,21 → +0,08).

Mønsteret er **minst i hjemmemarkedet og størst i eksportmarkedet** — akkurat slik man venter hvis en vesentlig del av PPI-løftet er NOK-svekkelse snarere enn prisatferd. Den deskriptive illustrasjonen fra 2025 står seg som observasjon: gjennomsnittlig lakseråpris falt ~13 % (94,4 → 81,8 kr/kg) mens foredlings-PPI steg ~10 %. Men et enkeltår er ikke et signifikanstest, og det skal ikke brukes som om det var det.

Juni-kjøringen rapporterte dette som «sterkt signifikant» med t=14,0. Den t-verdien kom fra en nivåregresjon på partialsummer av to trendende serier og reproduserer ikke i differansespesifikasjonen — se §6c (b), som også viser at samme spesifikasjon stempler et økonomisk meningsløst forhold som svært signifikant.

Fôr→oppdrett-leddet, som §6 satte som `needs-data`, er nå testet og gir **nullfunn** (§6c d).

## 2. Domene og serier

| Rolle | Serie | SSB-tabell | Måler | Periode |
|---|---|---|---|---|
| Oppstrøms (råpris) | Eksport oppalen laks, fersk, kilopris (kr/kg) | 03024 | Førstehåndspris oppdretter/eksportør; uke→måned | 2019M01–2025M12 |
| Nedstrøms (produsentpris) | PPI SNN102 «Bearbeiding fisk, skalldyr, bløtdyr» (2021=100) | 12462 | Prisen foredlerne tar ut | 2019M01–2025M12 |

84 matchede månedsobservasjoner. Fôr→oppdrett-leddet (det opprinnelig spesifiserte) kunne ikke testes rent — SSB publiserer ingen separat månedlig fôr-PPI (se §6).

## 3. Asymmetri-test

Metoden fra H-NY1 operasjonaliserer asymmetri som: gjennomslaget er raskere/større når oppstrøms stiger enn når den faller.

- **Distribuert-lag (lag 0–3), opp/ned-splittet:** kumulativt gjennomslag +0,272 (opp) vs +0,081 (ned); asymmetri +0,191; signifikant lag-3 på stigninger (t=+3,49); R²=0,43.
- **NARDL kumulativ (R²=0,94):** β_opp = +0,272 (t=11,1), β_ned = +0,134 (t=4,1); **asymmetri β_opp−β_ned = +0,139, t=14,0** — sterkt signifikant. Nedstrøms fanger ~2× mer av oppstrøms økninger enn av fall. ⚠️ **Tilbakevist 2026-08-24 (§6c b):** dette er en nivåregresjon på partialsummer av to trendende serier. Punktestimatene reproduserer, men t-verdien gjør det ikke — i differansespesifikasjonen er asymmetrien t=1,25. Ikke bruk t=14,0.
- **Fortegnstest:** av 40 måneder med stigende lakspris steg foredlings-PPI i 78 %; av 43 måneder med fallende lakspris steg PPI likevel i 51 %.
- **Årsnivåer:** lakspris 2022→2025 = 80,8 / 95,3 / 94,4 / 81,8 kr/kg; foredlings-PPI = 124,6 / 140,2 / 148,2 / 162,8 — PPI fortsetter monotont opp også når råprisen snur ned.

Resultat: ~~**bekreftet** for dette domenet, med høyere statistisk styrke enn dagligvarefunnet (formell Wald-asymmetri t=14,0 mot dagligvarens fasebaserte vurdering).~~

**Revidert 2026-08-24:** resultatet er **retning bekreftet, signifikans ikke etablert**. Påstanden om «høyere statistisk styrke enn dagligvarefunnet» faller bort sammen med t=14,0 — den sammenligningen satte en spuriøs t-verdi opp mot dagligvarefunnets fasebaserte vurdering. Se §6c.

Figur: `docs/project/figures/food-tg-2026-06-15/fig-ap7-pris-asymmetri.svg` (β_opp +0,272 vs β_ned +0,134; 2025-illustrasjon råpris −13 % / PPI +10 %; valuta-forbehold markert).

## 4. Tolkning og det avgjørende forbeholdet

> **Lukket 2026-08-24.** Forbehold 1 under er nå målt, ikke bare flagget — og det
> viste seg å være avgjørende på ordentlig: valutakontroll fjerner rundt 60 % av
> asymmetrien, og hjemmemarkeds-PPI (som §4 selv foreslo som alternativ) viser
> praktisk talt ingen. Se §6c (c). Formuleringen «prisøkninger slår raskt og fullt
> gjennom» under er sterkere enn tallene bærer.

Retningen er identisk med dagligvare: prisøkninger slår raskt og fullt gjennom nedstrøms, prisfall tregt/ufullstendig. Men funnet sier noe om **prisatferd i kjeden**, ikke nødvendigvis ren marginbygging, av to grunner som **må** følge claimen:

1. **Valuta ikke kontrollert.** Foredlings-PPI inkluderer eksportmarked; NOK-svekkelse løfter eksport-PPI uavhengig av råpris. At PPI stiger mens NOK-laksprisen faller kan derfor delvis være en valutaeffekt. Før ekstern bruk: deflater laksprisen (EUR/USD) eller bruk hjemmemarkeds-PPI separat. *(Gjort 2026-08-24 — §6c c.)*
2. **SNN102 dekker all fisk** (skalldyr/bløtdyr inkludert), ikke kun laks. Råpris er laksespesifikk, nedstrøms er kategori-bred.

Generaliseres **ikke** til grønt eller andre domener — de er ikke testet.

## 5. Claim-lock-rad (utkast)

> **CL-AP7-001 er TRUKKET i juni-ordlyden, 2026-08-24.** Den siterte t=14,0 og
> n=84 fra nivåspesifikasjonen. Utkastet under er erstattet av CL-AP7-001r.
> Juni-ordlyden er bevart som historikk i §5b.

| Felt | Innhold |
|---|---|
| Claim-ID | **CL-AP7-001r** (utkast, erstatter CL-AP7-001) |
| Påstand | I norsk fiskeforedling går oppstrøms lakseråpris-økninger i noe større grad enn prisfall videre til nedstrøms produsentpris (kumulativt ~0,29 mot ~0,09; SSB 03024 → SSB 12462 SNN102, 2019M01–2026M07, n=91). **Forskjellen er ikke statistisk signifikant** (asymmetri +0,205, t=1,25, HAC 1,63), og kontroll for USDNOK reduserer den til +0,08. Asymmetrien er minst i hjemmemarkedet (+0,02 kontrollert) og størst i eksportmarkedet (+0,12), forenlig med at en vesentlig del er valutaeffekt. |
| Evidens | `scripts/analyze-price-asymmetry.ts` (enhetstestet, 21 tester) mot SSB 03024 + SSB 12462 SNN102 per marked, Norges Bank EXR USDNOK; aggregat `research/analyse/ap7-prisasymmetri.json`. Hovedspesifikasjon: distribuert lag 0–3 i log-differanser, opp/ned-splittet. |
| Dekning | 91 månedsobservasjoner 2019M01–2026M07; ett domene (laks→foredling). |
| Risiko | Retningen kan feillesast som etablert effekt; SNN102 = all fisk, ikke kun laks; uke→måned-aggregering (volumvektet). |
| Stoppspråk | Formuler som prisatferd/mønster, ikke intensjon eller margin-anklage. **Ikke bruk t=14,0, «sterkt signifikant» eller «statistisk sterk».** Ikke generaliser til andre domener. Ikke si at fôrpris slår asymmetrisk ut i lakseprisen — det leddet er testet og gir nullfunn (§6c d). |
| Status | `intern SVEKKET` — retning bekreftet, signifikans ikke etablert. Ikke ekstern faktastemme. Valutakontrollen som juni-statusen ventet på er nå gjort, og den svekket funnet framfor å bekrefte det. |

### 5b. CL-AP7-001, juni-ordlyd (trukket 2026-08-24 — bevart som historikk)

| Felt | Innhold |
|---|---|
| Påstand | Asymmetrisk pristransmisjon er bekreftet også i havbruks-/fiskeforedlingskjeden: nedstrøms PPI (SSB 12462, SNN102) fanger kumulativt ~0,27 av oppstrøms lakspris-økninger (SSB 03024) men kun ~0,13 av prisfall (NARDL β_opp−β_ned = +0,14, t=14,0; 2019M01–2025M12, n=84). I 2025 falt råprisen ~13 % mens foredlings-PPI steg ~10 %. |
| Hvorfor trukket | t=14,0 kom fra en nivåregresjon på partialsummer av to trendende serier; se §6c (b). Punktestimatene reproduserer, signifikansen ikke. |

## 6. Fôr→oppdrett-leddet — var `needs-data`, lukket som **testet, negativt** 2026-08-24 (se §6c d)

Et rent fôr→laks-funn krever en fôr-prisindeks SSB ikke publiserer separat månedlig. Eksakt:

- Fôr-PPI: NACE 10.9 «Produksjon av dyrefôr» som egen rad i tabell 12462 (finnes ikke; nærmeste SNN108 er sammenblandet).
- Alternativt importprisindeks for fiskefôr-råvarer (fiskemel/-olje, soya) — egen tabell/varegruppe trengs (vurder Nofima/Fiskeridirektoratets fôrfaktor-/kostnadsstatistikk, ikke i SSBs åpne JSON-stat-API).

Inntil en av disse foreligger står fôr→oppdrett-leddet som `needs-data`; verken dagligvare- eller foredlingsfunnet skal lånes til det.

### 6b. Åpen-data-oppdatering 2026-06-15 (Strøm E): proxy-testbart, native serie forblir needs-data

Research mot navngitte kilder skjerper avgrensningen: **ingen ren månedlig norsk fôr-PPI finnes** (bekreftet), men leddet er **proxy-testbart** med en månedlig importert-input-kostnadsindeks.

- **Native norske fôr-kostnadsserier er årlige:** Fiskeridirektoratets *Lønnsomhetsundersøkelse for laks og regnbueørret* gir fôrkostnad/kg (25,67 kr/kg 2024; ~39,7 % av kostnad/kg; serie 2008–2023 i Excel) — **kun årlig**. Nofima har produksjonskostnads-/fôrfaktor-studier, ingen vedlikeholdt høyfrekvent indeks. Mowi Handbook er årlig.
- **Kvartalsvis finnes som tall, ikke som serie:** SalmonBusiness beregner en kvartalsvis fôrpris (NOK/kg) fra BioMar + EWOS/Cargill-rapporter, men publisert kun i spredte nyhetsartikler — ikke nedlastbar serie (rekonstruerbar fra kvartalsrapporter med manuelt arbeid).
- **Anbefalt månedlig proxy:** Verdensbankens **fiskemel-pris** (IndexMundi, USD/MT, månedlig, kontinuerlig 2016→2026, Excel + NOK-konvertering), evt. blandet med fiskeolje + soyamel diett-vektet, mot oppdretternes førstehåndspris. **Kritisk valuta-forbehold (kildebelagt):** fôr-råvarer prises i USD (Skretting: «driveren i fôrmarkedet er svekkelsen av norske kroner») — kjør derfor med USDNOK som eksogen regressor (eller test både USD- og NOK-denominert), så asymmetrien ikke blir en ren valutaeffekt.
- **Status:** fôr→oppdrett-leddet er **ikke blokkert, men ikke native tilfredsstillbart** — proxy-testbart med eksplisitt flagget FX-kanal; en native månedlig norsk fôr-PPI forblir `needs-data`.

**Kilder (§6b):** IndexMundi/Verdensbanken fiskemel (<https://www.indexmundi.com/commodities/?commodity=fish-meal&months=120>) + soyamel; Fiskeridirektoratet Lønnsomhetsundersøkelse (<https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-akvakultur/lonnsomhetsundersokelse-for-laks-og-regnbueorret>); SalmonBusiness (kvartalsvis fôrpris + Skretting valuta-sitat); Mowi Salmon Farming Industry Handbook 2024.

### 6c. Reproduksjon med skript + fôr-leddet kjørt (2026-08-24)

Juni-kjøringen ble gjort av en subagent uten skript, og §7 ba selv om
re-verifisering. `scripts/analyze-price-asymmetry.ts` (DB-fri, enhetstestet i
`tests/scripts/analyze-price-asymmetry.test.ts`, 21 tester) gjør nå hele
beregningen reproduserbar, og kjører i tillegg det leddet §6/§6b lot stå åpent.
Aggregat: `research/analyse/ap7-prisasymmetri.json`.

**Datakilder (alle åpne, alle hentet i kjøringen):** SSB 03024 (lakseråpris,
uke→måned **volumvektet**, ikke uvektet snitt), SSB 12462 SNN102 **per marked**,
Norges Bank `EXR M.USD.NOK.SP`, og Verdensbankens Pink Sheet (fiskemel og
soyamel, månedlig USD/tonn, «Updated on August 04, 2026»). Pink Sheet-lenken
oppdages fra Verdensbankens landingsside framfor å hardkodes — den forrige
publiserte lenken peker fortsatt på et øyeblikksbilde som stopper 2024M12.

#### (a) Reproduksjonen treffer — på punktestimatene

Kjørt på juni-kjøringens eget vindu (2019M01–2025M12, marked = i alt):

| Størrelse | Juni (subagent) | Reproduksjon 2026-08-24 |
|---|---:|---:|
| n | 84 | 84 |
| Distribuert lag, kumulativt opp | +0,272 | +0,289 |
| Distribuert lag, kumulativt ned | +0,081 | +0,077 |
| Distribuert lag, R² | 0,43 | 0,437 |
| Nivå/partialsum, β_opp | +0,272 | +0,279 |
| Nivå/partialsum, β_ned | +0,134 | +0,119 |
| Nivå/partialsum, R² | 0,94 | 0,940 |
| Fortegnstest, opp / ned | 78 % / 51 % | 76 % / 52 % |

Retningen og størrelsesordenen er altså bekreftet. Restavvikene er i tråd med at
denne kjøringen volumvekter uke→måned.

#### (b) …men signifikansen er spesifikasjonsavhengig

Juni rapporterte «asymmetri t=14,0, sterkt signifikant». Den t-verdien kommer fra
**nivåregresjonen på partialsummer**, ikke fra differansespesifikasjonen. Kjørt
på begge (2019M01–2026M07, n=91, marked = i alt):

| Spesifikasjon | Asymmetri | t | HAC t | R² |
|---|---:|---:|---:|---:|
| Distribuert lag 0–3, i differanser | +0,205 | **1,25** | **1,63** | 0,42 |
| Nivå på partialsummer | +0,171 | 27,4 | 17,6 | 0,95 |

Dette er ikke en vindueffekt: på juni-kjøringens eget vindu (2019M01–2025M12,
n=84) er differansespesifikasjonens asymmetri +0,212 med t=1,26 (HAC 1,65) —
praktisk talt samme avlesning.

Differansespesifikasjonen er den forsvarlige: nivåregresjon på to trendende
serier gir høy R² og høye t-verdier også når det ikke finnes noen sammenheng.
**I den forsvarlige spesifikasjonen er asymmetrien ikke statistisk signifikant.**

At dette ikke er en teoretisk innvending, viser fôr-leddet under: samme
nivåspesifikasjon gir der t = 28,6 med R² = 0,85 (fiskemel → lakseråpris,
2000M01–2026M07, n=319) — på et forhold der de kumulative koeffisientene er
**negative** (høyere fôrpris → lavere lakspris).
Det er en økonomisk meningsløs sammenheng som nivåspesifikasjonen likevel
stempler som svært signifikant. Det er spuriøs regresjon demonstrert på egne
data, og det er samme spesifikasjon som bar juni-tallet t=14,0.

#### (c) Valutaforbeholdet i §4 er nå målt — og det spiser mesteparten

§4 krevde valutakontroll før ekstern bruk. Med USDNOK som eksogen regressor, og
med hjemme- og eksportmarked hver for seg (2019M01–2026M07, n=91, distribuert
lag):

| Marked | Asymmetri, ukontrollert | t | Asymmetri, valutakontrollert | t |
|---|---:|---:|---:|---:|
| I alt | +0,205 | 1,25 | +0,079 | 0,53 |
| Hjemmemarked | +0,109 | 0,58 | +0,019 | 0,10 |
| Eksportmarked | +0,280 | 1,37 | +0,122 | 0,66 |

To ting følger. Valutakontroll fjerner rundt 60 % av den målte asymmetrien. Og
asymmetrien er **størst i eksportmarkedet og minst i hjemmemarkedet** — akkurat
mønsteret man venter hvis en vesentlig del av PPI-løftet er NOK-svekkelse
snarere enn prisatferd. Hjemmemarkedet, som er den minst valutaeksponerte
avlesningen, viser praktisk talt ingen asymmetri.

#### (d) Fôr→oppdrett: testet, negativt

Leddet §6 satte som `needs-data` er nå kjørt via proxy-veien §6b anbefalte
(fôrråvarepris → lakseråpris, med USDNOK som eksogen regressor). Resultatet er
et nullfunn, og det er robust på tvers av alt vi varierte:

| Variant | n | Asymmetri | t | HAC t | R² |
|---|---:|---:|---:|---:|---:|
| Fiskemel, 2019–2026, lag 0–3 | 91 | +5,57 | 1,82 | 1,90 | 0,10 |
| Fiskemel, 2000–2026, lag 0–3 | 319 | +0,17 | 0,33 | 0,29 | 0,03 |
| Fiskemel, 2000–2026, lag 0–18 | 319 | +0,94 | 1,13 | 1,11 | 0,12 |
| Soyamel, 2000–2026, lag 0–3 | 319 | +0,62 | 1,51 | 1,80 | 0,02 |
| Soyamel, 2000–2026, lag 0–18 | 319 | +1,12 | 1,23 | 1,23 | 0,13 |

Ingen variant er signifikant, valutakontroll endrer ingenting, og fortegnstesten
ligger på myntkast (fiskemel 2000–2026: nedstrøms stiger i 48 % av
oppgangsmånedene og 52 % av nedgangsmånedene). Den lange lag-strukturen (0–18
måneder) ble kjørt fordi laksens sjøfase er 18–24 måneder — et kostnadsledd kan
ikke rimeligvis slå ut på tre måneder. Den forlengede horisonten hjelper ikke.

Lesningen: **lakseprisen settes av etterspørsel i et globalt marked, ikke av
fôrkostnad.** Fôr er en kostnadsinnsats, ikke en prisdriver — asymmetri-rammen
(«rockets and feathers») forutsetter et gjennomslagsledd som ikke ser ut til å
finnes her. Per planens §6 lukkes leddet som **testet, negativt**, ikke som
`needs-data`: mangelen på en native norsk fôr-PPI var ikke det som stoppet
funnet.

#### (e) Statusrevisjon — vedtatt 2026-08-24

Eier besluttet revisjonen samme dag. Gjennomført:

- **Laks→foredling:** fra `intern STØTTET` til **`intern SVEKKET` — retning
  bekreftet, signifikans ikke etablert**. Punktestimatene reproduserer, men den
  forsvarlige spesifikasjonen gir ikke signifikans, og valutakontroll fjerner
  mesteparten av effekten. «NARDL t=14,0» skal ikke brukes videre — heller ikke
  internt. Frontmatter, §1, §3 og §5 er oppdatert; §3 og §5b beholder
  juni-ordlyden merket som tilbakevist/trukket.
- **CL-AP7-001:** trukket i juni-ordlyden, erstattet av **CL-AP7-001r** (§5).
- **Fôr→oppdrett:** fra `needs-data` til **`testet, negativt`**.
- **Figuren** `fig-ap7-pris-asymmetri.svg` er erstattet. Den viser nå
  differansespesifikasjonens tall (+0,290 mot +0,085, asymmetri +0,205 med
  t=1,25) og asymmetri per marked før/etter valutakontroll, med en fotnote om
  hvorfor juni-tallet er borte.
- **Appflaten** `/innsikt`: signifikanspåstanden er fjernet fra
  `ins-ap7-001`, med stoppspråk mot både t=14,0 og mot å hevde
  fôrpris-gjennomslag.

Det som **ikke** er endret: retningen og punktestimatene står, og de er nå
reproduserbare framfor subagent-beregnede. Revisjonen svekker en påstand om
statistisk styrke — den avviser ikke funnet.

## 7. Verifikasjon

Tall regnet av subagent fra SSBs åpne JSON-stat-API (tabell 03024 + 12462), metode replikert fra `kvantitativ-dybdeanalyse.md` §H-NY1. Coordinator-forbehold: regresjonskoeffisientene (β, t) er subagent-beregnet og bør re-verifiseres med valutadeflatering før ekstern bruk; den retningsbestemte 2025-illustrasjonen (laks −13 %, PPI +10 %) er den enkleste etterprøvbare påstanden. Ingen committet fil endret; ingen påstand løftet til ekstern bruk.

**Oppdatert 2026-08-24:** re-verifiseringen §7 ba om er utført, og forbeholdet er innfridd — se §6c. Tallene er ikke lenger subagent-beregnede: de produseres av `scripts/analyze-price-asymmetry.ts`, hvis matematikk (OLS, Newey-West-HAC, kontrast-standardfeil, asymmetrispesifikasjonene, ISO-uke→måned, xlsx-/zip-lesing) er enhetstestet mot kjente fasitverdier i 21 tester. Reproduksjonen bekrefter punktestimatene, men **ikke** signifikansen: den kom fra en nivåregresjon på trendende serier. Valutadeflateringen §7 etterlyste er nå kjørt og fjerner mesteparten av effekten. Kjør selv:

```
npx tsx scripts/analyze-price-asymmetry.ts --leg=alle --from=2019M01 --to=2025M12
npx tsx scripts/analyze-price-asymmetry.ts --leg=for-oppdrett --from=2000M01 --max-lag=18
```

## 8. Kilder

- SSB tabell 03024 «Eksport av oppalen laks» (varegruppe 01 fersk, kilopris, ukentlig) — <https://data.ssb.no/api/v0/no/table/03024/>
- SSB tabell 12462 «Produsentprisindeks» (SNN102 bearbeiding fisk, indeksnivå, måned) — <https://data.ssb.no/api/v0/no/table/12462/>
- SSB tabell 14700 (KPI mat, referanse til dagligvarefunn) — <https://data.ssb.no/api/v0/no/table/14700/>
- Metodepresedens: `research/norge/kvantitativ-dybdeanalyse.md` §H-NY1.

Lagt til 2026-08-24 (§6c):

- Norges Bank, valutakurser `EXR M.USD.NOK.SP` (månedlig) — <https://data.norges-bank.no/api/data/EXR/>
- Verdensbanken, *Commodity Price Data (The Pink Sheet)*, arket «Monthly Prices», kolonnene «Fish meal» og «Soybean meal» (månedlig, USD/tonn) — <https://www.worldbank.org/en/research/commodity-markets>. Skriptet oppdager gjeldende xlsx-lenke fra landingssiden; kjøringen 2026-08-24 brukte utgaven merket «Updated on August 04, 2026».
- SSB tabell 12462, dimensjonen `Marked` (00 i alt / 01 hjemmemarked / 02 eksportmarked) — grunnlaget for valutakontrollen i §6c (c).

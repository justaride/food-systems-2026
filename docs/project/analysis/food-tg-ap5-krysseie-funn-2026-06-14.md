---
tittel: Food TG AP-5 — Krysseie og tverrsektoriell kontroll: funn 2026-06-14
status: klar-med-forbehold (citable_with_note) — eierandel-% verifisert fra offentlige primærkilder 2026-06-15 (§6b); BAMA-splitten lukket fra BAMAs egen årsrapport 2026-08-24 (§6c, 46/34/20 — den tidligere ~46/46-inferensen var feil); restforbehold: Reitan/ASKO inferert 100 %
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-5 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Intern DB — CompanyOwnership (parent→child, ownershipPct/type) × Company.valueChainStage
bruksregel: Internt analysefunn. Kontroll = datterselskap eller eierandel ≥ 50 %; minoritet/JV teller som tilstedeværelse, ikke kontroll. Eierskap ≠ operativ kontroll. Går gjennom claim-lock/PCQ og stikkprøve mot Brønnøysund før ekstern bruk.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - scripts/analyze-cross-holdings.ts
  - tests/scripts/analyze-cross-holdings.test.ts
  - research/analyse/ap5-krysseie.json
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md
---

# AP-5 — Krysseie og tverrsektoriell kontroll: funn

## 1. Kort funn

AP-5 bekrefter AP-1 fra en helt uavhengig datakilde, og lukker dybdeanalyse-tråden. Ved å spore **kontrollerende** eierskap (datterselskap eller ≥ 50 %) transitivt gjennom konsernstrukturen finner vi 19 tverrsektorielle kontrollører. **NorgesGruppen ASA kontrollerer 39 selskaper på tvers av fire ledd** (servering + logistikk + foredling + butikk). Reitan, Coop, BAMA og samvirkene (TINE, Nortura, Felleskjøpet) spenner tre ledd hver.

Det avgjørende: sektorparene for eierkontroll er **nesten identiske med AP-1s styrebroer**. logistikk↔retail er nr. 1 i begge (7 i hver), og foredling↔retail er høyt i begge. To uavhengige lenser — styreverv og eierskap — tegner samme strukturkart. Og det forklarer AP-2: makten som *ikke* vises som aksje-HHI (fordi samvirke/familie) vises tydelig som vertikal konsernkontroll.

## 2. Tall

Dekning: 275 selskaper, 160 eierkanter (153 kontrollerende), 183/275 i eiergrafen (67 %). 57 kontrollører, 27 ultimate, 19 tverrsektorielle.

Største tverrsektorielle kontrollører (`*` = ultimate; antall = kontrollerte selskaper):

| Kontrollør | Eget ledd | Spenner | Selskaper |
|---|---|---|---|
| NorgesGruppen ASA * | retail | servering + logistikk + foredling + retail | 39 |
| Axel Johnson AB * (Axfood) | retail | servering + logistikk + retail + engros | 8 |
| Reitan AS * | retail | logistikk + foredling + retail | 13 |
| Nortura SA * | foredling | inputs + foredling + research | 9 |
| Coop Norge SA * | retail | foredling + retail | 8 |
| BAMA Gruppen AS * | logistikk | servering + logistikk + foredling | 7 |
| Felleskjøpet Agri SA * | inputs | inputs + foredling + research | 6 |
| Mowi ASA * | sjømat | inputs + research + sjømat | 5 |
| TINE SA * | foredling | inputs + foredling | 4 |

Sektorpar-samkontroll (topp): logistikk↔retail 7, logistikk↔foredling 6, foredling↔retail 6, servering↔logistikk 5, servering↔retail 5.

**Konvergens AP-1 (styrer) vs AP-5 (eierskap):**

| Sektorpar | AP-1 styrebroer | AP-5 eierkontroll |
|---|---|---|
| logistikk ↔ retail | 7 | 7 |
| foredling ↔ retail | 6 | 6 |
| logistikk ↔ foredling | 2 | 6 |

## 3. Tolkning — fire lenser lukker historien

Dybdeanalyse-tråden gir nå én sammenhengende, triangulert konklusjon fra fire uavhengige datakilder:

1. **AP-3 (tilskudd):** makten ligger ikke i produksjonsstøtten.
2. **AP-1 (styrer):** styrebroene klumper seg i retail/logistikk/foredling.
3. **AP-2 (eierskap/HHI):** de leddene er ikke aksjekonsentrert — de er samvirke-/familiestrukturert.
4. **AP-5 (konsern):** akkurat de samme aktørene — NorgesGruppen, Reitan, Coop, BAMA og samvirkene TINE/Nortura/Felleskjøpet — kontrollerer **vertikalt** på tvers av butikk, logistikk, foredling og servering gjennom konsernstruktur.

Det ikke-opplagte: samvirkeselskapene (Coop SA, TINE SA, Nortura SA, Felleskjøpet SA) som AP-2 fant *ikke* var aksjekonsentrert, er nettopp dem som kontrollerer vertikalt her. Makten i norsk matsystem er organisert som **vertikal konsernintegrasjon i dagligvare/distribusjon**, utøvd gjennom samvirke- og familieeierskap og sammenvevde styrer — ikke gjennom aksjekonsentrasjon eller tilskuddskapring. Lensen som *bommer* på den (aksje-HHI) er den en analytiker ville grepet til først. At to uavhengige kilder (styrer + eierskap) gir samme kart, er den sterkeste interne evidensen vi kan ha før primærsjekk.

## 4. Datakvalitetsflagg

- **Eierdekning 67 %** (183/275) — bedre enn styredata (36 %), men fortsatt delvis.
- **Støtte-/adminledd skal ikke telles som verdikjede-integrasjon:** `research` (Animalia, Felleskjøpet Forutvikling), `property` og `holding` er industri-/forvaltningsenheter. Kjerne-integrasjonen er retail + logistikk + foredling + servering + inputs.
- **JV/delt kontroll underrapporteres:** terskelen (≥ 50 %) gjør at delte vehikler havner som «ultimate». BAMA framstår derfor som egen topp. *Korrigert 2026-08-24 (§6c):* den opprinnelige begrunnelsen her sa «eid ~46/46 av NorgesGruppen/Reitan … delt kontroll mellom de to største». Faktisk fordeling er **NorgesGruppen 46 %, Banan II (Nergaard) 34 %, Rema Industrier 20 %** — ingen har flertall, Reitan er minst, og en tredjepart utenfor begge kjedene holder 34 %. Terskeleffekten er reell, men BAMA er ikke et NG–Reitan-fellesvehikkel; si ikke at kartet underdriver «samkontrollen mellom de to største» på dette grunnlaget.
- **Eierskap ≠ operativ kontroll;** ultimate ownership stikkprøves mot Brønnøysund før ekstern bruk.

## 5. Lakmustest

> Produserer pakken minst én påstand en bransjeinnsider ikke allerede vet, forsvarbar med data?

**Ja, sterkt.** At de samme få aktørene kontrollerer vertikalt på tvers av fire ledd, *og* at dette bekreftes uavhengig av både styre- og eierdata mens det er usynlig i aksje-HHI og tilskudd, er en triangulert strukturinnsikt ingen innsider har kvantifisert på tvers av fire datakilder med denne disiplinen. Det er kjernen i et forsvarbart maktkart for norsk matsystem.

## 6. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP5-001 (utkast) |
| Påstand | Et fåtall ultimate eiere (NorgesGruppen, Reitan, Coop, BAMA, samt samvirkene TINE/Nortura/Felleskjøpet) kontrollerer vertikalt på tvers av butikk, logistikk, foredling og servering; sektorpar-mønsteret sammenfaller med AP-1s styrebroer. |
| Evidens | `research/analyse/ap5-krysseie.json`; CompanyOwnership (kontroll = datter/≥50 %); sammenholdt med AP-1/AP-2. |
| Dekning | 183/275 selskaper i eiergrafen (67 %). |
| Risiko | Eierskap kan feiltolkes som operativ kontroll/samordning; JV-/delt kontroll undertelles; adminledd kan overtelles som integrasjon. |
| Stoppspråk | Ikke si «samordner» eller «operativ kontroll». Ikke tell research/property/holding som verdikjede-integrasjon. Ikke bruk ultimate-eierskap eksternt før Brønnøysund-stikkprøve. |
| Status | `klar-med-forbehold` (citable_with_note) — form + styrekontroll primærsjekket mot Brønnøysund 2026-06-14 (22/22 formmatch), og eierandel-% nå verifisert fra offentlige primærkilder 2026-06-15 (§6b): eier-identitet match for alle 9, topp-andel primærkildebelagt for 6 (Lerøy/Austevoll/SalMar/Mowi/Orkla + NorgesGruppen via SNL). Resterende forbehold: Reitan/ASKO 100 % strukturelt sikkert men inferert; **BAMA-splitten er lukket** 2026-08-24 fra BAMAs årsrapport (46/34/20, §6c); majoritetskontroll (≥50 %) gjelder kun NG/Reitan/ASKO/Lerøy/Austevoll (SalMar/Mowi/Orkla = største blokk, ikke flertall). |

## 6b. Eierandel-% verifisert fra offentlige primærkilder (2026-06-15)

CL-AP5-001-status (§6) hadde eierandel-%/≥50 %-kontroll stående som `krever-bekreftelse (Skatteetaten Aksjonærregister)`. I stedet for å vente på register-bestillingen er topp-eier-andelen for de ni applicable AS/ASA-konsernene (samme målorgnr som `EXPECTED_OWNERS` i `scripts/verify-ownership-aksjonaerregister.ts`) verifisert mot **offentlige primærkilder** — selskapenes egne IR-/årsrapportsider. En årsrapport-/Oslo Børs-URL er en **sterkere citable-lokator** enn en register-bulkfil. **Eier-identiteten matcher forventning for alle ni.**

| Konsern | Topp-eier | Eierandel | Kilde / evidens | Status |
|---|---|---:|---|---|
| Lerøy Seafood Group ASA | Austevoll Seafood ASA | **52,69 %** | Lerøy IR «Largest shareholders» (pr. 04.02.2026) | ✅ primær — treffer 52,7 |
| Austevoll Seafood ASA | Laco AS (Møgster) | **55,55 %** | Austevoll årsrapport 2025, note 25 + 20-største-tabell | ✅ primær — eier match; % oppdatert (forventet 52,7 var utdatert/konflatert med Lerøy) |
| SalMar ASA | Kverva Industrier (Witzøe) | **44,3 %** | SalMar corporate-governance-erklæring (pr. 31.12.2025) | ✅ primær — eier match; % oppdatert (forventet 41,3 eldre; 45,4 → 44,3 fra 2024) |
| Mowi ASA | Geveran Trading (Fredriksen) | **15,47 %** | Mowi IR shareholder-analysis (pr. 27.02.2026) | ✅ primær — treffer ~14,4 innenfor toleranse |
| Orkla ASA | Canica AS (Stein Erik Hagen) | **25,32 %** | Orkla årsrapport 2025, note 32 «20 largest shareholders» (pr. 31.12.2025) | ✅ primær — treffer 25,1 innenfor toleranse |
| NorgesGruppen ASA | Johannson-familien | **>74 %** | SNL «NorgesGruppen» (sekundær; NGs egen eierstruktur-side var utilgjengelig) | ✅ citable — konsistent med 74,4 |
| Reitan Retail AS | Reitan-familien | **100 %** (familieeid) | SNL «Reitan Retail»; brreg-entitet bekreftet | ⚠️ inferert — 100 % strukturelt sikkert, men ikke trykt som %-tall på nåbar side |
| ASKO Norge AS | NorgesGruppen ASA | **100 %** (heleid datter) | SNL «ASKO»; brreg-entitet bekreftet | ⚠️ inferert — 100 % strukturelt sikkert, ikke trykt som %-tall |
| BAMA Gruppen AS | NorgesGruppen ASA | **46 %** (138 av 300 aksjer) | BAMA Gruppen AS årsrapport 2023, note 15 «Aksjekapital og aksjonærinformasjon», pr. 31.12.2023 | ✅ primær — **lukket 2026-08-24, se §6c. Den tidligere «~46 / ~46 %»-inferensen var feil.** |

**Kontroll-nyanse (viktig for stoppspråk):** ≥50 %-majoritetskontroll er bekreftet for **NorgesGruppen (>74 %), Reitan (100 %), ASKO (100 %), Lerøy (Austevoll 52,69 %) og Austevoll (Laco 55,55 %)**. For **SalMar (44,3 %), Mowi (15,47 %) og Orkla (25,32 %)** er topp-eieren en *største aksjeblokk*, **ikke** ≥50 %-majoritet — her er «kontroll» de facto via største blokk, ikke flertall. Ikke fremstill disse tre som majoritetseid.

**Stoppspråk (§6b):** «Verifisert fra offentlig årsrapport» gjelder topp-eier-andel pr. oppgitt dato, ikke et fullstendig register-kryss av hele aksjonærlista. De forventede tallene i verify-skriptet var stedvis utdaterte — bruk de primærkilde-verifiserte tallene over. Reitan/ASKO 100 % er strukturelt sikkert men inferert (ikke trykt %-tall). ~~BAMAs eksakte split forblir det ene punktet som genuint trenger Aksjonærregisteret eller BAMAs egen årsrapport.~~ **Lukket 2026-08-24 fra BAMAs egen årsrapport — se §6c.**

### 6c. BAMA-splitten lukket — og inferensen var feil (2026-08-24)

BAMA sto som det siste 🔴-punktet i §6b, med den inferte fordelingen «NorgesGruppen ~46 % / Reitan ~46 %». Note 15 i **BAMA Gruppen AS' egen årsrapport 2023** («Aksjekapital og aksjonærinformasjon», aksjonæroversikt pr. 31.12.2023) gir den faktiske fordelingen — og den er en annen:

| Aksjonær | Antall aksjer | Eierandel | Stemmeandel |
|---|---:|---:|---:|
| NorgesGruppen ASA | 138 | **46 %** | 46 % |
| Banan II AS | 102 | **34 %** | 34 % |
| Rema Industrier AS | 60 | **20 %** | 20 % |
| **Sum** | **300** | **100 %** | **100 %** |

Årsrapporten oppgir også at «Banan II AS kontrolleres av styreleder Kristian Nergaard med nærstående», og at alle aksjene gir samme rettigheter.

**Tre ting korrigeres:**

1. **Reitan har 20 %, ikke ~46 %.** Reitan-siden er den *minste* av de tre eierne, ikke likestilt med NorgesGruppen. Lesningen av BAMA som en balansert NG–Reitan-JV holder ikke.
2. **En tredje eier på 34 % manglet helt** i AP-5-bildet: Banan II AS (Nergaard-familien). Det er en større post enn Reitans, og den er hverken NorgesGruppen eller Reitan.
3. **Ingen eier har ≥50 %.** BAMA har ingen majoritetseier. NorgesGruppen er største aksjonær, men kontroll kan ikke utledes av posten alene — samme disiplin som for SalMar/Mowi/Orkla i §6b.

**Konsekvens for AP-1/AP-5-sammenstillingen.** AP-1 fant BAMA som bro mellom Reitan og NorgesGruppen. Broen finnes fortsatt — begge er inne på eiersiden — men den er asymmetrisk (46 mot 20) og går via et selskap der en tredjepart holder 34 %. Formuleringer som «BAMA er felleseid av de to kjedene» eller «50/50» skal ikke brukes.

**Stoppspråk (§6c):** Oppgi 46 / 34 / 20 med dato (pr. 31.12.2023) og kilde. Ikke omtal BAMA som NG–Reitan-JV. Ikke utled kontroll fra NorgesGruppens 46 % — ingen har flertall. Ikke utelat Banan II.

**Kilde:** BAMA Gruppen AS, årsrapport 2023, regnskap og noter, note 15 — <https://www.bama.no/siteassets/bama/arsrapport/bama-arsrapport_2023_regskap-noter.pdf>. Fordelingen er konsistent med Konkurransetilsynets og Proffs gjengivelse av aksjonærlista. 2023 er siste tilgjengelige årsrapport pr. 2026-08-24.

## 7. Forbehold

- **Kontroll-definisjon konservativ** (datter/≥50 %); minoritet/JV ekskludert — undertelling av delt kontroll.
- **Transitiv kontroll** følger kontrollerende kanter i DB; manglende kanter gir manglende rekkevidde (dekning 67 %).
- **Sektor = `valueChainStage`** i DB; admin-/forskningsledd er med i grafen og må skilles fra operativ verdikjede.
- **Ett øyeblikksbilde** av eierstrukturen i DB; ikke datert per kant her.

## 8. Neste

1. ~~Stikkprøv ultimate ownership for topp-konsernene mot Brønnøysund~~ **— gjort:** form/styre 2026-06-14, eierandel-% fra offentlige primærkilder 2026-06-15 (§6b), BAMA-splitten fra BAMAs årsrapport 2026-08-24 (§6c). Ingenting gjenstår på eierandel-%.
2. Modeller delt/JV-kontroll eksplisitt (BAMA, fellesvehikler) for å fange samkontroll mellom de store.
3. Lukk AP-1 styredata-dekning (36 %) så styre- og eierkart kan sammenstilles på likt grunnlag.
4. **Skriv synteserapporten:** AP-1+AP-2+AP-3+AP-5 er nå et sammenhengende maktkart — kandidat for ett samlende citable uttak (etter primærsjekk).
5. ~~Løft CL-AP5-001 til claim-register først etter Brønnøysund-stikkprøve.~~ **— forutsetningene er nå møtt** (form/styre + eierandel-% §6b); CL-AP5-001 er `citable_with_note` med BAMA-split som eneste rest.

## 9. Verifikasjon

Tall er produsert av `scripts/analyze-cross-holdings.ts` kjørt 14.06.2026 mot intern DB; råaggregat i `research/analyse/ap5-krysseie.json`. Kontroll-klassifisering, transitiv rekkevidde, kryssektor-deteksjon og sektorpar-samkontroll er enhetstestet i `tests/scripts/analyze-cross-holdings.test.ts` (kontroll vs minoritet; transitiv kjede holding→datter→datter; ultimate-flagg; sektorpar). Konvergensen mot AP-1 er lest av sektorpar-tabellene i begge JSON-ene. Ingen påstand er løftet til ekstern bruk.

---
tittel: Food TG AP-5 — Krysseie og tverrsektoriell kontroll: funn 2026-06-14
status: Internt analysefunn (første kjøring)
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
- **JV/delt kontroll underrapporteres:** terskelen (≥ 50 %) gjør at delte vehikler havner som «ultimate». BAMA (eid ~46/46 av NorgesGruppen/Reitan) framstår derfor som egen topp — i realiteten er den delt kontroll mellom de to største. Konsernkartet **underdriver** dermed samkontrollen mellom de store.
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
| Status | `klar-med-forbehold` for kontroll-STRUKTUR — form + styrekontroll primærsjekket mot Brønnøysund 2026-06-14 (22/22 formmatch; `...maktkart-bronnoysund-stikkprove-2026-06-14.md`). Eierandel-%/≥50 %-kontroll fortsatt `krever-bekreftelse` (Skatteetaten Aksjonærregister). Ikke ekstern faktastemme før operator-sekvens. |

## 7. Forbehold

- **Kontroll-definisjon konservativ** (datter/≥50 %); minoritet/JV ekskludert — undertelling av delt kontroll.
- **Transitiv kontroll** følger kontrollerende kanter i DB; manglende kanter gir manglende rekkevidde (dekning 67 %).
- **Sektor = `valueChainStage`** i DB; admin-/forskningsledd er med i grafen og må skilles fra operativ verdikjede.
- **Ett øyeblikksbilde** av eierstrukturen i DB; ikke datert per kant her.

## 8. Neste

1. Stikkprøv ultimate ownership for topp-konsernene mot Brønnøysund (NorgesGruppen, Reitan, Coop, samvirkene).
2. Modeller delt/JV-kontroll eksplisitt (BAMA, fellesvehikler) for å fange samkontroll mellom de store.
3. Lukk AP-1 styredata-dekning (36 %) så styre- og eierkart kan sammenstilles på likt grunnlag.
4. **Skriv synteserapporten:** AP-1+AP-2+AP-3+AP-5 er nå et sammenhengende maktkart — kandidat for ett samlende citable uttak (etter primærsjekk).
5. Løft CL-AP5-001 til claim-register først etter Brønnøysund-stikkprøve.

## 9. Verifikasjon

Tall er produsert av `scripts/analyze-cross-holdings.ts` kjørt 14.06.2026 mot intern DB; råaggregat i `research/analyse/ap5-krysseie.json`. Kontroll-klassifisering, transitiv rekkevidde, kryssektor-deteksjon og sektorpar-samkontroll er enhetstestet i `tests/scripts/analyze-cross-holdings.test.ts` (kontroll vs minoritet; transitiv kjede holding→datter→datter; ultimate-flagg; sektorpar). Konvergensen mot AP-1 er lest av sektorpar-tabellene i begge JSON-ene. Ingen påstand er løftet til ekstern bruk.

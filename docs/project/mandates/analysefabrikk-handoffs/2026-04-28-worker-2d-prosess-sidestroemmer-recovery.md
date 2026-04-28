---
tittel: Worker 2D recovery - prosess-sidestrømmer
status: Utført internt
eier: Master recovery
dato: 2026-04-28
neste_handling: Mini-verifikasjon og deretter master-merge kun av funn med tydelig kilde.
---

# Worker 2D recovery - prosess-sidestrømmer

Recovery etter manglende 2D-handoff. Dette er ikke ekstern validering. L4-/Perplexity-notater er bare brukt som kildejakt og hypotesekart; integrerbare funn under bygger på aktør-, institutt- eller prosjektkilder.

## Kort konklusjon

1. Okara fra havredrikk er den tydeligste prosess-sidestrømmen i recoveryen: Axfoundation og Chalmers Industriteknik gir konkrete svenske benchmarktall og beskriver barrierer, prosjektaktører og mulig høyere verdi.
2. Bryggerimask har en sterk prosjektkilde fra RISE/Brewed & Renewed. Kilden dokumenterer Sverige-volum, fukt-/mikrobielle barrierer, prosjektpartnere og matpilot, men ikke norsk eller nordisk total.
3. Marint restråstoff har en sterk norsk instituttkilde fra SINTEF. Den dokumenterer 2024-volum, utnyttelsesgrad og uutnyttet volum, men må holdes adskilt fra rene plantebaserte prosess-sidestrømmer.
4. Plantebaserte sidestrømmer utover okara er fortsatt for aktøravhengige til å tallfestes uten produsentdata.
5. Pilotprioritet bør være: okara eller bryggerimask som ren prosess-sidestrøm, med marint restråstoff som norsk høyverdi-benchmark og ikke nødvendigvis første TG-pilot.

## Source cards

| Recovery SRC | Foreslått canonical SRC | Kilde | Type | Bruk | Status |
|---|---|---|---|---|---|
| W2D-SRC-001 | SRC-B-024 | Axfoundation, `Over & Oat - Turning Oat Drink Residues Into New Food and Materials`, `https://www.axfoundation.se/en/projects/over-n-oat-residues` | aktør-/prosjektkilde | Svensk okara-benchmark: 0,2 liter pressrest per liter havredrikk, ca. 25 000 tonn okara årlig i Sverige, nåværende bruk til fôr, gjødsel og biogass, samt prosjektets fokusområder. | integrer nå som svensk benchmark |
| W2D-SRC-002 | SRC-B-025 | Chalmers Industriteknik, `Over & Oat`, `https://chalmersindustriteknik.se/en/project/over-oat/` | prosjekt-/forskningskilde | Supplerer okara med 0,2 kg per kg havredrikk, prosjektpartnere, finansiering og arbeid med verdikjede-/forretningsmodell. | integrer nå som prosjektkilde |
| W2D-SRC-003 | SRC-B-026 | RISE, `Brewer's spent grain as food ingredient`, `https://www.ri.se/en/food/project/brewers-spent-grain-as-food-ingredient` og RISE-nyhet 2025-03-25 | prosjekt-/instituttkilde | Bryggerimask som mat-/ingredienscase: 180 g per liter øl, ca. 80 000 tonn/år i Sverige, 70-80 % fukt og mikrobiell risiko, pilot med brød og frokostcereal. | integrer nå som svensk benchmark; norsk volum needs-primary-check |
| W2D-SRC-004 | SRC-B-027 | SINTEF, `Analyse marint restråstoff 2024`, `https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/` | forskningsrapport / institutt | Norsk sjømatrestråstoff-baseline: ca. 1,1 mill. tonn oppstått i 2024, 976 000 tonn utnyttet og 118 000 tonn uutnyttet. | integrer nå som norsk benchmark |
| W2D-SRC-005 | SRC-B-006 / SRC-B-007 | Javourez 2021 review og Falch 2026 review | sekundær | Teknologi-, sikkerhets- og høyverdiramme for waste-to-nutrition og sjømatressurser. | allerede canonical; bruk som ramme |

## Tallregister

| Tall | Definisjon | År | Geografi | Enhet | Kilde | Status |
|---|---|---:|---|---|---|---|
| 0,2 | Pressrest/okara fra havredrikkproduksjon per liter havredrikk | udatert prosjektside, lest 2026-04-28 | Sverige / havredrikkproduksjon | liter okara per liter havredrikk | W2D-SRC-001, seksjon `Did You Know...?` | citation-ready som svensk/prosjekt-benchmark |
| ca. 25 000 | Okara fra havredrikkproduksjon | udatert prosjektside, lest 2026-04-28 | Sverige | tonn okara/år | W2D-SRC-001, seksjon `Did You Know...?` | citation-ready som svensk benchmark; ikke nordisk total |
| ca. 0,2 | Okara fra havredrikkproduksjon per kg havredrikk | prosjektperiode 2023-2026 | Sverige / Over & Oat | kg okara per kg havredrikk | W2D-SRC-002, prosjektbeskrivelse | citation-ready som prosjekt-benchmark |
| 180 | Bryggerimask per liter øl | 2025 nyhet | Sverige / ølproduksjon | gram bryggerimask per liter øl | W2D-SRC-003, RISE nyhet 2025-03-25 | citation-ready som svensk benchmark |
| ca. 80 000 | Bryggerimask produsert årlig | 2025 nyhet | Sverige | tonn bryggerimask/år | W2D-SRC-003, RISE nyhet 2025-03-25 | citation-ready som svensk benchmark; ikke norsk/nordisk total |
| 70-80 % | Fuktinnhold i bryggerimask som begrenser matbruk | prosjektside lest 2026-04-28 | generisk BSG/prosjektkontekst | prosent fukt | W2D-SRC-003, seksjon `Challenges` | citation-ready som prosessbarriere |
| 30 % | Mål om innblanding i ett brød og én frokostcereal i pilot | prosjektstart 2024-12-01, 2 år | Sverige / Brewed & Renewed | prosent BSG i produkt | W2D-SRC-003, seksjon `Purpose and goals` | citation-ready som prosjektmål, ikke resultat |
| ca. 1,1 mill. | Marint restråstoff oppstått fra norsk fiskeri- og havbruksnæring | 2024 | Norge | tonn restråstoff | W2D-SRC-004, sammendrag | citation-ready som norsk benchmark |
| ca. 3,2 mill. | Tilgjengelig råstoff fra norsk fiskeri- og havbruksnæring | 2024 | Norge | tonn råstoff | W2D-SRC-004, sammendrag | citation-ready |
| 89 % / 976 000 | Utnyttet andel og mengde marint restråstoff | 2024 | Norge | prosent og tonn | W2D-SRC-004, sammendrag | citation-ready |
| ca. 118 000 | Marint restråstoff ikke utnyttet, hovedsakelig hvitfisksektor | 2024 | Norge | tonn restråstoff | W2D-SRC-004, sammendrag | citation-ready |

## Stream-vurdering

| Strøm | Recovery-status | Brukbarhet | Valideringsbehov |
|---|---|---|---|
| Havre-okara | Sterk svensk benchmark | Best kandidat for B1-hypotese, men bare som svensk tallgrunnlag før produsentdata foreligger. | Oatly/The Green Dairy/Fazer/Valio eller tilsvarende må bekrefte lokalt volum, tørrstoff, holdbarhet, pris, hygiene og nåværende avsetning. |
| Bryggerimask | Sterk svensk prosjektkilde | God kandidat ved siden av okara fordi RISE dokumenterer volum, barrierer og matpilot. | Norske/nordiske bryggerier må bekrefte volum, fukt, logistikk, dagens avsetning og matgrade-rutiner. |
| Marint restråstoff | Sterk norsk baseline | Viktig høyverdi- og sjømatbenchmark, spesielt for CL-B-009 og CL-B-021, men ikke samme type ren plantebasert batchstrøm. | Aktører som SINTEF/FHF/HBC/Biomega/Pelagia/Scanbio må validere hvilke fraksjoner som er egnet til høyverdi/mat kontra fôr/energi. |
| Plantebaserte sidestrømmer ellers | Svakt låst | Kan stå i aktørpakke, ikke canonical volumclaim. | Krever produsentdata per anlegg og strøm. |

## Claim-effekt

| Claim | Effekt | Vurdering |
|---|---|---|
| CL-B-014 | styrker og avgrenser | Okara-claimet kan nå støttes med svensk benchmark fra Axfoundation/Chalmers, men ikke med nordisk totalvolum. |
| CL-B-021 | styrker | Ren prosess-sidestrøm som første B-pilot er mer konkret, med okara og bryggerimask som primære kandidater. Konfidens bør likevel holdes lav til aktørdata finnes. |
| CL-B-009 | styrker | Både okara, bryggerimask og sjømatrestråstoff viser at prosess, sikkerhet, holdbarhet og sluttbruk er avgjørende barrierer. |
| CL-C-015 | styrker indirekte | Tallene viser hvorfor KPI-er må ha definisjon, år, geografi, enhet og kilde per strøm. |

## Røde flagg

1. Ikke bruk Perplexity-estimater for `100 000-400 000 tonn nordisk okara` uten produsent- eller markedsdata.
2. Ikke bruk feiltallet `30-50 kg okara per liter havredrikk`; Axfoundation/Chalmers peker på ca. 0,2 liter/kg per liter/kg havredrikk.
3. Ikke presenter svensk okara- eller bryggerimaskvolum som norsk eller nordisk total.
4. Ikke si at okara eller bryggerimask er pilotklar før hygiene, holdbarhet, tørrstoff, logistikk, pris og kjøper er validert.
5. Ikke bland marint restråstoff inn i plantebasert prosess-sidestrøm uten å tydelig skille fraksjon, regelverk, marked og sluttbruk.

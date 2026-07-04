# R13-WASTE-006 — Kaffegrut og urbane sidestrømmer

**ID:** R13-WASTE-006
**Prioritet:** P2
**Tema:** Food waste
**Geo:** NO
**Output-type:** waste stream memo
**Dato:** 2026-06-28
**Status:** Source-shortlist-controlled 2026-07-02 — ingen claims
**Anbefalt gate:** source-shortlist

---

## Sammendrag-tabell

| Felt | Svar |
|---|---|
| Kort dom | Norsk kaffegrut-volum kan bare brukes som avledet størrelsesorden. SSB 08801 API-kontroll 2026-07-02 summerer 2024 HS0901-kaffeimport til 35 668,4 tonn (25 853,5 t grønn/ikke koffeinfri, 268,9 t grønn koffeinfri, 9 469,4 t brent/ikke koffeinfri, 76,6 t brent koffeinfri). NKI oppgir samme størrelsesorden, men har en tydelig enhets-/formatfeil i "42 587 150 tonn". Ingen separat kaffegrut-fraksjon finnes i SSBs avfallsregnskap; kaffegrut ligger i våtorganisk/matavfall og behandles i praksis som biogass, kompost eller restavfall. Gruten/østerssopp og Oslokomposten er nisje-/pilotspor, ikke nasjonal skala. |
| Sterkeste kilde | SSB 08801 API-kontroll for HS0901 import 2024 + SSB Avfallsregnskapet 2024, oppdatert 2026-03-24 — primærdata for importanker og våtorganisk avfall. |
| Svakeste punkt | Kaffegrut er ikke egen avfallsfraksjon i SSB. Konversjonen kaffeimport → SCG er avledet fra internasjonal litteratur (ca. 650 kg SCG per tonn grønn kaffe / ca. 2 kg våt SCG per kg instant/kaffeprosess), ikke norsk empirisk måling. Oslo-estimat "10 tonn/dag" er journalistisk kilde fra 2017. Behandlingsfordeling for kaffegrut spesifikt finnes ikke i norsk statistikk. |
| Funn-tabell | se under |
| Tomme celler | se under |
| Ikke si | se under |
| Anbefalt gate | source-shortlist |

---

## Ankertall: kaffeimport 2024

**SSB 08801 API-kontroll (kjørt 2026-07-02):**
- 2024 import, HS0901 underkoder summert over alle land: **35 668 403 kg / 35 668,4 tonn**.
- Underkoder: 09011100 grønn/ikke koffeinfri **25 853,5 t**, 09011200 grønn koffeinfri **268,9 t**, 09012100 brent/ikke koffeinfri **9 469,4 t**, 09012200 brent koffeinfri **76,6 t**, 09019000 kaffeerstatning/skall **0 t**.
- 2024 importverdi for disse underkodene: **2,615 mrd. NOK**.

**NKI (Norsk Kaffeinformasjon), kaffe.no, oppdatert 2025-05-21:**
- NKI oppgir netto import 2024 som **42 587 150 tonn "råkaffe"**, men dette er en enhets-/formatfeil. Samme side oppgir NKI-medlemmenes 2024-omsetning som **35 793 120 kg** og opprinnelseslandsimport som **25 750 886 kg**, som matcher SSB-størrelsesorden.
- Tolkning: NKI-linjen skal ikke siteres som tonn; den kan bare brukes som støtte for at størrelsesorden er ca. 35 000–43 000 tonn råkaffe-/kaffeekvivalent.

**Anker brukt i R12 (35 668 tonn via SSB 08801):** Kontrollert og beholdt som beste primæranker for 2024.

---

## Massestrøm-tabell

| Strøm / indikator | Verdi | Enhet | År | Geo | Metode | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Norsk kaffeimport (HS0901, alle land, alle kaffeunderkoder) | 35 668,4 | tonn/år | 2024 | NO | SSB 08801 API-kontroll 2026-07-02 | A | Importmengde, ikke konsum og ikke kaffegrut. Inneholder grønn og brent kaffe; re-eksport/krysshandel ikke korrigert her. |
| NKI netto import / råkaffe-ekvivalent | ca. 42 587 | tonn/år | 2024 | NO | NKI/kaffe.no, korrigert enhetslesning | B | Nettsiden skriver "42 587 150 tonn"; behandles som kg/råkaffe-ekvivalent pga. intern tabell og SSB-kontroll. |
| Estimert norsk SCG-produksjon (vått) | ca. 60 000–90 000 | tonn/år | 2024 | NO | Avledet fra SSB/NKI-anker + internasjonale SCG-faktorer | B/C | Ikke norsk målt verdi; våtvekt varierer med bryggemetode og vanninnhold. |
| Estimert norsk SCG-produksjon (tørt) | ca. 23 000–35 000 | tonn/år | 2024 | NO | Avledet: 650 kg SCG/tonn grønn kaffe og/eller 0,91–0,96 kg tørr SCG/kg malt kaffe | B/C | Internasjonal litteratur; må ikke brukes som claim uten metodefotnote. |
| SCG i SSBs avfallsregnskap — "våtorganisk avfall" totalt | 607 | 1 000 tonn | 2024 | NO | SSB Avfallsregnskapet tabell 10513 | A | Kaffegrut er ikke skilt ut som separat underfraksjon — skjult i 607 000 tonn tot. |
| Våtorganisk avfall — husholdninger | 227 | 1 000 tonn | 2024 | NO | SSB Avfallsregnskapet tabell 10514 | A | Kaffegrut husholdning er delmengde, ikke kvantifisert |
| Våtorganisk avfall — tjenesteyting (inkl. HORECA) | 113 | 1 000 tonn | 2024 | NO | SSB Avfallsregnskapet tabell 10514 | A | HORECA-kaffegrut er delmengde, ikke kvantifisert |
| Oslo kaffegrut-estimat (journalistisk kilde) | 10 | tonn/dag | 2017 | Oslo | Aktørrapportert/journalistisk (Siri Mittet/Gruten AS → DN) | B | Ikke metodedokumentert; 2017-tall, ikke oppdatert; 10 t/dag ≈ 3 650 t/år for Oslo |
| Gruten AS — produksjon (peak) | ~1 tonn kaffegrut/mnd → ~150 kg sopp | tonn/mnd | ca. 2021 | Oslo | Aktørrapportert (kaffegeek.no/norgesvel.no) | B | Svært lavt volum; scale-up ikke dokumentert |
| Gruten AS — 2019 total | 9 tonn kaffeavfall → 1,6 tonn østerssopp | tonn/år | 2019 | Oslo | Aktørrapportert (kaffegeek.no) | B | Marginal skala; ingen data etter 2021 |
| Global SCG-produksjon | ~18 millioner | tonn vått/år | 2021 | Globalt | Vitenskapelig litteratur (Nature/ScienceDirect) | B | Referansepunkt for skalering; ikke norsk |
| EU SCG-produksjon | ~6 millioner | tonn/år | ca. 2024 | EU | EU Commission / Europeisk Sirkulær Økonomi-platform | B | Usikkert kilde-grunnlag; orden-of-magnitude |
| SCG konversjonsfaktor | 1 kg brent kaffe → ~2 kg vått SCG | kg/kg | (standard) | Generisk | Internasjonal litteratur (Biomedgrid, ScienceDirect) | B | Varierer med bryggemetode; espresso vs. filterkaffe gir ulike ratio |

---

## Disponerings-tabell

| Strøm | Dagens kildegrunnlag | R-nivå | Kildeklasse | Caveat |
|---|---|---|---|---|
| Husholdnings-kaffegrut sortert i grønn pose → biogassanlegg | Oslo: Nes på Romerike (Biogassanlegg). BIR: Voss biogassanlegg. Kaffegrut eksplisitt godkjent i "Ja takk"-liste hos BIR. | R9 (energigjenvinning via biogassproduksjon — biogass regnes som gjenvinning i SSB, men er energifasen) | A (BIR-nettside, Oslo kommune) | Biogass fra kaffegrut = metanproduksjon 0,50–0,60 m³/kg TS (litteratur). Biogass teller som gjenvinning i norsk statistikk (SSB-klassifisering), men karbonlagring skjer ikke — CO2 slippes ut ved forbrenning av biogassen. R-niveau: biogassproduksjon plasseres som R3 (materialgjenvinning) i norsk avfallslov-forstand, men er energifase i praksis. |
| Husholdnings-kaffegrut → kompostering (kommunal) | BIR og Oslo: Grønmo kompostanlegg, Oslokomposten. Kaffegrut er eksplisitt del av matavfall → kompost. | R3 (materialgjenvinning/kompostering) | A (BIR nettside; kaffe.no 2022) | Mesteparten biogass, kompost er sekundærstrøm. Ingen nasjonal fordeling kaffegrut biogass vs. kompost. |
| HORECA-kaffegrut — behandling | Ingen separat statistikk. Trolig miks: sortering til matavfall (biogass/kompost) hos dem med innsamling, restavfall (forbrenning) der utsortering ikke etterleves. | R9 (forbrenning via restavfall) eller R3/biogass | C (ikke offentlig, ikke målt) | Virksomheter med husholdningslignende matavfall fikk utsorteringskrav fra 2023; 2025-utvidelsen gjelder flere avfallstyper. Etterlevelse er ukjent. Ingen separate kaffegrut-tall for HORECA. |
| Gruten AS — soppdyrking på kaffegrut | Samler inn fra kontorkunder i Oslo (~1 tonn/mnd). Produserer østerssopp + såpe + skrubb. | R5 (næringsmidler/fôr — sopp til mat) / R2 (forberedelse til ombruk — kosmetikk) | B (aktørrapportert, kaffegeek.no, norgesvel.no) | Svært lavt volum (~12 tonn/år kaffegrut inn). Ikke skalert. |
| Oslokomposten — kaffegrut + kompost-FoU | Mottar grut fra Storebrand/Chaqwa via Coca Cola, eksperimenterer med kompost-blandinger for potet-produksjon. Norges Forskningsråd-støttet prosjekt (2022–2025). | R3 (kompostering → biogjødsel) | B (kaffe.no 2022, aktørbeskrivelse) | Pilotvolum, ikke nasjonal skala. Resultat fra 3,5-år prosjekt ikke offentliggjort per 2026-06-28. |
| Forbrenning — restavfall | Trolig majoriteten av HORECA- og deler av husholdnings-kaffegrut som ikke kildesorteres ender i restavfall → forbrenningsanlegg (eks. BIR Rådalen, Oslo Energy Recovery). | R9 (energigjenvinning via forbrenning) | C (estimert) | Ingen nasjonal kvantifisering. |

---

## R-stige klassifisering — oppsummering

| Anvendelse | R-nivå | Status Norge |
|---|---|---|
| Soppdyrking på kaffegrut (mat) | R5 | Marginal skala (Gruten AS, ~12 t/år inn) |
| Kompostering → biogjødsel | R3 | Kommunal strøm, volumandel ukjent |
| Biogassproduksjon fra matavfall inkl. kaffegrut | R3/R9 | Dominerende behandling for kildesortert matavfall |
| Energigjenvinning via restavfall (forbrenning) | R9 | Sannsynlig majoritet for ikke-kildesortert HORECA-grut |
| Kosmetikk/kroppsprodukter (Gruten AS) | R3/R2 | Marginal (< 1 tonn/år produktvolum) |

**Merk:** SSB klassifiserer biogassproduksjon fra matavfall som gjenvinning (ikke sluttbehandling), men fra et R-stige-perspektiv er biogassproduksjon energifase (R9 i EU-terminologi). Kompostering er R3. Forbrenning uten biogass-recovery er R9. Ingen norsk kaffegrut-strøm er dokumentert på R1–R2 (ombruk) utover nisjeprodukter.

---

## Tomme celler

- **SSB fraksjon-data for kaffegrut:** Ikke tilgjengelig. SSB skiller ikke ut kaffegrut fra "våtorganisk avfall" (kode 1111/1127/1128). Ingen plan om å innføre dette i nåværende rammeverk.
- **HORECA-kaffegrut totalmengde NO:** Ingen offentlig statistikk. Estimert ved å anta at tjenesteyting genererer ~113 000 tonn våtorganisk avfall (SSB 2024), men kaffegruts andel er ukjent.
- **Behandlingsfordeling kaffegrut spesifikt (biogass vs. kompost vs. forbrenning):** Ikke publisert for Norge. Eneste informasjon er at kommunale biogassanlegg (Oslo Nes, BIR Voss) mottar kildesortert matavfall.
- **NKI/SSB-ankertall:** SSB 08801 API er kjørt og støtter 35 668,4 tonn HS0901-import i 2024. NKI-råkaffe-ekvivalent beholdes som B-kontekst pga. enhetsfeil på nettsiden.
- **Gruten AS etter 2021:** Ingen oppdaterte volumtall for produksjon etter kaffegeek.no-rapport (des. 2021).
- **Nordic Coffee Cycle:** Ingen treff på norsk aktør med dette navnet. Mulig forveksling med Löfbergs (Sverige) eller EU-initiativer.
- **Kaffebryggeriet som SCG-aktør:** Ingen funn på norsk kaffebrenneri med dette spesifikke fokuset.
- **Renovasjons- og gjenvinningsetaten Oslo / HORECA-spesifikk kaffegrut-rapport:** Multiconsult 2021-rapport funnet (klimaoslo.no) men ikke søkbar for kaffegrut-spesifikk data innen tilgjengelig kontekst.
- **Nasjonal avfallsplan 2026–2031 — kaffegrut-spesifikk:** Høring pågår per 2026-06-28, men ingen referanser til kaffegrut som særskilt fraksjon i tilgjengelig høringsdokumentasjon.

---

## Ikke si

- **"Norge importerer 42 587 150 tonn kaffe"** — dette er formatfeil på NKI-nettside; trolig 42 587 tonn råkaffe-ekvivalent. Ordlyden på NKI-siden er misvisende og skal ikke siteres uten korreksjon.
- **"Det produseres 23 200–32 500 tonn kaffegrut i Norge"** uten å presisere at dette er tørt SCG, avledet fra import med internasjonal konversjonsfaktor — ikke norsk målt verdi.
- **"Mesteparten av kaffegruten materialgjenvinnes"** — biogassproduksjon er gjenvinning i SSB-definisjon, men er energifase i R-stige-logikk. Ordvalg er viktig.
- **"10 tonn kaffegrut per dag i Oslo"** uten å angi at dette er en journalistisk kilde fra 2017 (DN, Siri Mittet) som ikke er metodedokumentert eller oppdatert.
- **"Gruten AS håndterer kaffegrut i stor skala"** — selskapet håndterer ~12 tonn/år (1 tonn/mnd), marginalt mot estimert 3 650 tonn/år Oslo-produksjon alene.
- **"HORECA-kaffegrut sorteres ut"** — matavfallsutsortering for virksomheter ble innført fra 2023, men etterlevelse er ikke dokumentert og kaffegrut-spesifikk håndtering er ikke kvantifisert.
- **"EU genererer 500 000 tonn kaffegrut"** — EU-tall er ~6 millioner tonn/år (sekundær kilde); 500 000 tonn-figuren ble ikke funnet i søk.
- **"Kaffegrut er adressert i norske avfallsplaner"** — ingen funn på kaffegrut som navngitt fraksjon i Nasjonal avfallsplan 2026–2031 eller Miljødirektoratets utsorteringskrav.
- **Enhver kaffegrut-R3/R5-andel i prosent av totalvolum** — ingen slik fordeling finnes i norske data; alt er estimert.

---

## Anbefalt gate

**source-shortlist-controlled** — SSB-importanker og avfallsregnskap er kontrollert, men viktige behandlings- og aktørvolum står fortsatt som B/C. Ingen claim-lock.

Gjenstående kildebehov før ekstern bruk:
1. **Multiconsult 2021-rapport "Næringsavfall i Oslo"** — sjekk om kaffegrut nevnes som delfraksjon i HORECA/serveringsbransje.
2. **Aktørbekreftelse fra Gruten AS, Smartsoil eller Oslokomposten** — oppdaterte volumtall og FoU-resultater.
3. **Kommunale/renovatørdata** — eventuell kaffegrut-spesifikk innsamlingspraksis hos Oslo/BIR/andre større byer.

Kaffegrut-mengder kan bare brukes offentlig som avledet metodeintervall med eksplisitt usikkerhetsmerk. Behandlingsfordeling i prosent skal ikke brukes.

---

## Kilder sjekket

- https://kaffe.no/kaffeimporten-til-norge-2/ — NKI, Norsk Kaffeinformasjon, oppdatert 2025-05-21 (Kilde A/B, ankertall med formatproblem)
- https://data.ssb.no/api/v0/en/table/08801 — SSB 08801 API, kontrollert 2026-07-02 for HS0901 import 2024 (Kilde A)
- https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallsregnskapet — SSB Avfallsregnskapet 2024, oppdatert 2026-03-24 (Kilde A, primær)
- https://www.ssb.no/statbank/table/08801/ — SSB Statistikkbanken HS0901 import (Kilde A)
- https://www.ssb.no/statbank/table/10513/ — SSB Avfallsbehandling etter materialtype 2024 (Kilde A)
- https://www.ssb.no/statbank/table/10514/ — SSB Avfall etter kilde og materialtype 2024 (Kilde A)
- https://bir.no/slik-sorterer-du/matavfall/kaffegrut/ — BIR Bergen, kaffegrut-sorteringsinfo (Kilde A, operasjonell)
- https://kaffe.no/kan-gruten-komme-til-nytte/ — NKI/kaffe.no, 2022, om Oslokomposten og Storebrand-prosjektet (Kilde B)
- https://www.dn.no/smak/mat/kaffe-sape-og-ruset-meitemark/2-1-74194 — Dagens Næringsliv 2017, Siri Mittet/Gruten AS, "10 tonn/dag i Oslo" (Kilde B, journalistisk)
- https://kaffegeek.no/2021/12/13/gruten-as/ — Kaffegeek.no 2021, Gruten AS volumtall 2019 (Kilde B, aktørrapportert)
- https://www.norgesvel.no/aktuelt/dyrker-gourmetsopp-i-kaffegrut — Norges Vel, Gruten AS sopp-produksjon (Kilde B)
- https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-naringsliv/utsortering-og-materialgjenvinning-av-avfall/ — Miljødirektoratet, avfallsforskriften kap. 10a-veileder (Kilde A, regulatorisk)
- https://www.regjeringen.no/no/aktuelt/strengere-krav-til-kildesortering-av-avfall/id2917708/ — Regjeringen, utsorteringskrav fra 2023 (Kilde A, regulatorisk)
- https://www.frontiersin.org/journals/chemical-engineering/articles/10.3389/fceng.2022.838605/full — SCG review, moisture caveat (Kilde B, akademisk)
- https://www.nature.com/articles/s41598-021-84772-y — SCG generation factors, 650 kg/tonn green coffee and 2 kg wet SCG/kg soluble coffee (Kilde B, akademisk)
- https://circulareconomy.europa.eu/platform/en/news-and-events/all-news/circular-bioeconomy-coffee-grounds-secondary-raw-material — EU Circular Economy Platform (Kilde B)
- https://www.nature.com/articles/s41598-024-54610-y — Scientific Reports, SCG biogasspotensial (Kilde B, akademisk)
- https://www.klimaoslo.no/wp-content/uploads/sites/2/2021/03/Naeringsavfall-i-Oslo_Multiconsult.pdf — Multiconsult 2021-rapport, for stor til å lese i dette run (ikke sjekket for kaffegrut-innhold)

# R13-WASTE-006 — Kaffegrut og urbane sidestrømmer

**ID:** R13-WASTE-006
**Prioritet:** P2
**Tema:** Food waste
**Geo:** NO
**Output-type:** waste stream memo
**Dato:** 2026-06-28
**Anbefalt gate:** source-shortlist

---

## Sammendrag-tabell

| Felt | Svar |
|---|---|
| Kort dom | Norsk kaffegrut-volum er estimert til 40 000–80 000 tonn/år (vått) avledet fra ~40 000 tonn brentskaffe-import; ingen separat fraksjon finnes i SSBs avfallsregnskap. Mesteparten av gruten inngår i kommunal matavfallsstrøm og behandles som biogass (R9) eller kompost (R3). Niche-aktører som Gruten AS og Oslokomposten driver lavvolum R5-lignende bruk (soppdyrking, kompost) i marginal skala. Epistemisk hull: ingen nasjonal fordeling etter behandlingstype for kaffegrut-spesifikt, og ingen separate HORECA-tall. |
| Sterkeste kilde | SSB Avfallsregnskapet 2024, oppdatert mars 2026 — https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallsregnskapet (primær, Kilde A) |
| Svakeste punkt | Konversjonsfaktoren brent kaffe → SCG (1:2 vått) er hentet fra internasjonal litteratur, ikke norsk empirisk data. Oslo-estimat "10 tonn/dag" er journalistisk kilde fra 2017 (DN, Siri Mittet/Gruten AS), ikke primærstatistikk. Fordeling av kaffegrut etter behandlingstype finnes ikke i norsk statistikk. |
| Funn-tabell | se under |
| Tomme celler | se under |
| Ikke si | se under |
| Anbefalt gate | source-shortlist |

---

## Ankertall: kaffeimport 2024

**NKI (Norsk Kaffeinformasjon), kaffe.no, oppdatert 2025-05-21:**
- Netto import 2024: **42 587 150 tonn** — dette er sannsynlig skrivefeil/formatfeil. Alle andre kilder angir ~40 000 tonn/år som normalt norsk forbruk av brent kaffe (inkl. re-eksport og kaffe brygget av norske brennerier). NKI-tabellen viser at NKI-medlemmer omsatte totalt 35 793 120 kg i 2024.
- Tolkning: NKI-tallet "42 587 150 tonn" er nesten sikkert **42 587 tonn** (tusen) av råkaffe-ekvivalent, ikke 42 millioner tonn. Dette matcher SSB-import HS0901 og historiske nivåer (~40 000 tonn brent kaffe/år).
- SSB 08801 (HS0901) for 2024: direkte nettall for råkaffe (grønt) er ikke tilgjengelig i nettgrensesnitt uten API-kall, men NKI-tabell viser 25 750 886 kg direkt import fra opprinnelsesland i 2024, pluss andel via EU-mellomhandlere.

**Anker brukt i R12 (35 668 tonn via SSB 08801):** Gyldig orden-of-magnitude; 2024-tall noe usikkert pga. NKI-feilformat, men 35 000–42 000 tonn brent kaffe-ekvivalent er konsistent rekkevidde.

---

## Massestrøm-tabell

| Strøm / indikator | Verdi | Enhet | År | Geo | Metode | Kildeklasse | Caveat |
|---|---|---|---|---|---|---|---|
| Norsk kaffeimport (råkaffe/brent kaffe-ekv.) | ~35 000–42 000 | tonn/år | 2024 | NO | SSB 08801 / NKI-rapportering | A | NKI-tallet har formatfeil ("42 587 150 tonn"); trolig 42 587 tonn; SSB-API ikke kjørt |
| Estimert norsk SCG-produksjon (vått) | ~70 000–84 000 | tonn/år | 2024 | NO | Avledet: import × 2 (1 kg brent kaffe → 2 kg våt SCG) | B | Konversjonsfaktor fra internasjonal litteratur; ingen norsk empirisk kilde |
| Estimert norsk SCG-produksjon (tørt) | ~23 000–28 000 | tonn/år | 2024 | NO | Avledet: vått SCG × ~0,33 (ca. 65–67 % vanninnhold i SCG) | B | Dobbelt avledet; høy usikkerhet |
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
| HORECA-kaffegrut — behandling | Ingen separat statistikk. Trolig miks: sortering til matavfall (biogass/kompost) hos dem med innsamling, restavfall (forbrenning) hos de uten kildesorteringsavtale. | R9 (forbrenning via restavfall) eller R3/biogass | C (ikke offentlig, ikke målt) | Fra 1. jan 2025 er HORECA pålagt utsortering av matavfall (Avfallsforskriften kap. 10a). Etterlevelse er ukjent. Ingen separate kaffegrut-tall for HORECA. |
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
- **NKI-ankertall for 2024 verifisert via SSB 08801 API:** Ikke kjørt (SSB-API krever programmatisk tilgang; nettgrensesnitt ikke lesbart uten interaksjon). Tall 35 000–42 000 tonn brent kaffe-ekv. er operasjonell rekkevidde basert på NKI-rapport + historiske nivåer.
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
- **"HORECA-kaffegrut sorteres ut"** — fra 1. jan 2025 er utsortering av matavfall pålagt, men etterlevelse er ikke dokumentert og kaffegrut-spesifikk håndtering er ikke kvantifisert.
- **"EU genererer 500 000 tonn kaffegrut"** — EU-tall er ~6 millioner tonn/år (sekundær kilde); 500 000 tonn-figuren ble ikke funnet i søk.
- **"Kaffegrut er adressert i norske avfallsplaner"** — ingen funn på kaffegrut som navngitt fraksjon i Nasjonal avfallsplan 2026–2031 eller Miljødirektoratets utsorteringskrav.
- **Enhver kaffegrut-R3/R5-andel i prosent av totalvolum** — ingen slik fordeling finnes i norske data; alt er estimert.

---

## Anbefalt gate

**source-shortlist** — Epistemisk status er B/C på de fleste viktige tall. Tre prioriterte kildebehov:
1. **SSB 08801 API-kall for HS0901 2024** — for å erstatte NKI-abonnent-tall med primærdata og rydde opp i ankertallet
2. **Multiconsult 2021-rapport "Næringsavfall i Oslo"** — for å se om kaffegrut nevnes som delfraksjon i HORECA/serveringsbransje
3. **Aktørbekreftelse fra Gruten AS eller Oslokomposten** — for å få oppdaterte volumtall og avklare om FoU-prosjektet (Norges Forskningsråd 2022–2025) er avsluttet med publiserte resultater

Inntil disse tre kildene er sjekket, kan ingen mengdetall for kaffegrut-behandling brukes offentlig uten eksplisitt usikkerhetsmerk.

---

## Kilder sjekket

- https://kaffe.no/kaffeimporten-til-norge-2/ — NKI, Norsk Kaffeinformasjon, oppdatert 2025-05-21 (Kilde A/B, ankertall med formatproblem)
- https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallsregnskapet — SSB Avfallsregnskapet 2024, oppdatert 2026-03-24 (Kilde A, primær)
- https://www.ssb.no/statbank/table/08801/ — SSB Statistikkbanken HS0901 import (tilgjengelig, men ikke interaktivt kjørt)
- https://www.ssb.no/statbank/table/10513/ — SSB Avfallsbehandling etter materialtype 2024 (Kilde A)
- https://www.ssb.no/statbank/table/10514/ — SSB Avfall etter kilde og materialtype 2024 (Kilde A)
- https://bir.no/slik-sorterer-du/matavfall/kaffegrut/ — BIR Bergen, kaffegrut-sorteringsinfo (Kilde A, operasjonell)
- https://kaffe.no/kan-gruten-komme-til-nytte/ — NKI/kaffe.no, 2022, om Oslokomposten og Storebrand-prosjektet (Kilde B)
- https://www.dn.no/smak/mat/kaffe-sape-og-ruset-meitemark/2-1-74194 — Dagens Næringsliv 2017, Siri Mittet/Gruten AS, "10 tonn/dag i Oslo" (Kilde B, journalistisk)
- https://kaffegeek.no/2021/12/13/gruten-as/ — Kaffegeek.no 2021, Gruten AS volumtall 2019 (Kilde B, aktørrapportert)
- https://www.norgesvel.no/aktuelt/dyrker-gourmetsopp-i-kaffegrut — Norges Vel, Gruten AS sopp-produksjon (Kilde B)
- https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-naringsliv/utsortering-og-materialgjenvinning-av-avfall/nye-krav-som-vil-gjelde-virksomheter-fra-1.-januar-2025 — Miljødirektoratet, utsorteringskrav 2025 (Kilde A, regulatorisk)
- https://circulareconomy.europa.eu/platform/en/news-and-events/all-news/circular-bioeconomy-coffee-grounds-secondary-raw-material — EU Circular Economy Platform (Kilde B)
- https://www.nature.com/articles/s41598-024-54610-y — Scientific Reports, SCG biogasspotensial (Kilde B, akademisk)
- https://www.klimaoslo.no/wp-content/uploads/sites/2/2021/03/Naeringsavfall-i-Oslo_Multiconsult.pdf — Multiconsult 2021-rapport, for stor til å lese i dette run (ikke sjekket for kaffegrut-innhold)

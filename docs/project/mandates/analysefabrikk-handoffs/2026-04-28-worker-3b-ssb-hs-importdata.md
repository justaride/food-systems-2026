---
tittel: "Worker 3B - SSB/HS importdata"
status: Utført internt
eier: Worker 3B
dato: 2026-04-28
scope:
  - PCQ-A-001
  - PCQ-A-002
  - PCQ-A-004
  - PCQ-A-005
  - CL-A-020
  - CL-C-011
neste_handling: Master vurderer hvilke SSB-serier som løftes til decision memo v0.2, og sender SPC-/prepared-feed-spørsmål til SSB/Tolletaten/fôraktører.
---

# Worker 3B - SSB/HS importdata

## Metode og kort konklusjon

Lest mandatfilene i prompten og søkt lokalt etter SSB, HS, tolltariff, varenummer, soya-, SPC-, fiskemel- og fôrtermer. Deretter hentet jeg primærdata fra SSB Statistikkbanken tabell `08801: Utenrikshandel med varer, etter varenummer, import/eksport, land, statistikkvariabel og år` via API 2026-04-28. API-metadata var oppdatert 2026-02-16.

SSB-metode brukt:

- `ImpEks = 1` import.
- `ContentsCode = Mengde1` og `Verdi`.
- `Tid = 2020-2025`.
- `Land` utelatt for total Norge, fordi SSB-tabellen har elimination på land.
- `Land = all` brukt for toppland. SSBs egen definisjon sier at importland er opprinnelsesland, og at tolltariffen er 8-sifret der de 6 første sifrene er HS.
- Mengde er omregnet fra kg til tonn. Verdi er omregnet fra NOK til MNOK.

Hovedfunn:

1. SSB gir citation-ready 2020-2025-serier for soyabønner, soyabønnemel, soyaolje, soyakaker/-reststoffer, fiskemel og `fiskefor` under prepared-feed-kode.
2. SPC kan ikke låses som ren nasjonal SPC-serie fra SSB alene. `21061002` dekker proteinkonsentrater/teksturerte proteinsubstanser til fiskefôr, men er ikke soyaspesifikk og gir svært små tall. Den store `23099040`-serien for fiskefôr har opprinnelsesland som Brasil/Russland/Storbritannia og kan skjule SPC eller andre fiskefôrpreparater, men dette krever SSB/Tolletaten/fôraktør-validering.
3. Laksefôrvolum må fortsatt ikke blandes med oppdrettsfôr totalt. Fiskeridirektoratet/Sjømat Norge-tabell 43 er citation-ready for total fôromsetning i oppdrettsnæringen 2020-2024, ikke laks alene.
4. L4-estimat om samlet norsk soyaimport på 550-600 000 tonn/år bør fortsatt avvises for ekstern bruk. Bruk heller SSB-seriene per varekode og Denofa som separat actor-tall.

Kilder brukt i denne handoffen:

- SSB Statistikkbanken `08801`: `https://www.ssb.no/statbank/table/08801/` og API `https://data.ssb.no/api/v0/no/table/08801/`
- SSB `Utenrikshandel med varer`, definisjoner: `https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer`
- Denofa: `https://www.denofa.no/soya/` og `https://www.denofa.no/soya/produkter/`
- Fiskeridirektoratet: `Nøkkeltall fra norsk havbruksnæring 2024`, tabell 43
- Skretting Norway Impact Report 2024, `Use of vegetable raw materials 2024`
- EUMOFA, `Fishmeal and fish oil - 2025 Edition`

## 1. Varekodeliste

| Tema | Mulig HS/varenummer | Hva koden dekker | Hva den ikke dekker | Datakilde | Status |
|---|---|---|---|---|---|
| Soyabønner, såfrø | `12011000_2012` | Soyabønner som såfrø. | Denofa-/prosessbønner, dyrefôr eller andre soyabønner. | SSB 08801 / tolltariffbasert varenummer | reject |
| Soyabønner til dyrefôr | `12019010_2012` | Soyabønner, også knuste, til dyrefôr. | Såfrø og soyabønner ikke deklarert til dyrefôr. | SSB 08801 | citation-ready |
| Soyabønner ikke til dyrefôr og såfrø | `12019090_2012` | Soyabønner, også knuste, ikke til dyrefôr og ikke såfrø. Dette er hovedserien for norsk soyabønneimport i 2020-2025. | Sier ikke hvilken aktør som importerer; Denofa må holdes som separat actor-kilde. | SSB 08801 | citation-ready |
| Soyabønnemel | `12081010_1995`, `12081090_1995` | Soyabønnemel til dyrefôr og ikke til dyrefôr. | Oljekaker/reststoffer etter oljeutvinning, SPC og soyabønner. | SSB 08801 | citation-ready |
| Soyamel/oljekake/reststoff etter soyaolje | `23040010_1995`, `23040090_1995` | Oljekaker og andre faste reststoffer etter utvinning av soyaolje, til dyrefôr og ikke til dyrefôr. | Soyabønnemel under `120810`, SPC, soyaolje og whole beans. | SSB 08801 | citation-ready |
| Soyaolje | `15071010_1995`, `15071090_1995`, `15079010_1995`, `15079090_1995` | Rå og annen soyaolje, til dyrefôr og ikke til dyrefôr. | Soyaolje produsert i Norge fra importerte soyabønner, lecitin og olje innblandet i ferdig fôr. | SSB 08801 | citation-ready |
| Proteinkonsentrater/SPC-kandidat | `21061001_2008` (til dyrefôr, 2008-2021), `21061002_2022` (til fiskefôr), `21061003_2022` (til dyrefôr unntatt fisk), `21061009_2008` (ikke til dyrefôr) | Proteinkonsentrater og teksturerte proteinsubstanser. Fra 2022 finnes egen kode for fiskefôr. | Ikke soyaspesifikk. Kan ikke alene brukes som nasjonal SPC-serie. | SSB 08801 | needs-primary-check |
| Andre proteiner, mulig feilspor for SPC | `35040000_1988` | Peptoner og andre proteiner samt derivater i.e.n. | Ikke fiskefôrspesifikk og ikke soyaspesifikk; bør ikke brukes som SPC-proxy uten tollfaglig sjekk. | SSB 08801 | needs-primary-check |
| Prepared fish feed | `23099040_1995` | Fiskefôr, ikke til akvariefisk, uten innhold av kjøtt/slakteavfall av landdyr. | Ikke laksespesifikk, ikke ren SPC, ikke nødvendigvis ferdig fôr solgt i norsk oppdrett. Kan inkludere/importere fôrpreparater eller ingrediensblandinger. | SSB 08801 | needs-actor-validation |
| Prepared animal feed, ikke fisk | Eksempler: `23099094_2010`, `23099095_2010`, `23099096_2010`, `23099097_2010`, `23099099_2007` | Tilberedte fôrprodukter som ikke er hund/katt/fisk/fugl, med ulike melk-/olje-/kolinkloridavgrensninger. | Ikke egnet til å identifisere SPC eller akvakultur uten mer kode-/aktørsjekk. | SSB 08801 | needs-primary-check |
| Fiskemel/fiskepellets | `23012010_1995`, `23012090_1995` | Mel og pelleter av fisk, krepsdyr, bløtdyr eller andre akvatiske virvelløse dyr, utjenlig til menneskeføde, til dyrefôr og ikke til dyrefôr. | Fiskeolje, marine biprodukter til human bruk, eller faktisk fôrresept hos aktør. | SSB 08801 | citation-ready |
| Fiskeolje | `150410*`, `150420*`, `150430*` | Fiskleveroljer, andre fiskefett/-oljer og marine pattedyrfett/-oljer med underkoder. | Fiskemel og ferdig fôr. Ikke hentet som full serie i denne handoffen. | SSB 08801 | needs-primary-check |
| Oppdrettsfôr totalt | Ikke HS-importkode. Fiskeridirektoratet/Sjømat Norge tabell 43. | Omsetning av fôr i norsk oppdrettsnæring. | Ikke import, ikke råvarekode, ikke bare laksefôr. | Fiskeridirektoratet `Nøkkeltall 2024` | citation-ready |

## 2. Tallregister

SSB-rader under er import til Norge, alle opprinnelsesland samlet. `Tall` er tonn. Verdi fra SSB er lagt inn i definisjonsfeltet som MNOK.

| Tema | Tall | År | Geografi | Enhet | Definisjon | Varekode/metode | Kilde | Status |
|---|---:|---|---|---|---|---|---|---|
| Soyabønner import | 412135,1 | 2020 | Norge, alle opprinnelsesland | tonn | Importverdi 1 720,7 MNOK. Soyabønner som såfrø, til dyrefôr og ikke til dyrefôr/såfrø. | `12011000_2012` + `12019010_2012` + `12019090_2012` | SSB 08801, API 2026-04-28 | citation-ready |
| Soyabønner import | 461362,9 | 2021 | Norge, alle opprinnelsesland | tonn | Importverdi 2 619,9 MNOK. Samme definisjon. | Samme | SSB 08801 | citation-ready |
| Soyabønner import | 308431,0 | 2022 | Norge, alle opprinnelsesland | tonn | Importverdi 2 435,0 MNOK. Samme definisjon. | Samme | SSB 08801 | citation-ready |
| Soyabønner import | 362788,1 | 2023 | Norge, alle opprinnelsesland | tonn | Importverdi 2 606,9 MNOK. Samme definisjon. | Samme | SSB 08801 | citation-ready |
| Soyabønner import | 347191,0 | 2024 | Norge, alle opprinnelsesland | tonn | Importverdi 2 091,9 MNOK. Største opprinnelsesland: Brasil 242 300,7 tonn, Polen 41 344,4, Canada 31 521,3, Romania 31 447,9. | Samme | SSB 08801 | citation-ready |
| Soyabønner import | 399330,5 | 2025 | Norge, alle opprinnelsesland | tonn | Importverdi 2 420,2 MNOK. Største opprinnelsesland: Brasil 167 956,2 tonn, Canada 151 876,4, Romania 31 954,1, USA 29 616,0, Polen 17 155,3. | Samme | SSB 08801 | citation-ready |
| Soyabønnemel import | 86,7 | 2020 | Norge | tonn | Importverdi 1,3 MNOK. Soyabønnemel til dyrefôr og ikke til dyrefôr. | `12081010_1995` + `12081090_1995` | SSB 08801 | citation-ready |
| Soyabønnemel import | 62,3 | 2021 | Norge | tonn | Importverdi 0,8 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyabønnemel import | 47,3 | 2022 | Norge | tonn | Importverdi 0,8 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyabønnemel import | 44,3 | 2023 | Norge | tonn | Importverdi 1,0 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyabønnemel import | 31,2 | 2024 | Norge | tonn | Importverdi 0,5 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyabønnemel import | 34,2 | 2025 | Norge | tonn | Importverdi 0,7 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 33579,0 | 2020 | Norge | tonn | Importverdi 176,2 MNOK. Oljekaker og andre faste reststoffer etter utvinning av soyaolje. | `23040010_1995` + `23040090_1995` | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 10093,0 | 2021 | Norge | tonn | Importverdi 69,1 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 6298,5 | 2022 | Norge | tonn | Importverdi 75,8 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 1952,8 | 2023 | Norge | tonn | Importverdi 18,8 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 4813,6 | 2024 | Norge | tonn | Importverdi 45,5 MNOK. Største opprinnelsesland: Kina, Brasil, Danmark, Kasakhstan. | Samme | SSB 08801 | citation-ready |
| Soyakaker/reststoff etter soyaolje | 13376,6 | 2025 | Norge | tonn | Importverdi 90,9 MNOK. Største opprinnelsesland: Ukraina, Kina, Polen, Brasil. | Samme | SSB 08801 | citation-ready |
| Soyaolje import | 8026,8 | 2020 | Norge | tonn | Importverdi 69,4 MNOK. Rå og raffinert soyaolje, til dyrefôr og ikke til dyrefôr. | `15071010_1995` + `15071090_1995` + `15079010_1995` + `15079090_1995` | SSB 08801 | citation-ready |
| Soyaolje import | 2065,9 | 2021 | Norge | tonn | Importverdi 27,6 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyaolje import | 4776,1 | 2022 | Norge | tonn | Importverdi 69,2 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyaolje import | 838,2 | 2023 | Norge | tonn | Importverdi 17,0 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyaolje import | 951,6 | 2024 | Norge | tonn | Importverdi 15,7 MNOK. | Samme | SSB 08801 | citation-ready |
| Soyaolje import | 992,3 | 2025 | Norge | tonn | Importverdi 16,7 MNOK. | Samme | SSB 08801 | citation-ready |
| Proteinkonsentrater til dyre-/fiskefôr | 121,7 | 2020 | Norge | tonn | Importverdi 1,6 MNOK. Gammel kode for proteinkonsentrater/teksturerte proteinsubstanser til dyrefôr. Ikke soyaspesifikk. | `21061001_2008` | SSB 08801 | needs-primary-check |
| Proteinkonsentrater til dyre-/fiskefôr | 5,1 | 2021 | Norge | tonn | Importverdi 0,3 MNOK. Ikke soyaspesifikk. | `21061001_2008` | SSB 08801 | needs-primary-check |
| Proteinkonsentrater til dyre-/fiskefôr | 0,9 | 2022 | Norge | tonn | Importverdi 0,1 MNOK. Fra 2022 split mellom fiskefôr og annet dyrefôr; dette er samlet ikke-soyaspesifikk feed-proxy. | `21061002_2022` + `21061003_2022` | SSB 08801 | needs-primary-check |
| Proteinkonsentrater til dyre-/fiskefôr | 0,1 | 2023 | Norge | tonn | Importverdi under 0,1 MNOK. Ikke soyaspesifikk. | Samme | SSB 08801 | needs-primary-check |
| Proteinkonsentrater til fiskefôr | 747,9 | 2024 | Norge | tonn | Importverdi 7,6 MNOK. Nesten alt registrert med Ungarn som opprinnelsesland. Ikke ren SPC-serie. | `21061002_2022` | SSB 08801 | needs-primary-check |
| Proteinkonsentrater til fiskefôr | 1421,0 | 2025 | Norge | tonn | Importverdi 14,5 MNOK. Registrert med Ungarn som opprinnelsesland. Ikke ren SPC-serie. | `21061002_2022` | SSB 08801 | needs-primary-check |
| Prepared fish feed import | 548306,8 | 2020 | Norge | tonn | Importverdi 5 628,9 MNOK. Fiskefôr, ikke akvariefisk, uten landdyr-kjøtt/slakteavfall. | `23099040_1995` | SSB 08801 | needs-actor-validation |
| Prepared fish feed import | 519985,4 | 2021 | Norge | tonn | Importverdi 5 977,0 MNOK. | Samme | SSB 08801 | needs-actor-validation |
| Prepared fish feed import | 526998,9 | 2022 | Norge | tonn | Importverdi 8 139,3 MNOK. | Samme | SSB 08801 | needs-actor-validation |
| Prepared fish feed import | 458720,6 | 2023 | Norge | tonn | Importverdi 6 655,2 MNOK. | Samme | SSB 08801 | needs-actor-validation |
| Prepared fish feed import | 482640,9 | 2024 | Norge | tonn | Importverdi 6 819,3 MNOK. Største opprinnelsesland: Brasil 275 259,3 tonn, Storbritannia 94 052,1, Russland 49 549,4, Nederland 23 323,9. | Samme | SSB 08801 | needs-actor-validation |
| Prepared fish feed import | 501483,5 | 2025 | Norge | tonn | Importverdi 7 507,6 MNOK. Største opprinnelsesland: Brasil 197 740,2 tonn, Storbritannia 116 356,9, Russland 102 517,5, USA 22 616,0, Nederland 22 608,4. | Samme | SSB 08801 | needs-actor-validation |
| Fiskemel/fiskepellets import | 136714,3 | 2020 | Norge | tonn | Importverdi 2 216,0 MNOK. Mel og pelleter av fisk/akvatiske dyr, utjenlig til menneskeføde. | `23012010_1995` + `23012090_1995` | SSB 08801 | citation-ready |
| Fiskemel/fiskepellets import | 173549,8 | 2021 | Norge | tonn | Importverdi 2 825,5 MNOK. | Samme | SSB 08801 | citation-ready |
| Fiskemel/fiskepellets import | 221356,4 | 2022 | Norge | tonn | Importverdi 4 222,9 MNOK. | Samme | SSB 08801 | citation-ready |
| Fiskemel/fiskepellets import | 228143,4 | 2023 | Norge | tonn | Importverdi 5 067,7 MNOK. | Samme | SSB 08801 | citation-ready |
| Fiskemel/fiskepellets import | 217991,0 | 2024 | Norge | tonn | Importverdi 4 744,8 MNOK. Største opprinnelsesland: Island 81 947,1 tonn, Danmark 75 553,7, Færøyene 24 622,7, Uruguay 12 798,5, Irland 10 590,5. | Samme | SSB 08801 | citation-ready |
| Fiskemel/fiskepellets import | 245338,5 | 2025 | Norge | tonn | Importverdi 5 332,6 MNOK. Største opprinnelsesland: Danmark 82 241,3 tonn, Island 58 073,4, Peru 53 933,5, Chile 15 457,5, Uruguay 11 673,3. | Samme | SSB 08801 | citation-ready |
| Oppdrettsfôr totalt | 1989103 | 2020 | Norge | tonn | Omsetning av fôr i oppdrettsnæringen. Ikke bare laks og ikke import. | Fiskeridirektoratet/Sjømat Norge tabell 43 | SRC-A-014 / EV-A-018 | citation-ready |
| Oppdrettsfôr totalt | 2193053 | 2021 | Norge | tonn | Samme definisjon. | Samme | SRC-A-014 / EV-A-018 | citation-ready |
| Oppdrettsfôr totalt | 2179812 | 2022 | Norge | tonn | Samme definisjon. | Samme | SRC-A-014 / EV-A-018 | citation-ready |
| Oppdrettsfôr totalt | 2210779 | 2023 | Norge | tonn | Samme definisjon. | Samme | SRC-A-014 / EV-A-018 | citation-ready |
| Oppdrettsfôr totalt | 2185945 | 2024 | Norge | tonn | Samme definisjon. | Samme | SRC-A-014 / EV-A-018 | citation-ready |
| Denofa soyabønner | 450000 | udatert/årlig, nettside lest 2026-04-28 | Norge/Fredrikstad | tonn/år | Denofa oppgir ca. 450 000 tonn soyabønner årlig til anlegget. Actor-tall, ikke offisiell handelsstatistikk. | Actor-primary, hold separat fra SSB 1201-serien | SRC-A-013 / EV-A-017 | citation-ready |
| Skretting SPC-andel | 16,6 | 2024 | Skretting Norge | prosent av gjennomsnittlig fôr | Soy protein concentrate i Skretting Norges gjennomsnittlige fôrsammensetning. Ikke bransjeproxy. | Actor-primary | SRC-A-015 / EV-A-019 | citation-ready |
| Skretting vegetabilske råvarer | 71,3 | 2024 | Skretting Norge | prosent av gjennomsnittlig fôr | Vegetabilske råvarer i Skretting Norges gjennomsnittlige fôrsammensetning. Ikke bransjeproxy. | Actor-primary | SRC-A-015 / EV-A-019 | citation-ready |
| Skretting marine råvarer | 24,6 | 2024 | Skretting Norge | prosent av gjennomsnittlig fôr | Marine råvarer i Skretting Norges gjennomsnittlige fôrsammensetning. Ikke bransjeproxy. | Actor-primary | SRC-A-015 / EV-A-019 | citation-ready |
| Global fiskemelproduksjon | 5100000 | ca. siste tiår, EUMOFA 2025 | Globalt | tonn/år | EUMOFA oppgir rundt 5,1 mill. tonn/år global fiskemelproduksjon siste tiår. Kontekst, ikke norsk importserie. | EUMOFA 2025 | SRC-A-016 / EV-A-020 | citation-ready |
| Global fiskemelbruk til akvakultur | 92 | 2023 | Globalt | prosent | Andel global fiskemelbruk som gikk til akvakultur. Kontekst, ikke norsk aktørbruk. | EUMOFA 2025 | SRC-A-016 / EV-A-020 | citation-ready |

Revisjonsnote: SSB oppgir at årstall publiseres første gang i januar påfølgende år, revideres i mai påfølgende år og får endelige tall i mai året etter. Bruk 2024 og 2025 med SSB-revisjonsforbehold i decision memo.

## 3. Definisjonsrydding

Master må skille mellom disse nivåene:

**Soyabønner til Denofa:** Denofa-tallet på ca. 450 000 tonn/år er et actor-tall for råvare inn til Fredrikstad. SSBs `1201`-serie er offisiell handelsstatistikk for importerte soyabønner etter varenummer og opprinnelsesland, men sier ikke hvem som importerte varen. SSB `12019090` er hovedstrømmen, mens `12019010` til dyrefôr er liten i 2020-2025. Ikke skriv at Denofa-tallet og SSB-totalen er samme ting uten forklaring.

**Soyamel/oljekake:** `Soyamel` brukes ofte løst. SSB skiller `120810` soyabønnemel fra `230400` oljekaker og faste reststoffer etter utvinning av soyaolje. Fôr-/kraftfôrdiskusjon bør normalt sjekke `230400` og Denofas produktstrømmer, ikke bare `120810`.

**Soyaolje:** Direkte import av soyaolje ligger i `1507`. Dette fanger ikke soyaolje produsert i Norge fra Denofas importerte soyabønner, og ikke soyaolje som er innblandet i ferdig fôr.

**Soyaproteinkonsentrat/SPC:** `210610` er en proteinkonsentrat-kode, men ikke soyaspesifikk. `21061002` er fra 2022 spesifikk for fiskefôr, men volumene er for små til å forklare norsk SPC-bruk i laksefôr. Den store `23099040`-serien for fiskefôr, særlig import fra Brasil og Russland, er en bedre kandidat for hvor SPC/fiskefôrpreparater kan ligge skjult. Dette må avklares med SSB/Tolletaten og fôraktørene før master bruker et nasjonalt SPC-tall.

**Prepared animal feed:** `2309` er en bred fôrgruppe. `23099040` er fiskefôr, ikke akvariefisk, men er ikke laksespesifikk og ikke nødvendigvis ferdig fôr solgt til oppdrett. Den kan romme råvarepreparater eller blandinger. Ikke summer `23099040` med Fiskeridirektoratets fôromsetning som om de var samme målepunkt.

**Fiskemel/fiskeolje:** Fiskemel ligger i `23012010/90`. Fiskeolje ligger i `1504`-underkoder. Fiskemelimport kan brukes som SSB-serie, men faktisk bruk i norsk lakse-/oppdrettsfôr krever fôraktørdata eller ressursregnskap. EUMOFA er global/EU-kontekst, ikke norsk aktørfordeling.

**Oppdrettsfôr totalt vs laksefôr:** Fiskeridirektoratet/Sjømat Norge tabell 43 er total omsetning av fôr i oppdrettsnæringen. Dette er ikke bare laksefôr. Hvis decision memo trenger laksespesifikk formulering, må teksten enten bruke "oppdrettsfôr" eller hente artsfordelt fôrserie/aktørdata.

## 4. Claim-effekt

| Claim | Effekt | Endringsforslag | Risiko |
|---|---|---|---|
| CL-A-020 | Styrker import- og fôrbaseline, men skjerper forbehold rundt SPC. | Oppdater claimgrunnlaget med SSB 08801-seriene for `1201`, `120810`, `1507`, `230400`, `230120` og `23099040`. Formuler pilotclaimen som "oppdrettsfôr/laksefôr der arts- og aktørdata bekreftes", ikke som ren laksefôr- eller SPC-serie. Bruk Denofa, Skretting og Fiskeridirektoratet som separate evidenstyper. | Høy risiko for feil beslutning hvis soyabønner, soyamel/oljekake, SPC og prepared fish feed blandes. Særlig `23099040` kan ikke kalles SPC uten validering. |
| CL-C-011 | Styrker compliance-/sporbarhetsdimensjonen fordi HS-/varenummer kan knyttes til importstrømmer og opprinnelsesland. | Bruk SSB-kodene for å vise at soyaimport kan spores på varenummer og opprinnelsesland. For EUDR må master skille direkte soyakoder (`1201`, `120810`, `1507`, `230400`) fra SPC/prepared-feed-koder der produktscope må avklares juridisk. | Risiko for overclaim hvis decision memo sier at SPC eller ferdig fôr automatisk er omfattet på samme måte som soyabønner/soyamel/soyaolje uten EUDR-varenummer- og Norge/EØS-sjekk. |

## 5. Masteranbefaling

Kan brukes i decision memo v0.2 nå:

- SSB 08801 som offisiell metode og varekodeliste for import av soyabønner, soyabønnemel, soyaolje, soyakaker/reststoffer, fiskemel og fiskefôr/prepared-feed, med år, tonn, verdi og opprinnelsesland.
- Soyabønner: 2020-2025-serien fra SSB, med 2024 på 347 191 tonn og 2025 på 399 331 tonn. Bruk med revisjonsnote og ikke som Denofa-tall.
- Fiskemel/fiskepellets: 2020-2025-serien fra SSB, med 2025 på 245 339 tonn og tydelig `230120`-definisjon.
- Oppdrettsfôr totalt: Fiskeridirektoratet/Sjømat Norge 2020-2024, med 2 185 945 tonn i 2024.
- Denofa ca. 450 000 tonn/år, Skretting 16,6 % SPC og EUMOFA fiskemelkontekst som separate actor-/konteksttall.

Må vente eller sendes til validering:

- Nasjonalt SPC-volum. SSB `21061002` er ikke nok, og `23099040` må avklares med SSB/Tolletaten/fôraktører.
- Hvor mye av `23099040` som er SPC, ferdig fiskefôr, premiks eller andre fôrpreparater.
- Artsfordelt fôrvolum for laks/ørret hvis master vil skrive "laksefôr" uten forbehold.
- Faktisk fiskemel- og fiskeoljebruk hos Skretting, BioMar, Cargill og Mowi i 2024/2025.
- EUDR-scope for SPC og prepared-feed-koder etter norsk/EØS-praktisering.

Skal avvises/unngås:

- L4-totalen 550-600 000 tonn norsk soyaimport som ekstern påstand.
- Påstand om at Skretting-tall er bransjesnitt.
- Påstand om at SSB `23099040` er lik norsk laksefôrvolum eller ren SPC-import.
- Summering av SSB importvolum og Fiskeridirektoratets fôromsetning uten å skille import, innenlandsk produksjon, råvare, ferdig fôr og salg.

---
tittel: Food Systems 2026 — innsiktskatalog
status: Intern arbeidsliste. Ikke ekstern tekst og ikke claim-lock.
eier: Gabriel
dato: 2026-09-15
bakgrunn: docs/meetings/GABRIEL-CLAUDE - Arbeidsavklaring 15-09-26.md
---

# Innsiktskatalog

15. september 2026. Én samlet huskeliste over hovedfunnene i prosjektet, på tvers av sporene. Hver rad sier hva funnet er, hvilken status det har, hvor det står, og hvilke produkter det kan mate.

> **Status:** Intern arbeidsliste. Katalogen erstatter ikke kildefilene, Obsidian-registeret (`Food Systems Obsidian/10 Innsiktskart/Innsikter/`) eller claim-lock. Statusen er slik kildefilene og kontrollstakken oppgir den per 15.09.2026. Ingen status er hevet her, og ingen ny kildekontroll er gjort. Der kildefilene er innbyrdes uenige, står det i del 5. «Siterbar» betyr at funnet har gått gjennom siteringskjeden i prosjektet. Forbeholdet i kilden gjelder fortsatt, og ekstern bruk krever redaksjonell kontroll og kildepolicy.
>
> **Laget slik:** Fire gjennomganger av statusfelt, rettelser og nyere commits i sporene marked og makt, sirkularitet og cases, beredskap og bondeøkonomi, og hvitbok og innsiktsspor. Kompetansesporet er hentet fra R9. Statusene for siteringskjeden, N11, AP-1, AP-7, AP-6, hvitboka og innhentingen er stikkprøvet i kildene.

## 1. Slik leses katalogen

| Status | Betyr |
|---|---|
| **Siterbar** | Godkjent i siteringskjeden (`citable_external`, acceptance-test eller merket siterbar). |
| **Siterbar med forbehold** | Godkjent med et forbehold som må følge med (`citable_with_note`). |
| **Kontrollert internt** | Kildesjekket eller triangulert, men ikke godkjent for ekstern bruk. |
| **Intern syntese** | Tolkning, hypotese eller uttrekk som ikke er kildesjekket. |
| **Blokkert** | Venter på dataeier, aktør, dokument eller beslutning. |
| **Strøket / nullfunn** | Testet og ikke holdbart, eller trukket. Skal ikke brukes som funn. |
| **Uklar** | Kildefilen oppgir ingen status. |

**Brukes i:** `S` = NordForsk-søknad, `H` = hvitbok, `P` = plattform og kart, `V1`–`V10` = rapportvinkler (se del 6).

## 2. Gjeldende innganger per spor

| Spor | Start her | Merk |
|---|---|---|
| Marked, pris og makt | `docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md` §9 og august-seksjonene i hvert AP-notat | Siteringskjeden styres av `src/lib/citations/citable-acceptance.ts`. Det genererte `research/CITABLE-ACCEPTANCE-TESTS.md` henger etter. |
| Sirkularitet, cases og import | `docs/project/analysis/case-avsjekk/README.md`, `food-tg-innsiktssyntese-2026-06-12.md`, `desk-research-logg-dro-0906-2026-06-12.md` | Overclaim på tvers: `food-tg-dybdeaudit-jt-fokusfelt-2026-06-18.md` §6 |
| Sirkulære konkurser | `research/external/r13/R13-INNO-004-failure-survival-ledger.md` | Ingen samlet syntese |
| Beredskap (korn, fôr, næringsstoffer) | `docs/project/status/followup-2026-09-09/README.md` og `docs/project/analysis/source-review-beredskap-2026-09-09/round-002/` | Gap-studien og QA-rapporten fra september er historiske |
| Kompetanse og beredskap | `research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md` | 707 kontrollerte påstander |
| Systemmodell og bondeøkonomi | `food-tg-systemmodell-integrert-2026-06-18.md`, `food-tg-objektivfunksjon-VEDTAK-2026-06-18.md`, `research/external/r6/DRO-R6-INDEX-2026-06-18.md` | |
| Hvitbok | `research/whitepaper/food-systems-2026-synthesis-v2.md` | Draft-v1 og section 7 er legacy |
| Innsiktssporet | `INNSIKT-SPOR/RUNDE-2-START-HER.md`, deretter `SYNTESE.md` | Provisorisk |
| Innhenting og oppdagelseskø | `research/innhenting-2026-08-05/START-HER.md` og `RAPPORT-KO.md` | |
| Kart | `public/data/food-systems/DATA-SOURCES.md` | Registerlagene er ikke verifisert |

## 3. Katalog

Tall står slik kildene oppgir dem. Stier er repo-relative. `docs/project/analysis/` er forkortet til `analysis/`.

### 3.1 Marked, pris og makt (MA)

| ID | Funn | Status | Kilde | Brukes i | Merk |
|---|---|---|---|---|---|
| MA-01 | Omsetnings-HHI i norsk dagligvare er 3 327, og de tre største har 96,6 % (2024). | Siterbar med forbehold (CA-004) | `analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md` §11 | H, V4 | HHI er en indeks og CR3 en andel. Ikke bruk den eldre HHI 3 445. |
| MA-02 | Tre kjeder har 93,4 % av 3 849 butikker. | Intern syntese | Obsidian I01 | H | Andel av butikker, ikke omsetning. I11 blander seriene. |
| MA-03 | Finlands 30 %-regel står i konkurranseloven § 4a. | Siterbar (CA-005) | Obsidian I13 og I20 | H, V4 | Står ikke i Food Market Act. |
| MA-04 | Konsentrasjonen topper i foredling (meieri, egg, rødt kjøtt), ikke i dagligvare. Sjømat er minst konsentrert. | Siterbar med forbehold (CA-013) | `analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md`; `analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md` | S, H, V4 | Rekkefølgen er robust, punktverdiene usikre. Ulike referanseår. |
| MA-05 | Logistikk har HHI 3 697 (Menon 2023), og distribusjonen ligger inne i de tre kjedene. | Siterbar med forbehold | kryssnode-notatet §12 | S, V4 | Ingen egen acceptance-test. |
| MA-06 | Presise markedsandeler i kraftfôr, oppdrettsfôr og foodservice. | Blokkert | kryssnode-notatet §12; arbeidsplanen §9 | – | Ikke tilgjengelig i åpne kilder. Lederandelen i foodservice er omstridt. |
| MA-07 | Få konsern og samvirker kontrollerer på tvers av butikk, logistikk og foredling. 19 tverrsektorielle kontrollører; NorgesGruppen kontrollerer 39 selskaper. | Siterbar med forbehold (CA-016) | `analysis/food-tg-ap5-krysseie-funn-2026-06-14.md`; `analysis/food-tg-maktkart-syntese-2026-06-14.md` | S, H, V4 | Kontroll betyr struktur, ikke atferd. Eiergrafen dekker 67 %. |
| MA-08 | Styrebroer mellom sektorer: 32 personer med verv i flere selskaper, 11 på tvers av sektorer. | Blokkert (CA-015) | `analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md`; Obsidian I27 | V4 | Personnavn gjør funnet sensitivt. Snapshot fra 14.06. |
| MA-09 | BAMA eies av NorgesGruppen 46 %, Banan II 34 % og Rema Industrier 20 % (årsrapport 2023). | Siterbar | AP-5-notatet §6c | V4 | Overstyrer «delt NG/Reitan» i maktkart-syntesen. |
| MA-10 | Produksjonstilskudd 2024 var om lag 18,6 mrd. kr, med Gini 0,52–0,55. Makten ligger ikke i tilskuddene. | Siterbar med forbehold (CA-014) | `analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md` | H, V4 | Totalen 10,94 mrd. var en skriptfeil. |
| MA-11 | Sjøbasert havbruk: de fire største har 57 % av tillatt biomasse, HHI om lag 929. | Siterbar med forbehold | `analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md` | H | Biomasse er ikke slaktevolum. CA-017 mangler i det genererte dokumentet. |
| MA-12 | Laks til foredling: prisøkninger går oftere videre enn prisfall (t = 1,25), og valutakontroll fjerner om lag 60 % av effekten. | Kontrollert internt (svekket) | `analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md` §6c | – | Den opprinnelige juni-versjonen er strøket (se MA-S2). |
| MA-13 | Konkurransetilsynet ila kjedene om lag 4,9 mrd. kr i gebyr for utveksling av prisinformasjon 2011–2018. | Siterbar (maskinelt verifisert) | `INNSIKT-SPOR/ANALYSE-makt_eierskap.md`; `research/innhenting-2026-08-05/verifisering/` | V4 | Vedtaket er påklaget. Tidskritisk. |
| MA-14 | Prisdynamikk: asymmetrisk pristransmisjon og en økende juli-effekt. | Intern syntese | Obsidian I06 og I09 | – | Ikke testet på nytt med skript. AP-7 viste risikoen for falsk signifikans. |
| MA-15 | Alle fire nordiske land har HHI over 2 500, men landene kan ikke rangeres før dataene er harmonisert. | Intern syntese | Obsidian I10 og I11 | H | I11 («Norge høyest») motsier den rettede I10. |
| MA-16 | Dagligvaretilsynet er foreslått nedlagt. | Uklar | Obsidian I21; `research/analyse/governance-arkitektur-nordisk.md` | – | Tidskritisk. Må sjekkes mot dagens status. |
| MA-17 | Verdifangst per tonn er høyere i sjømat enn i landbruk, og marginene i dagligvare er lave. | Intern syntese | `analysis/food-tg-ap4-ap8-partial-funn-2026-06-14.md` | – | Marginene er andres analyse, gjengitt. |

### 3.2 Sirkularitet, cases og import (SI)

| ID | Funn | Status | Kilde | Brukes i | Merk |
|---|---|---|---|---|---|
| SI-01 | Norsk marint restråstoff er 89 % utnyttet, men mest til fôr og biogass. Bare en liten del går til humant konsum. | Kontrollert internt | `analysis/food-tg-innsiktssyntese-2026-06-12.md` mønster 1; `analysis/case-avsjekk/avsjekk-06-*` | H, V1 | Humant konsum er ~15 % i syntesen og ~7 % i dybdeauditen. Trolig ulik nevner, se del 5. |
| SI-02 | Skottland: sorterte biprodukter betales 3–7 ganger mer enn blandede, og nesten alt går gjennom to anlegg. | Kontrollert internt | `analysis/desk-research-logg-dro-0906-2026-06-12.md` kap. 2 | V1 | Data fra en survey i 2019. Må merkes med år. |
| SI-03 | Island: biproduktvolumet har falt siden 2013, mens verdien har steget. | Intern syntese | innsiktssyntesen mønster 1 | V1 | Uttrekk som ikke er validert. |
| SI-04 | Valio: et styrevedtak om soyaforbud (2018) og et kontrollapparat endret fôret for om lag 80 % av finsk melk. Teknologien fantes fra før. | Kontrollert internt | `analysis/drr-0906-innholdsanalyse-2026-06-12.md`; desk-loggen kap. 5; `analysis/case-avsjekk/avsjekk-03-*` | H, V5 | «Importfritt fôr» er motbevist. Fôrkurven venter på aktørdata. |
| SI-05 | Soyafritt fôr flytter importavhengigheten, men fjerner den ikke. Finland og Norge importerer omtrent like mye rapsmel, og Norge presser i tillegg importerte soyabønner innenlands. | Intern syntese | innsiktssyntesen mønster 3 | S, H, V2 | Tallene må trekkes på nytt med autorisasjon og få forbehold om varekodene før ekstern bruk. |
| SI-06 | Kaffe: Brasils andel av norsk råkaffeimport har økt, prisen steg kraftig fra 2024 til 2025, og Brasil er «standard risk» under EUDR. | Kontrollert internt | desk-loggen kap. 3; `analysis/case-avsjekk/avsjekk-01-kaffe-brasil-2026-06-12.md` | V6 | Prisøkningen er avledet, ikke et kildetall. Aldri «lavrisiko». |
| SI-07 | EUDR er ikke innlemmet i norsk rett (Landbruksdirektoratet, 05.05.2026). | Kontrollert internt | avsjekk-01 #4; dybdeauditen §6.1 | V6 | Tidskritisk. |
| SI-08 | Kakaobønner og -skall faller utenfor EØS-gjennomføringen av EUDR, mens videreforedlede varer omfattes. Plikten ligger hos første ledd i EU fra 30.12.2026. | Kontrollert internt | `analysis/case-avsjekk/avsjekk-02-kakao-elfenbenskysten-2026-06-12.md` #6–7 | V6 | Tidskritisk. En norsk vinkel få andre formidler. |
| SI-09 | Norden importerer ikke kakao direkte fra Elfenbenskysten; eksponeringen ligger i EU-leddet. | Kontrollert internt (nullfunn om direkteimport) | avsjekk-02 #1 og #3 | V6 | Volumet via EU er et internt arbeidstall. |
| SI-10 | Relasjonsdokumenter for Brasil-MOU, LEAD Ivory Coast og Fuglen- og NKI-roller finnes ikke i åpne kilder. | Blokkert (aktørgate) | `analysis/drr-0906-innholdsanalyse-2026-06-12.md`; avsjekk-01 og -02 | – | Websøk løser det ikke. Venter på intern dokumentask. |
| SI-11 | Regjeringen la bort forbudet mot ulike innkjøpsbetingelser 03.10.2025, og Konkurransetilsynet håndhever god handelsskikk fra 30.04.2026. | Kontrollert internt | `research/external/spor1-uttak-2026-06-12/uttak-06-*`; innsiktssyntesen, korreksjon 1–2 | H, V4 | Eldre filer sier «høringer pågår» og 01.05. |
| SI-12 | Sirkulære løsninger strander på koblingen mellom aktører: spillvarme uten mottaker og nye produsenter uten kanal til markedet. | Intern syntese | innsiktssyntesen mønster 4 | V3 | Den mest handlingsrettede innsikten, men svakt dokumentert. |
| SI-13 | Spillvarme: Hima er i drift, Frövi leverer til tomatproduksjon, og Polar DC har varme uten mottaker. | Intern syntese | `analysis/drr-0906-innholdsanalyse-2026-06-12.md`; `analysis/case-avsjekk/avsjekk-05-*` | V3 | Tallene er ikke selvstendig verifisert. |
| SI-14 | Wiig-piloten er ikke dokumentert i drift. | Blokkert (innsynskrav) | desk-loggen kap. 6 | V3 | Juni-nyheten gjaldt et annet anlegg (Norway 1). |
| SI-15 | Materialflyt-Sankey viser registrerte strømmer i kilder, ikke tonn eller verdi. | Intern syntese | `docs/meetings/FOOD-UTTAK-2JUNI-MATERIALFLYT-2026-06-08.md` | P | Faglig validering er en forutsetning for ekstern bruk. |
| SI-16 | Fem sirkulære aktører har signal om konkurs eller avvikling (blant andre Mycorena, Rest, Enorm), mens flere andre er aktive. Konkurs betyr ikke at teknologien feilet. | Kontrollert internt (kildeshortlist) | `research/external/r13/R13-INNO-004-failure-survival-ledger.md` | V10 | Ingen claim-lock. Faktamotstrid om orgnr og datoer, se del 5. |
| SI-17 | Billund Aquaculture hadde store tap i 2022 og gikk konkurs i 2024. | Kontrollert internt (maskinelt verifisert) | `research/innhenting-2026-08-05/RAPPORT-B1_sirk_konk_b.md` | V10 | Konkursdatoen varierer mellom kildene. |
| SI-18 | ASKO Servering har om lag 70 % av storhusholdningsmarkedet. | Intern syntese | `research/analyse/horeca-maktkonsentrasjon-nordisk.md` | V4 | Bygger bare på aktørens eget nettsted (dybdeauditen §6.7). |
| SI-19 | Kjedenes eiendomsselskaper har minst 35,2 mrd. kr i eiendeler. | Uklar | `research/analyse/eiendomsmodell-nye-insights.md` | V4 | «Under markedsverdi» er en tolkning. |

### 3.3 Beredskap, systemmodell og bondeøkonomi (BE)

`SRB/` = `docs/project/analysis/source-review-beredskap-2026-09-09/`, `FU/` = `docs/project/status/followup-2026-09-09/`.

| ID | Funn | Status | Kilde | Brukes i | Merk |
|---|---|---|---|---|---|
| BE-01 | NordForsk-utlysningen har frist 2.12.2026 og inntil 15 MNOK per prosjekt. Gap-studien peker på kritisk infrastruktur (tema 2) som mulig hovedretning. | Kontrollert internt (temavalget er prosjektets vurdering) | `analysis/matsikkerhet-beredskap-plattform-gap-studie-2026-09-02.md`; `analysis/matsikkerhet-beredskap-kvalitetssikring-2026-09-07.md` §4 | S | Temaet er ikke valgt. Beslutning for Gabriel og Jan Thomas. |
| BE-02 | Plattformen kan ikke bære påstander om faktisk beredskapskapasitet (lagerdøgn, møller, energi, transport). | Intern syntese | gap-studien §1; `SRB/round-002/README.md` | S, H | At et funn mangler, betyr ikke at noe ikke måles. |
| BE-03 | Norsk kornlager: 30 000 tonn mathvete ved utgangen av 2025 og mål om 82 500 tonn innen 2029 via kontrakter. Et forslag om seks måneders lager ble forkastet i Stortinget 05.06.2026. | Kontrollert internt (KI-kontrollert) | `analysis/matsikkerhet-beredskap-kunnskapsgrunnlag-2026-09-07.md`; kvalitetssikringen QA-03; `SRB/round-002/WHITEPAPER-REVISJON.md` | S, H | Mål, kontrakt og beholdning må holdes adskilt. Register for september 2026 mangler. |
| BE-04 | Selvforsyningstall er metodefølsomme: sammenlignbar metode, nasjonal metode og fôrkorrigert andel gir svært ulike tall. | Kontrollert internt | kvalitetssikringen QA-06; `INNSIKT-SPOR/ANALYSE-beredskap_import.md`; hvitbok v2 §11 | H, V2 | «Dekningsgrad 39 %» er sperret. Obsidian I15 («44 %») er intern. |
| BE-05 | Finland hadde kornreserve for om lag ni måneder i 2023. Sverige bygger opp lager 2026–2028. | Kontrollert internt | kvalitetssikringen QA-04 og QA-05 | S, H | Historiske tall, ikke 2026. |
| BE-06 | Brasil sto for 69,8 % av norsk soyabønneimport i 2024; foreløpig andel for 2025 er 42,1 %. | Intern syntese | `INNSIKT-SPOR/ANALYSE-beredskap_import.md` §3; systemmodellen N1 | S, V2 | 2025-tallet er foreløpig. |
| BE-07 | Påstanden om Islands importavhengighet har fått en lesbar originalkilde (Rit LbhÍ 139, 2021), men nevner og år er ikke rekonstruert. | Kontrollert internt | `analysis/perplexity-uttak-kvalitetssikring-2026-09-07.md`; QA-07 | H | Nødlagerrapportene er utilgjengelige. |
| BE-08 | Aass oppgir om lag 7,7–7,9 millioner liter mask til dyrefôr per år (2023–2025). | Kontrollert internt (selvrapportert) | perplexity-uttaket; `SRB/round-002/WHITEPAPER-REVISJON.md` | H | Tørrstoff og rasjon venter på dataeier. |
| BE-09 | Alle 127 observasjoner i beredskapsgjennomgangen er vurdert som støttet med forbehold. | Kontrollert internt (KI, uten menneskelig review) | `FU/README.md` | H | Ikke klar for ekstern bruk. |
| BE-10 | Den nordiske erklæringen om forsyningssikkerhet (2.9.2026) er ikke bindende og dokumenterer verken matvolum eller leveranserett. | Kontrollert internt | `SRB/ARBEIDSMODELL.md`; R9 #10 | S, H | Første fellesrapport kommer i 2027. |
| BE-11 | Furuset-caset (korn til mølle til mat, 72 timer): leverbar mengde er ukjent, og mengdefeltene er tomme. | Blokkert (venter på dataeier) | `SRB/round-006/README.md`; `FU/KILDE-OG-DATAEIERBEHOV.md` B03 | S | Sensitivt: navngitt virksomhet. Ingen kontakt er tatt. |
| BE-12 | Kvalitet på bulkmel og nasjonal kapasitetskartlegging (rapportfrist 15.03.2027). | Blokkert | `FU/KILDE-OG-DATAEIERBEHOV.md` B01, B02, B04, B09 | S | Tidskritisk. |
| BE-13 | Hveteproduksjonen i 2018 lå langt under snittet for 2015–2017 i Norge, Sverige, Danmark og Finland. | Kontrollert internt (egne beregninger) | `SRB/round-004/README.md` | H | Ikke klimakausalt. Seriene er ikke harmonisert. |
| BE-14 | Lager av gjenvunnet fosfor og kontinuitet i institusjonsmåltider under avbrudd er ikke dokumentert. | Blokkert | `FU/KILDE-OG-DATAEIERBEHOV.md` B11 og B12; `SRB/round-003/README.md` | H, V8 | |
| BE-15 | Fem kandidatkort i hvitbokutkastet (korn, fôr, næringsstoffer, måltider, nordisk bistand) mangler dokumentert effekt og partnerforankring. | Intern syntese | `SRB/WHITEPAPER-BEREDSKAP-ARBEIDSUTKAST.md`; `SRB/round-002/WHITEPAPER-REVISJON.md` | S, H | Ikke vedtatt retning. |
| BE-16 | Systemmodellen: fem låsesløyfer forklarer hvorfor systemet er stabilt, blant annet at de som styrer importen, har minst grunn til å endre den. Etterspørsel og helse er blindsoner. | Intern syntese (hypoteser) | `analysis/food-tg-systemmodell-integrert-2026-06-18.md` | S, H | Tallene i nodene er ikke rekontrollert mot QA-en i september. |
| BE-17 | Objektivfunksjonen: resiliens er hovedmål, sirkularitet delmål og bondeøkonomi åpnet som blindsone (vedtatt 18.06.2026). | Vedtak (internt) | `analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md` | S, H | Styrer prioritering. Ikke et funn. |
| BE-18 | Bondemargin (N11): kostnadsindeksen lå 5–7 prosentpoeng over inntektsindeksen 2017–2023, og andelen markedsinntekt har falt. | Siterbar | `research/external/r6/DRO-R6-INDEX-2026-06-18.md` | H, V9 | Normalisert kalkyle, ikke driftsregnskap. Ulike inntektsmål må ikke blandes; se merknaden i R6- og R12-filene (15.09.2026). |
| BE-19 | Gjødselsjokket 2021–2023 og et realfall i inntekt per årsverk i 2023. Laveste driftsformer ligger langt under sammenligningslønn. | Siterbar | samme | H, V9 | BFJ har senere justert 2023-tallet. |
| BE-20 | Matørken: få butikker og lokale monopoler i små kommuner, og lavinntektsfamilier bruker større del av inntekten på mat. | Uklar | `research/analyse/food-desert-saarbarhet.md`; `research/analyse/food-desert-innkjop-nye-insights.md` | – | Sekundærkilder uten kontroll. Forbeholdsnotat om HHI, 33 % og matfattigdomsraden er lagt inn i begge filene (15.09.2026). |

### 3.4 Kompetanse og beredskap (KO)

Kilde for alle rader: `research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md`, oppgitt som `R9 #` (hovedinnsikt). Funnene er kildekontrollert, mens tolkningene merket «Sammenstilling:» i R9 er intern syntese.

| ID | Funn | Status | Kilde | Brukes i | Merk |
|---|---|---|---|---|---|
| KO-01 | Kompetanse er dokumentert som mekanisme og krav, nesten aldri som effekt. | Kontrollert internt | R9 #1 | S, H, V7 | Fraværet er ikke motbevist. |
| KO-02 | Mange hull er bygget inn i statistikken, som teller varer, virksomheter og tjenestemottakere, ikke funksjoner i en krise. | Kontrollert internt | R9 #2 | S, V7 | |
| KO-03 | Myndighetene beskriver kritiske funksjoner, ikke kritiske personer eller terskler for bemanning. | Kontrollert internt | R9 #3 | S, V7 | Kjernespørsmål i en tema 2-logikk. |
| KO-04 | Veterinærvakt: krav om bemanning finnes, men vakter sto ubemannet på Island i 2026. Mangelen er knyttet til yrker og steder. | Kontrollert internt | R9 #4 | V7 | Industritallene er selvrapportert. |
| KO-05 | Kompetansen endrer form og flytter oftere enn den er dokumentert tapt. | Kontrollert internt (delvis) | R9 #5 | H, V7 | Tap bygger på intervjuer og få informanter. |
| KO-06 | Krav om kompetanse retter seg mot virksomheten (planer, opplæring, øving), ikke mot personen. | Kontrollert internt | R9 #6 | S, V5, V7 | |
| KO-07 | Operativ respons fungerer bedre enn strategisk samordning på tvers av sektorer (revisjoner i fire land). | Kontrollert internt | R9 #7 | S, H, V7 | |
| KO-08 | Øvelser gir mye aktivitet og lite evaluering, og rapportene skrives ofte av arrangøren. | Kontrollert internt | R9 #8 | V7 | |
| KO-09 | Forskning når beslutninger som omtale; ett svensk tilfelle der en utredning ble til lov (nivå 4). | Kontrollert internt | R9 #9 | H | Svarer delvis på juni-spørsmålet om hvordan forskning blir til praksis. |
| KO-10 | I nordiske og europeiske tekster står kompetanse som ambisjon, ikke forpliktelse. | Kontrollert internt | R9 #10 | H | |
| KO-11 | Mye i nordisk matberedskap er nytt i 2024–2026, så lite kan evalueres ennå. | Kontrollert internt | R9 #11 | S, H | |
| KO-12 | For de mest sårbare flytter beredskapen fra husholdningen til kommunens tjenester, og der er målingen svakest. | Kontrollert internt | R9 #12 | V8 | |
| KO-13 | Husholdningene har oftere mat enn en måte å lage den på. | Kontrollert internt (selvrapportert) | R9 #13 | H | |
| KO-14 | De mest konsentrerte og digitale leddene (transport, grossist, betaling, IT) er dårligst belyst. | Kontrollert internt | R9 #14 | S, V7 | Kobler kompetanse til maktkartet (MA-04, MA-07). |

### 3.5 Hvitbok, innsiktsspor og plattform (HV)

| ID | Funn | Status | Kilde | Brukes i | Merk |
|---|---|---|---|---|---|
| HV-01 | Gjeldende hvitbok er `synthesis-v2`. Hovedbudskapet er at prosjektet har et kontrollert kart over struktur, avhengigheter og kunnskapshull, og at det som gjenstår er menneskelig validering og eierskap. | Intern syntese til godkjenning | `research/whitepaper/food-systems-2026-synthesis-v2.md`; `research/whitepaper/executive-brief.md` | H | `ekstern_sitering: false`. Påstander merket [I] eller [H] skal ikke brukes utad. |
| HV-02 | Ekstern publisering av hvitboka er blokkert av seks menneskeporter (blant annet hovedfortelling, nordisk validering, intervjuer og juss). | Blokkert | hvitbok v2 §15 | H | Intervjuene er ikke gjennomført. |
| HV-03 | Innsiktssporet runde 2 strøk 93 tall fra runde 1 som manglet ekstern primærkilde. | Strøket | `INNSIKT-SPOR/SYNTESE.md`; `INNSIKT-SPOR/RUNDE-2-START-HER.md` | – | Må stå tydelig før noe fra sporet brukes. |
| HV-04 | Innsiktssporet (118 kjernekilder, 11 feltanalyser) er lest fra primærkilder med lokator, men er provisorisk. | Intern syntese | `INNSIKT-SPOR/SYNTESE.md`; `INNSIKT-SPOR/ANALYSE-*.md` | H | Ikke gjennom claim-kontroll. |
| HV-05 | Offentlig matinnkjøp: det finnes ingen målt statistikk for Norge. Svensk økoandel falt fra 2019 til 2023, og København ligger høyt. | Intern syntese (sporet) | `INNSIKT-SPOR/ANALYSE-offentlig_innkjop.md`; hvitbok v2 kilde S19 | H, V8 | Den eldre nordiske oversikten i `research/analyse/offentlig-innkjop-nordisk.md` er foreldet og har fått et supersession-notat (15.09.2026). |
| HV-06 | Alternativt protein: store volumer i kildene er designkapasitet, og realisert volum er ukjent. | Intern syntese (tynt grunnlag) | `INNSIKT-SPOR/ANALYSE-alternativt_protein.md` | V10 | Under minstekravet til antall kilder. |
| HV-07 | Nasjonal retur av nitrogen, fosfor og kalium fra sidestrømmer er ikke målt. | Intern syntese (datagap) | `INNSIKT-SPOR/ANALYSE-materialstrommer.md` | H, V1 | Tallene fra runde 1 er strøket. Motstrid med SINTEF/FHF-påstanden, se del 5. |
| HV-08 | Det kvalitative laget mangler: ingen intervjuer i prosjektet og ingen utfylte kausale case. | Blokkert (personvern- og eierbeslutning) | `INNSIKT-SPOR/ANALYSE-kvalitativt_lag.md`; `INNSIKT-SPOR/GATE-PAKKER.md` | – | Gatepakkene er ikke sendt. |
| HV-09 | Food TG runde 13: alle 50 svar er mottatt og triagert, men ingen rad åpner for ekstern bruk ennå. | Kontrollert internt (triage) | `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` | – | Gjenstår primærsjekk, claim-lock og aktørsvar. |
| HV-10 | Innhentingen 5. august: 80 av 81 sitater ble løftet til ekstern siterbarhet. | Siterbar (maskinelt verifisert) | `research/innhenting-2026-08-05/verifisering/`; commit e63b547 | – | Ingen menneskelig kontroll per post. |
| HV-11 | Oppdagelseskøen: fire av ni spor står fast bak betalingsmur eller innlogging. | Blokkert | `research/innhenting-2026-08-05/RAPPORT-KO.md` | – | |
| HV-12 | Kartet: syntetiske gårder og feil sårbarhetsscore er rettet (september), men de nye registerlagene er ikke verifisert. | Rettet, registerlag uklare | `public/data/food-systems/DATA-SOURCES.md`; PR #416–#425 | P | Registrerte foretak er ikke det samme som aktive gårder. |
| HV-13 | Matpolitikken er delt på fire til seks departementer i hvert nordisk land. | Uklar | `research/analyse/governance-arkitektur-nordisk.md` | H | Dokument fra mars, uten kontrollstatus. |

## 4. Strøket, nullfunn og formuleringer som ikke skal brukes

| Ikke bruk | Hvorfor | Kilde |
|---|---|---|
| **MA-S1** «Dekningen i AP-1 økte fra 36 % til 47 %» | Nullfunn: «36 %» var et tidsartefakt, fordi `effectiveTo` aldri settes. | AP-1-dekningsutvidelsen §9 |
| **MA-S2** «Fisk-prisasymmetri, t = 14,0» og fôr til oppdrett | Trukket 24.08.2026. Differensiert spesifikasjon gir t = 1,25 (se MA-12). | AP-7-notatet §5b og §6c |
| **MA-S3** AP-4-kjernen og regional kobling i AP-8 | Ikke beregnbar (n = 3) og regionalt nullfunn. | AP-4/AP-8-notatet §4b |
| **MA-S4** HHI 3 445 som omsetnings-HHI | Beregnet på butikkantall, erstattet av CA-004. | CA-004 |
| **SI-S1** Direkte kakaoimport fra Elfenbenskysten, og reststrømspor for kakaopulp, kaffegrut og Polen | Motbevist eller parkert som watchlist. | avsjekk-02; DRR-innholdsanalysen |
| **SI-S2** At grossister nekter nye leverandører tilgang | Ingen rapporterte tilfeller (Menon 2024). Skal ikke brukes. | DRR-innholdsanalysen; avsjekk-04 |
| **SI-S3** Kaffe fra Brasil som «lavrisiko», Wiig som «operativt» | Brasil er «standard risk». Wiig er ikke dokumentert i drift. | avsjekk-01; desk-loggen |
| **SI-S4** «70 % av fôret havner i fjorden» | Massebalansen i biblioteket gir 20–35 %. Kan være forvekslet med fôrineffektivitet. | `research/bibliotek/forskningsrunde-2026-04-20/fortap-kvantifisering-myte-2026-04-20.md` |
| **SI-S5** Eldre sirkularitetstall: fiskeslam 3 TWh brukt som faktisk verdi | 3 TWh er et potensial, og bare om lag 2 % av ekskrementene samles i dag. | dybdeauditen §6.5–6.6 |
| **BE-S1** Nordisk kaloritabell og rangering av finsk matsikkerhet | Tatt ut av aktivt faktagrunnlag. Ingen ny rangering skal settes inn. | `SRB/round-002/NORDISK-BEREDSKAP-RETTELSE.md` |
| **BE-S2** Importtall fra runde 1 (blant annet proteinfraksjon og fiskeolje) | Ni av ti tall strøket, resten holdt tilbake. | `INNSIKT-SPOR/ANALYSE-beredskap_import.md` §1 og §10 |
| **BE-S3** «Dekningsgrad 39 %» | Tallet er en fôrkorrigert jordbruksandel uten fisk. | kvalitetssikringen QA-06 |
| **HV-S1** Dybderapportene fra forskningsrunden 20.04 som faktagrunnlag | Perplexity-output. Evidensnotatet sier at de ikke har verifiserbare tematiske funn. | `research/bibliotek/forskningsrunde-2026-04-20/` |
| **HV-S2** Draft-v1, «reviewed»-kopien og section 7 av hvitboka | Legacy og ikke gjennomgått. | `research/whitepaper/README.md` |

## 5. Motstrid og etterslep å rydde

Katalogen retter ikke kildene. Dette er det gjennomgangen fant:

- **Maktkartet etter august:** Maktkart-syntesen, policy-oppsummeringen og §6 i whitepaper-kapitlet bærer fortsatt «36 % → 47 %» og BAMA som «delt NG/Reitan». Forbeholdet i CA-015 er utdatert, og Obsidian I27 og `Maktkartet.md` peker på en feilmerket fil.
- **Siteringskjeden:** CA-017 finnes i kildekoden, men ikke i det genererte acceptance-dokumentet. AP-5 og AP-6 har `citable_with_note` i egen frontmatter, mens arbeidsplanen og appen har `internal_context`.
- **Obsidian:** I11 («Norge høyest») motsier den rettede I10.
- **Restråstoff:** Humant konsum er ~15 % i innsiktssyntesen og ~7 % i dybdeauditen. Innsiktssporet strøk restråstofftallene fra runde 1, mens PR #222 la inn en SINTEF/FHF-basert påstand om det samme. Må avstemmes.
- **Systemmodellen:** Node N1 bruker fortsatt importtall som innsiktssporet holder tilbake.
- **Sirkulære konkurser:** Ingen samlet syntese. Kildene er uenige om organisasjonsnummer og konkursdato for blant andre Rest, Mycorena og Billund, og Enorm er omtalt som norsk, men er dansk.

Ryddet 15.09.2026 med forbeholdsnotater og pekere i kildefilene, uten statusheving (grenen `claude/stale-status-fixes-2026-09-15`): hvitbok-README og innsiktssporets `START-HER.md`, matørken (HHI, 33 % og matfattigdomsraden), bondeøkonomi (455 700 mot 502 900 kr) og den eldre nordiske innkjøpsoversikten.

## 6. Rapportvinkler og hvilke funn de bygger på

Vinklene ble drøftet i arbeidsavklaringen 15.09.2026. Ingen er valgt. V10 er en ny vinkel fra denne gjennomgangen.

| | Vinkel | Funn | Hvor klar | Hva som mangler |
|---|---|---|---|---|
| V1 | Norden har løst utnyttelse, ikke verdi | SI-01, SI-02, SI-03, HV-07 | Kontrollert internt, delvis intern syntese | Avklare ~15 % mot ~7 % og SINTEF/FHF-motstriden, trekke tallene på nytt og ta dem gjennom claim-lock |
| V2 | Soyafri er ikke importfri | SI-05, BE-04, BE-06 | Intern syntese | Autorisert nytt uttrekk av importtall, forbehold om varekoder og avstemming med systemmodellen |
| V3 | Koblingsmegleren som mangler (NCH) | SI-12, SI-13, SI-14, SI-15 | Intern syntese | Kontrakter og drift må dokumenteres. Mest handlingsrettet, men svakest belagt |
| V4 | Hvor makten i matsystemet ligger | MA-01, MA-03 til MA-11, MA-13, SI-11, SI-18, SI-19 | Flere funn har gått gjennom siteringskjeden | Rydde etterslepet etter august (del 5). Sensitivt: personnavn og påklaget vedtak |
| V5 | Styring slår teknologi | SI-04, KO-06, BE-17 | Kontrollert internt | Valios fôrkurv (aktørdata) |
| V6 | EUDR-treffkartet | SI-06, SI-07, SI-08, SI-09 | Kontrollert internt | Tidskritisk mot 30.12.2026. Registrere volumtallene i kontrollstakken |
| V7 | Det ingen teller (kompetanse) | KO-01 til KO-08, KO-14 | Kontrollert internt | Claim-lock |
| V8 | Institusjonskjøkken som bro | KO-12, HV-05, BE-14 | Blandet, med datagap | Måling av kontinuitet i måltider og norsk innkjøpsstatistikk |
| V9 | Hvor sjokket lander (bondeøkonomi) | BE-18, BE-19 | Siterbar | Margin per kilo krever aktørdata |
| V10 | Hva som feilet: sirkulære konkurser | SI-16, SI-17, HV-06 | Kontrollert internt, uten syntese | Rydde faktamotstrid og skrive en samlet syntese |

**Sammenstilling:** V9 har klarest status, og V4 er nær når etterslepet er ryddet. V6 er tidskritisk, og V7 er kontrollert. Vinkelen som passer NCH best, V3, er den svakest belagte. Den krever mest arbeid før den kan bli et produkt.

## 7. Vedlikehold

- Katalogen følger kildene. Endres status i en kildefil eller i siteringskjeden, oppdateres raden her.
- Hev aldri status i katalogen før kilden er endret.
- Nye hovedfunn får neste ID i sitt spor, og ID-er brukes ikke om igjen. Funn som strykes, flyttes til del 4.
- Når et punkt i del 5 er ryddet, fjernes det herfra med henvisning til commit eller PR.

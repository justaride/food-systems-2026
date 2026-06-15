---
tittel: "Deep Research - P-FISH-1 + P-SKOT-2"
dato: "2026-06-13"
status: "Kontrollert intern kjøring - delvis lukket"
scope: "Norsk fraksjon-til-marked/prisindikasjon for marint restråstoff, pluss strukturbro Norge-Skottland."
bruksregel: "Bruk som intern claim-kilde etter SRC/PCQ/claim-lock. HS-priser under er eksportenhetsverdier, ikke dokumenterte råfraksjonspriser."
---

# Deep Research - P-FISH-1 + P-SKOT-2

## 0. Kort svar

P-FISH-1 er delvis lukket. Norske volum og hovedstrømmer kan lukkes med sterk kilde via SINTEF/FHF-rapporten for 2024. Norske offentlige fraksjonspriser er derimot ikke funnet på råvarenivå. Det beste offentlige prislaget er SSBs 2024-eksportdata på HS-/varenummernivå, som gir produktspesifikke enhetsverdier per kg. De kan brukes som prisindikasjoner, men ikke som anskaffelsespris eller råfraksjonspris.

P-SKOT-2 er lukket som strukturbro. Skottland-rapporten beskriver en konsentrert modell der mesteparten av restråstoffet i surveyen går via to hovedanlegg på fastlandet, særlig til fiskemel/fiskeolje. Norge har en mer distribuert struktur med flåte, landindustri, havbruk, slakteri/foredling og en egen spesialisert restråstoffindustri. Dette støttes av SINTEF/FHF og aktørkilder som Pelagia og ScanBio. Det er likevel ikke kildegrunnlag for å si at strukturen alene forårsaker høyere verdimiks.

**Viktig claim-gate:** Tomme eller svake prisceller er ikke en feil i kjøringen. De er et funn: offentlig norsk statistikk viser lite råfraksjonspris per hoder, lever, slo, skinn, blod osv. Der pris vises under, er det produkt-/handelsverdi, ikke nødvendigvis råstoffpris.

## 1. Kildeledger

| ID | Kilde | Brukt til | URL/lokal kopi | Locator | Status |
|---|---|---|---|---|---|
| S1 | SINTEF Ocean / FHF, "Analyse marint restråstoff 2024", rapport 2025:00517 | Norske volum, utnyttelsesgrad, fraksjoner, struktur, verdi, databegrensninger | [FHF prosjekt 901844](https://www.fhf.no/prosjekter/prosjektbasen/901844/), [SINTEF publikasjon](https://www.sintef.no/publikasjoner/publikasjon/2366473/), lokal kopi: `research/external/dro-1206/downloads/sintef-fhf-analyse-marint-restrastoff-2024.pdf` | Tabell 1 s. 4; kap. 5.2 s. 12; Tabell 5 s. 20; kap. 5.9.2-5.9.4 s. 27-29; Figur 34 s. 31; kap. 5.10.1 s. 33; vedlegg s. 44-46 | Primærkilde |
| S2 | Nofima, rapport 33/2025, "Økt utnyttelse av restråstoff fra hvitfisk" | Hvitfisk-høyverdi, produkter, teknologier, eksportverdi for restråstoffbaserte konsumprodukter | [Nofima PDF via NTB](https://kommunikasjon.ntb.no/files/9232871/18673013/205663/no), [FHF TOPP 901884](https://www.fhf.no/prosjekter/prosjektbasen/901884/), [Nofima TOPP](https://nofima.no/prosjekt/torskemelke-olje-og-proteinprosessering/) | Rapport 33/2025, sammendrag og kap. 3; TOPP-prosjekttekst | Primær/prosjektkilde |
| S3 | Zero Waste Scotland / Enscape Consulting, "Characterising Fish Processing By-products", 2019 survey | Skottland benchmark: blandet vs separert prisnivå, to-hovedanlegg-struktur, volumfordeling | [ZWS ressurs](https://www.zerowastescotland.org.uk/resources/characterising-fish-processing-products), lokal kopi: `research/external/dro-1206/downloads/zero-waste-scotland-characterising-fish-processing-by-products.pdf` | Executive summary; Table 5; Table 6; by-product processing section | Benchmark, ikke norsk kilde |
| S4 | SSB, tabell 08801 komplett datasett og Statistisk varefortegnelse | 2024 eksportenhetsverdier per varenummer, NOK/kg | [SSB 08801 zip](https://www.ssb.no/en/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer), [varefortegnelse](https://www.ssb.no/en/utenriksokonomi/utenrikshandel/artikler/statistisk-varefortegnelse-for-utenrikshandelen), lokale kopier i `research/external/dro-1206/downloads/ssb/` | 2024, eksport, alle land, mengde kg og verdi NOK | Offentlig prisindikator |
| S5 | Pelagia | Norsk mottaks-/foredlingsstruktur, fiskemel/fiskeolje, service/logistikk, H-pro/H-oil | [About](https://www.pelagia.com/about), [Facilities](https://www.pelagia.com/facilities), [Services](https://www.pelagia.com/services), [Karmsund fiskemel](https://www.pelagia.com/facilities/pelagia-karmsund-fiskemel), [Salthella](https://www.pelagia.com/facilities/pelagia-salthella) | Aktørsider | Aktørkilde |
| S6 | ScanBio | Norsk/nordisk innsamling, ensilasje, hydrolysert protein/olje, kategori 2 og 3 | [ScanBio](https://www.scanbio.com/), [Ingredients](https://www.scanbio.com/ingredients), [About us](https://www.scanbio.com/about-us) | Aktørsider | Aktørkilde |
| S7 | Hofseth BioCare, Biomega, Lerøy/SalmoFer, Nordic Seaco, C Food Norway, FHF HEADS UP | Dokumenterte norske høyverdi-/nisjebruk for salmon offcuts, protein/olje, blod, skinn, hoder, lever/rogn | [Hofseth BioCare](https://hofsethbiocare.com/), [Biomega](https://biomegagroup.com/), [Lerøy SalmoFer-nyhet](https://www.leroyseafood.com/en/about-us/news/making-use-of-salmon-blood/), [SalmoFer](https://www.salmofer.com/), [Nordic Seaco fiskeskinn](https://nordic-seaco.no/produkt/fiskeskinn/), [C Food Norway hos Innovasjon Norge](https://www.innovasjonnorge.no/kundehistorie/c-food-norway), [FHF HEADS UP 901308](https://www.fhf.no/prosjekter/prosjektbasen/901308/) | Aktør-/prosjektsider | Aktør/prosjekt |

## 2. Fraksjon-til-marked-tabell

**Leseregel:** `Prisindikasjon` er en offentlig handelsverdi for relevant produktgruppe der en slik finnes. Den er ikke lik pris betalt for rå restråstofffraksjon. `DQ` betyr datakvalitet: A = sterk direkte kilde, B = god proxy, C = svak/aggregert proxy, D = ikke funnet/offentlig tomrom.

| Fraksjon | Art/sektor | Nåværende volum | Nåværende end-use | Dokumentert høyverdi-/nisjebruk | Aktør | Prisindikasjon | Enhet | År | Kilde | URL | Locator | DQ |
|---|---|---:|---|---|---|---:|---|---:|---|---|---|---|
| Hoder | Hvitfisk | 86 000 t | Konsumprodukter og eksport der kvalitet/logistikk holder; ellers lavere verdi/feed/ensilasje | Tørkede/fryste/saltede/hermetiske hoder til måltider; hydrolyse som mat-/proteiningrediens i prosjektløp | C Food Norway; Fjordlaks/Tufjord via HEADS UP | 26,70 | NOK/kg, HS 03057200 | 2024 | S1, S4, S7 | SSB 08801; C Food Norway; FHF 901308 | SINTEF tallgrunnlag Figur 8; SSB 03057200 | B/C |
| Lever | Hvitfisk | 39 000 t | Tran/cod liver oil, konsum og ingrediens | Leverprodukter/tran, omega-3 og konsum | Nordic Seaco; norsk tran-/oljeindustri | 44,98; 164,29 | NOK/kg, HS 03029100; vektet HS 150410 | 2024 | S1, S4, S7 | SSB 08801; Nordic Seaco | SINTEF tallgrunnlag Figur 8; SSB 03029100/150410 | B/C |
| Rogn | Hvitfisk | 17 300 t | Konsum, bearbeidet rogn, eksport | Rognprodukter fra torsk/hyse/sei m.fl. | Nordic Seaco | 44,98; 56,10-103,64 | NOK/kg, HS 03029100; HS 03052001/09 | 2024 | S1, S4, S7 | SSB 08801; Nordic Seaco | SINTEF tallgrunnlag Figur 8; SSB 03029100/030520 | B/C |
| Melke | Hvitfisk | 15 900 t | Beste kvalitet til sushi/asiatisk marked; ellers svake/lavere bruksstrømmer | TOPP: protein, olje og DNA fra torskemelke; mobil hydrolyse | Nord-Senja Fisk; Nuas Technology; Nofima/FHF | 44,98; 56,10-103,64 | NOK/kg, samme HS-proxy som lever/rogn/melke | 2024 | S1, S2, S4 | SSB 08801; FHF 901884; Nofima TOPP | SINTEF tallgrunnlag Figur 8; TOPP prosjekttekst | C |
| Slo/innvoller | Hvitfisk | 41 900 t | Ensilasje, feed, fiskemel/fiskeolje der samlet inn; lav utnyttelse når oppstår om bord | Hydrolysat/protein/olje er teknologisk mulig, men ikke dokumentert som bred kommersiell hvitfiskstrøm | ScanBio; Pelagia Services | 22,33; 24,00 | NOK/kg, vektet HS 230120; vektet HS 150420 | 2024 | S1, S4, S5, S6 | SSB 08801; Pelagia; ScanBio | SINTEF tallgrunnlag Figur 8; SSB 230120/150420 | C |
| Avskjær/rygger inkl. skinn | Hvitfisk | 39 600 t | Avskjær, rygg, skinn og bein fra landindustri; både konsumprodukter og ingrediens/feed | Rygger og svømmeblærer; skinn til lær, sårbehandling, kollagen | C Food Norway; Nordic Seaco; Norskin nevnt i SINTEF | 115,34; 8,97; 26,43 | NOK/kg, HS 03029901/09; HS 03057900 | 2024 | S1, S4, S7 | SSB 08801; C Food Norway; Nordic Seaco | SINTEF kap. 5.2 og tallgrunnlag Figur 8; SSB 030299/030579 | C |
| Skinn | Hvitfisk | Ikke separat i SINTEF-tabell, inngår i avskjær/rygger | Del av avskjærstrøm; noe eksport/videreforedling | Fiskeskinn til lær, medisinsk sårbehandling, kollagen til kosttilskudd/kosmetikk | Nordic Seaco; Norskin nevnt i SINTEF | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1, S7 | Nordic Seaco; SINTEF | SINTEF kap. 6; Nordic Seaco produkttekst | D |
| Blod | Hvitfisk | Ikke inkludert som tilgjengelig restråstoff | SINTEF vurderer blodstrømmen som for spredt/fragmentert til å inkludere | Ikke dokumentert bred norsk høyverdi på offentlig kilde i denne kjøringen | Ikke låst | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1 | SINTEF/FHF | SINTEF kap. 5.2 | A/D |
| Hoder | Laksefisk/havbruk | 47 400 t | Restråstoff fra slakting/foredling; til ingrediens, feed, olje/protein eller andre produkter avhengig av aktør | Del av ferske offcuts brukt i marine ingredienser | Pelagia Salthella; ScanBio; Hofseth/Biomega for salmon offcuts generelt | Ikke funnet som ren hodepris | Offentlig råfraksjonspris | 2024 | S1, S5, S6, S7 | Pelagia; ScanBio; Hofseth; Biomega | SINTEF Tabell 5; aktørsider | C/D |
| Slo | Laksefisk/havbruk | 177 000 t | Fersk olje/protein, ensilasje, FPH/FPC, feedingredienser | Bioaktive ingredienser, salmon oil, hydrolysert protein | Hofseth BioCare; Biomega; Pelagia Salthella; ScanBio | 22,33; 24,00 | NOK/kg, vektet HS 230120; vektet HS 150420 | 2024 | S1, S4, S5, S6, S7 | SSB 08801; Hofseth; Biomega; Pelagia; ScanBio | SINTEF Tabell 5; SSB 230120/150420 | C |
| Rygg og spol | Laksefisk/havbruk | 51 200 t | Ingrediens, olje/protein, feed/pet food, konsum der relevant | Salmon offcuts til olje, peptider/protein og mineral-/kalsiumfraksjoner | Hofseth BioCare; Biomega | 22,33; 24,00 | NOK/kg, vektet HS 230120; vektet HS 150420 | 2024 | S1, S4, S7 | SSB 08801; Hofseth; Biomega | SINTEF Tabell 5; SSB 230120/150420 | C |
| Skinn | Laksefisk/havbruk | 35 100 t | Del av restråstoff fra foredling; ingrediens/kollagen/annet etter kvalitet | Kollagen, fiskeskinn, kosmetikk/supplement/lær i aktør-/markedsbeskrivelser | Nordic Seaco; Norskin nevnt i SINTEF | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1, S7 | Nordic Seaco; SINTEF | SINTEF Tabell 5; SINTEF kap. 6 | C/D |
| Buklist | Laksefisk/havbruk | 22 200 t | Konsumprodukt og/eller ingrediensstrøm | SINTEF peker på buklist som del av konsumprodukter fra restråstoff | Ikke aktørlåst i denne kjøringen | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1 | SINTEF/FHF | SINTEF Tabell 5; kap. 5.9.3 | C/D |
| Diverse avskjær | Laksefisk/havbruk | 38 300 t | Ingrediens, feed, olje/protein, FPH/FPC | Premium salmon oil/protein/offcuts | Hofseth BioCare; Biomega; ScanBio; Pelagia | 22,33; 24,00 | NOK/kg, vektet HS 230120; vektet HS 150420 | 2024 | S1, S4, S5, S6, S7 | SSB 08801; aktørsider | SINTEF Tabell 5; SSB 230120/150420 | C |
| Blod | Laksefisk/havbruk | 34 300 t | I hovedsak ikke utnyttet som fri blodstrøm i 2024; blodrand følger slo | Jern-/hemeingrediens fra lakseblod | Lerøy 100% Fish; SalmoFer | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1, S7 | Lerøy; SalmoFer | SINTEF Tabell 5; Lerøy SalmoFer-nyhet | A for volum, B for aktør, D for pris |
| Dødfisk kategori 2 | Laksefisk/havbruk | 123 800 t | Biogass/bioenergi/teknisk bruk; kategori 2-regelverk begrenser mat/feed | Kategori 2 olje/protein til bioenergi/leather tanning ifølge ScanBio | ScanBio; Pelagia Services | Ikke funnet | Offentlig råfraksjonspris | 2024 | S1, S5, S6 | ScanBio; Pelagia Services | SINTEF Tabell 5; ScanBio Ingredients | B/C |

## 3. Pris- og varenummernotat

Metode: SSB komplett datasett for tabell 08801 ble brukt for 2024, eksport, alle land. Enhetsverdi er `statistisk verdi NOK / mengde kg`. Varenummernavn er kontrollert mot SSBs varefortegnelse. Dette er en handelsverdi på produktnivå.

| Varenummer | Produktgruppe | Mengde | Verdi | Enhetsverdi | Bruk i tabell | Datagrep |
|---|---|---:|---:|---:|---|---|
| 03029100_2017 | Fersk/kjølt fiskelever, rogn og melke | 516 483 kg | 23 231 968 NOK | 44,98 NOK/kg | Lever, rogn, melke | B: relevant, men ikke fraksjonssplittet |
| 03029901_2017 | Fersk/kjølt spiselig fiskeavfall, delgruppe | 162 651 kg | 18 759 431 NOK | 115,34 NOK/kg | Avskjær/rygger | C: svært aggregert delgruppe |
| 03029909_2017 | Fersk/kjølt spiselig fiskeavfall, delgruppe | 401 781 kg | 3 605 519 NOK | 8,97 NOK/kg | Avskjær/rygger | C: svært aggregert delgruppe |
| 03057200_2012 | Fiskehoder, haler og svømmeblærer, røkt/tørket/saltet/i lake | 7 728 542 kg | 206 375 922 NOK | 26,70 NOK/kg | Hoder | B/C: relevant, men produktgruppe og art ikke ren |
| 03057900_2012 | Fiskeavfall ellers, røkt/tørket/saltet/i lake, ekskl. hoder/haler/svømmeblærer | 2 266 770 kg | 59 903 602 NOK | 26,43 NOK/kg | Avskjær/annet | C |
| 03052001_1992 | Lever/rogn, tørket/røkt/saltet/i lake, delgruppe | 88 256 kg | 9 146 758 NOK | 103,64 NOK/kg | Lever/rogn/melke | B/C |
| 03052009_1992 | Lever/rogn, tørket/røkt/saltet/i lake, delgruppe | 839 259 kg | 47 081 073 NOK | 56,10 NOK/kg | Lever/rogn/melke | B/C |
| 150410 samlet | Fiskeleveroljer og fraksjoner | 2 369 773 kg | 389 342 439 NOK | 164,29 NOK/kg | Lever/tran/olje | C: oljeprodukt, ikke rålever |
| 150420 samlet | Fett og oljer av fisk, ekskl. leveroljer | 102 812 754 kg | 2 467 462 905 NOK | 24,00 NOK/kg | Slo/avskjær/lakseoljeproxy | C: kan blande helt råstoff og restråstoff |
| 230120 samlet | Mel/pellets av fisk/krepsdyr/bløtdyr, ikke til menneskemat | 99 633 442 kg | 2 224 772 749 NOK | 22,33 NOK/kg | Fiskemel/feedproxy | C: kan blande helt råstoff og restråstoff |

SINTEF advarer eksplisitt mot en enkel lesing av offentlig statistikk: offisiell statistikk skiller ofte ikke mellom restråstoff og helt råstoff i fiskemel/-olje, og enkelte små HS-koder er ujevne eller konfidensialitetsutsatte. Prisene over bør derfor bare brukes som "public product value indicators".

### Skottland-pris som referanse

Zero Waste Scotland/Enscape 2019 oppgir:

| Strøm | Survey-verdi | Bruk |
|---|---:|---|
| Mixed by-products | 62-173 GBP/tonn; gjennomsnitt 172,88 GBP/tonn i Table 5 | Lavere verdi/blandet restråstoff |
| Segregated by-products | 250-520 GBP/tonn; gjennomsnitt 433,85 GBP/tonn i Table 6 | Separerte fraksjoner med høyere verdi |

Dette kan brukes som benchmark for verdien av separering, men ikke som direkte norsk pris.

## 4. Strukturbro Norge-Skottland

| Dimensjon | Skottland | Norge | Claim-gate |
|---|---|---|---|
| Prosesseringsstruktur | ZWS/Enscape-surveyen beskriver at hovedmengden av by-products ble prosessert ved to anlegg på fastlandet. Added-value processors hadde 179 640 t input, hvor 166 000 t gikk til fiskemel/fiskeolje og 13 640 t til tørking/frysing/høyere verdi. | SINTEF/FHF beskriver et flerleddet system: fiskeri, landindustri, salgs-/eksportledd, havbruk, slakteri/foredling og spesialisert restråstoffindustri. Figur 34 anslår blant annet 600+ i fiskeri, ca. 300 i primær fiskeindustri, ca. 45 spesialisert marint restråstoffindustri, ca. 75 havbruk og 80+ slakting/foredling. | Det er trygt å si "mer distribuert norsk struktur". Ikke si at dette alene skaper verdimiks uten kilde. |
| Volum og utnyttelse | Surveyen dekker betydelige skotske strømmer, men er eldre og delvis surveybasert. | 2024: ca. 1,094 mill. t tilgjengelig marint restråstoff, 976 000 t utnyttet, 118 000 t ikke utnyttet. | Norske volum kan lukkes for 2024. Skotsk sammenligning må merkes 2019 survey. |
| Første prosess | Mesteparten i added-value-leddet går til fiskemel/fiskeolje. | 2024: 52 % av tilgjengelig restråstoff gikk først til ensilasje; 19 % til fersk lakseolje/protein; 16 % til tradisjonelt fiskemel/fiskeolje. | Sammenlign prosessmiks, ikke produktlønnsomhet. |
| Produktmiks | Skotsk rapport skiller særlig mixed/segregated og fishmeal/oil vs høyere verdi. | SINTEF anslår ca. 70 000 t sjømatprodukter/tran/ekstrakter fra restråstoff og ca. 312 000 t feedprodukter. Functional food/kosmetikk/supplement/farma er mindre volum og falt i 2024. | Trygt claim: høyverdi finnes, men er smalere enn feed/ensilasje/fiskemel/olje. |
| Geografi/logistikk | Skottland-kilden beskriver en mer konsentrert prosessering rundt få anlegg i surveyen. | Pelagia oppgir kystnære anlegg, service/logistikk langs norskekysten, egne fartøy/lastebiler og lagring langs kysten. ScanBio oppgir innsamlings-/gjenvinningsstruktur med fartøy og anlegg langs norskekysten og i flere nordiske/nordeuropeiske land. | Aktørsider belegger distribuerte nettverk, men ikke total markedsandel uten videre kilde. |
| Eierskap/aktørtyper | ZWS-rapporten brukes som sektorbeskrivelse, ikke full eierkartlegging. | Norske offentlige aktørkilder viser både store industrielle integratorer (Pelagia, ScanBio) og nisje-/høyverdiaktører (Hofseth BioCare, Biomega, SalmoFer, Nordic Seaco, C Food Norway). | Bruk eksempler, ikke komplett aktørkart. |

## 5. Hva er lukket, og hva står åpent?

### Lukket i denne kjøringen

- Norske 2024-hovedvolum: 1,094 mill. t tilgjengelig restråstoff, 976 000 t utnyttet, 118 000 t ikke utnyttet.
- Hvitfiskfraksjoner i SINTEF/FHF tallgrunnlag: hoder 86 000 t, slo 41 900 t, lever 39 000 t, rogn 17 300 t, melke 15 900 t, avskjær/rygger 39 600 t.
- Laksefisk/havbrukfraksjoner: dødfisk 123 800 t, blod ca. 34 300 t, slo 177 000 t, hoder 47 400 t, rygg/spol 51 200 t, skinn 35 100 t, buklist 22 200 t, diverse avskjær 38 300 t.
- Norsk strukturbro mot Skottland: Norge har dokumentert flerleddet og distribuert restråstoffstruktur, ikke en skotsk to-hovedanlegg-modell.
- Offentlige prisindikasjoner på produktnivå: HS-koder gir NOK/kg for eksporterte produktgrupper.
- Skottland benchmark: mixed by-products 62-173 GBP/t og segregated by-products 250-520 GBP/t i 2019-surveyen.

### Fortsatt åpent

- Norske råfraksjonspriser per hode, lever, rogn, melke, slo, rygg, skinn og blod.
- Pris- og volumfordeling per art innen HS-kodene, særlig hvitfisk vs laksefisk.
- Aktørspesifikke marginer, innkjøpspriser og fraksjonsvolum.
- Kausalt claim om at norsk struktur gir høyere verdi. Kildene støtter strukturkontrast og produktmiks, ikke sterk kausalitet.
- Oppdatert skotsk post-2019-tallgrunnlag. Dette hører til P-SKOT-1 hvis caset trenger mer Skottland-oppdatering.

## 6. Claim-linjer klare for videre bruk

Disse linjene kan brukes i deck/notat etter vanlig claim-lock:

1. "I Norge oppsto det ca. 1,094 millioner tonn marint restråstoff i 2024; ca. 976 000 tonn ble utnyttet, mens ca. 118 000 tonn ikke ble utnyttet."
2. "Hvitfisk er hovedgapet: SINTEF/FHF anslår ca. 245 000 tonn tilgjengelig hvitfiskrestråstoff og 72 % utnyttelsesgrad i 2024, med ca. 69 000 tonn ikke utnyttet."
3. "Laksefisk/havbruk har høy total utnyttelse, men fri blodstrøm er fortsatt hovedtomrommet: ca. 34 300 tonn blod ble i hovedsak ikke utnyttet i 2024."
4. "Offentlig norsk prisstatistikk gir produktnivå, ikke råfraksjonspris: for eksempel 2024 eksportenhetsverdi på ca. 26,70 NOK/kg for tørkede/røkte/saltede hoder/haler/svømmeblærer og ca. 164,29 NOK/kg for fiskeleveroljer."
5. "Zero Waste Scotland/Enscape 2019 viser et tydelig separeringspremium i surveyen: mixed by-products 62-173 GBP/t mot segregated by-products 250-520 GBP/t."
6. "Strukturelt er Norge et annet case enn Skottland: SINTEF/FHF beskriver en flerleddet norsk verdikjede med en egen spesialisert restråstoffindustri, mens Skottland-surveyen peker på tung konsentrasjon rundt to hovedanlegg."
7. "Høyverdi finnes i Norge, men er smal i volum: SINTEF/FHF anslår ca. 70 000 tonn sjømatprodukter/tran/ekstrakter fra restråstoff, mens feedprodukter utgjør ca. 312 000 tonn."

## 7. Anbefalt neste gate

Neste naturlige forskningsrunde bør ikke være bred. Den bør være en smal pris-/aktørgate:

- **P-FISH-1B:** Forsøk å få bedre råfraksjonspris via årsrapporter, salgs-/auksjonsdata, eksportørmateriell eller direkte bransjekilder for hoder, lever, rogn/melke og lakseblod.
- **P-SKOT-1:** Hvis Scotland-Poland-sammenligningen skal brukes tungt eksternt, oppdater Skottland etter 2019 med nyere aktør-/policy-/industry-kilder.
- **RP-tillegg:** Bruk prisindikatorene her som vedlegg, ikke som ferdig økonomimodell, før RP-kjøringen har claim-låst differansen mellom råstoffpris, produktpris og margin.

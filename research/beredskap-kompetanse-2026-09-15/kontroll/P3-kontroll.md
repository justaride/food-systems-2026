# Kildekontroll P3 (kriser): versjon A og B

Kontrollert 15.09.2026 med WebFetch/WebSearch mot kilde_url og, der kilden var blokkert, mot åpne speil (OpenAlex, Semantic Scholar, parlamentets egne sammendragssider, gov.uk). Ingen filer i `chatgpt/` eller `pastander-samlet.csv` er endret.

## 1. Oppsummering

**Omfang:** 33 innholdspåstander kontrollert. Det gir 62 dommer: alle 60 id_unik for P3, pluss to påstander fra B sin del A som ikke står i CSV-en (B:delA-eksport og B:delA-strom).

| Dom | Antall id_unik |
|---|---:|
| behold | 51 |
| rett | 9 |
| forkast | 0 |
| ikke_verifisert | 2 |

**Viktigste funn**

1. **Ingen påstander måtte forkastes.** Alle sitater som ble kontrollert, finnes ordrett i kildene. Det gjelder Bjørkhaug og Brobakk, Ala-Karvia, Janssen, Luke, Yara, Truesec, Huitu, Bailes og Jóhannsson, Huoltovarmuuskeskus og Johnston.
2. **Bjørkhaug og Brobakk: feil sidetall i begge versjoner.** Alle tre sitatene står på **s. 83**, ikke s. 84–85 (IJSAF 30(1), s. 75–93). Innholdet stemmer. Behovet «not met» gjaldt «particularly in the fruit and vegetable sector». Påstanden om manglende ekspertise er bøndenes protest mot ordningen, ikke en målt forskjell.
3. **Thorvaldsen mfl. 2026 finnes** (Coastal Management, publisert 05.08.2026, åpen tilgang). Sammendraget sier noe annet enn B skriver: «Processing plants and demersal fisheries were most vulnerable to closed borders, as they rely heavily on foreign workers.» Kilden nevner altså **foredlingsanlegg og bunnfiskfiskeriene som to grupper**, ikke «landbasert foredling i bunnfisksektoren». A hadde ikke med artikkelen. A sin negative påstand (ingen verifisert årsakskjede fra ferdighetsmangel til produksjonsutfall) er likevel ikke motbevist.
4. **Eksportstudien B viser til finnes:** Asche mfl. 2022, *Aquatic Living Resources* 35:15, doi 10.1051/alr/2022017. Den fant svært få virkninger på norsk sjømateksport (data til mai 2021). Formuleringen «not been impacted … to any measurable extent» står i artikkelen.
5. **Tallene holder:** Yara «around 35%», Truesec «around 700 of its 800 stores» og gjenåpning innen seks dager. Huitu: 4,59 ± 2,72 (95 %) for gårder med over 72 t avbrudd, sammenliknet med måneden før. Produksjonen var normal igjen måneden etter. EFRA: 800 visum tilgjengelig, 115 utstedt. **B sin del A skriver «omtrent fem prosent». Det må rettes til 4,6 %.**
6. **Kuns mfl. 2023 (Ringsted, 142/800) kunne ikke åpnes** (Wiley 403 på alle adresser). Samtidige medier gir 120 + 22 = 142 positive og rundt 800 i isolasjon, men det bekrefter ikke artikkelen. Dommen er derfor ikke_verifisert. Britiske parlamentsrapporter (PDF og HTML) ga også 403. De er kontrollert via komiteens egen sammendragsside, søkeindeksens utdrag av rapportteksten og gov.uk. Paragraf- og sidetall er derfor ikke kontrollert.

## 2. A/B-avvik

| Avvik | A | B | Hva kilden viser |
|---|---|---|---|
| ID-forskyvning | Ingen sjømatrad. Kuns = P3-004 | Thorvaldsen = P3-004, så alle ID-er fra Kuns og utover er forskjøvet | Ikke et innholdsavvik. |
| Norsk sjømatforedling | Bevisst utelatt, «ikke funnet i avgrenset søk» (del F) | Thorvaldsen 2026 og eksportstudie 2022 | **B er nærmest kilden, men må rettes.** Artikkelen finnes og støtter sårbarhet på grunn av utenlandsk arbeidskraft, men gjelder «processing plants **and** demersal fisheries». Eksportstudien stemmer. A har rett i at en årsakskjede via ferdigheter ikke er dokumentert. |
| Strømbrudd, tall | 4,59 % (± 2,72), samlet avbrudd i måneden | Del A: «omtrent fem prosent». CSV: «om lag 4,6» | **A stemmer.** B sin del A runder for grovt. |
| Innreiseunntak | «grenseunntak ble også innført» | «senere ble innreiseunntak brukt» | **A stemmer bedre.** Unntak for EU/EØS kom 30.03.2020, dagen *før* dagpengeordningen (31.03.2020). Utvidelser kom 09.04 og 06.05.2020. |
| Lokator for restaurantfagfolk (Sverige) | «Results > Sweden; Table 7» | «Results > Sweden; løsninger ved staff shortage» | **A stemmer.** Sitatet står i Table 7, ikke i løpende tekst. |
| Coop gjenåpning | Seks dager tatt med | Ikke tallfestet | Begge er riktige. Truesec: «Within six days, Coop was able to reopen all their stores.» |
| Danske husholdninger | Færre handleturer og mer mat med lang holdbarhet | Bare færre handleturer | Begge er riktige for Danmark. Studien gjelder Danmark, Tyskland og Slovenia. |
| Luke-indikator for gjødselsalg | P3-011 (bare A) | Ikke med | A er verifisert. |
| Ringsted-tall | 142 positive / 800 hjemme (A:P3-004) | Ingen tall (B:P3-005) | Ikke verifisert mot artikkelen i noen av versjonene. |
| IJSAF-sidetall | s. 84–85 / s. 84 | s. 84–85 / s. 84 | **Begge feil.** Riktig er s. 83. |
| Sikkerhet P3-015 (Coop) | middels | høy | Et skjønn, ikke et kildeavvik. Begge formuleringene holder. |

## 3. Tabell

| id_unik | Påstand (kort) | Dom | Hva kilden faktisk sier / rettelse | URL brukt |
|---|---|---|---|---|
| A:P3-001, B:P3-001 | Arbeidskraftbehovet ble ikke dekket tross dagpengeordningen | rett | Sitatet stemmer: «Despite the free pass scheme, labour demands were not met, particularly in the fruit and vegetable sector.» **Lokator: s. 83**, ikke s. 84–85. | https://www.ijsaf.org/index.php/ijsaf/article/download/571/420 |
| A:P3-002, B:P3-002 | Bønder hevdet at norske erstattere manglet erfaring | rett | Stemmer: bøndene protesterte og hevdet at nordmenn manglet «the expertise and experience of migrant workers». **Lokator: s. 83**. Kilde for bondesitatet er Bondebladet 2020. | samme |
| A:P3-003 | Ordningen fra 31.03.2020 (dagpenger) og grenseunntak | rett | Innholdet stemmer: vedtatt 31.03.2020 og videreført i 2021. **Lokator: s. 83.** | samme |
| B:P3-003 | Dagpenger + «senere» innreiseunntak | rett | **Lokator: s. 83.** Ordlyd: unntakene kom ikke «senere». Justisministeren åpnet for EU/EØS-arbeidere 30.03.2020, samtidig med ordningen, og utvidet 09.04 og 06.05.2020. | samme |
| B:P3-004 | Thorvaldsen 2026: bunnfiskforedling særlig sårbar pga. utenlandsk arbeidskraft | rett | Artikkelen finnes: Thorvaldsen, Lilleng, Myhre og Størkersen, *Coastal Management*, 05.08.2026. Sammendraget sier at «processing plants and demersal fisheries» var mest sårbare og viser til «rely heavily on foreign workers». **Rett til:** «foredlingsanlegg og bunnfiskfiskeriene var mest sårbare …». Metode: 26 intervjuer, workshops og dokumentanalyse. | https://api.openalex.org/works/doi:10.1080/08920753.2026.2713824 ; https://api.crossref.org/works/10.1080/08920753.2026.2713824 (tandfonline 403) |
| B:delA-eksport | Norsk sjømateksport fikk ingen målbar nedgang av covid-tiltakene (studie 2022) | behold | Asche mfl. 2022, *Aquatic Living Resources* 35:15, doi 10.1051/alr/2022017. Data 2016–mai 2021. Svært få virkninger. Artikkelen sier at eksporten ikke ble påvirket «to any measurable extent». Referansen mangler i B sin CSV. | https://api.openalex.org/works/doi:10.1051/alr/2022017 ; søkeutdrag fra alr-journal.org (direkte 403) |
| A:P3-004 | Kuns: 142 positive og 800 hjemme i Ringsted; produksjon flyttet | ikke_verifisert | Artikkelen finnes (Sociologia Ruralis 2023, åpen tilgang CC BY-NC-ND), men all Wiley-tekst ga 403 (doi, full, abs, epdf, pdfdirect). Sammendraget nevner ikke Ringsted. Samtidige medier gir 120 + 22 = 142 positive, rundt 800 i isolasjon og delvis flytting til Jylland. Det bekrefter ikke artikkelens tekst eller EFFAT som kilde. | onlinelibrary.wiley.com/doi/10.1111/soru.12443 (403); api.semanticscholar.org; tv2east.dk |
| B:P3-005 | Ringsted: bemanning redusert, produksjon flyttet | ikke_verifisert | Som over. Sitatet «swiftly shift production to other facilities» er ikke kontrollert. | samme |
| A:P3-005 | Tuusula: ukentlig utlevering av tilberedte, nedkjølte/fryste måltider | behold | Tuusula innførte innen én uke «a once-a-week pick-up point for meals for the whole week». Maten ble «cooked, chilled, and then distributed frozen». | https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.750598/full |
| B:P3-006 | Finske skolekjøkken la om produksjon og distribusjon (nedkjølt/fryst) | behold | Som over. Merk: studien dekker fem land i Østersjøregionen, ikke bare Finland og Sverige. | samme |
| A:P3-006 | Svenske caser: omdisponering og restaurantfagfolk | behold | Table 7 («Introduced solutions and other positive developments»): omdisponering av egne ansatte eller «hiring professionals from the private restaurant industry». | samme |
| B:P3-007 | Samme | rett | Innholdet stemmer. **Lokator: Table 7**, ikke løpende tekst under «Results > Sweden». | samme |
| A:P3-007 | Danske respondenter: færre handleturer og mer mat med lang holdbarhet | behold | «shopped less frequently during lockdown». For Danmark: økt forbruk av mat med lengre holdbarhet. Studien gjelder DK, DE og SI (n = 2 680). | https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2021.635859/full |
| B:P3-008 | Færre handleturer | behold | Som over. | samme |
| A:P3-008, B:P3-009 | Studien måler ikke matlagings- eller lagringsferdigheter | behold | «cross-sectional online survey». Spørreskjemaet måler frekvenser, kanaler og tilberedningsmåter, ikke ferdigheter. | samme |
| A:P3-009, B:P3-010 | Import av soya-, raps- og solsikkemel fra Russland stoppet tidlig i mars 2022 | behold | Over en tredel av disse råvarene kom fra Russland. «imports from Russia ceased completely at the beginning of March 2022». | https://www.luke.fi/en/news/exceptionally-high-pressure-to-raise-the-price-of-food |
| A:P3-010, B:P3-011 | Innsatskostnader økte; dårlig høst i 2021 ga lave kornlagre | behold | Kilden sier at energi- og gjødselpriser økte kraftig, og at «the poor harvest in 2021» ga stort lageruttak og svært lave lagre. Luke 04.07.2022. | samme |
| A:P3-011 | Lave næringsbalanser i 2022 fordi gjødselsalget var lavt | behold | «fertilizer sales were lower than usual». Siden er publisert 28.09.2015 og oppdatert 18.02.2026. | https://www.luke.fi/en/statistics/indicators/cap-indicators/nitrogen-and-phosphorus-balance |
| A:P3-012, B:P3-012 | Yara kuttet til ca. 35 % ammoniakkapasitet; importert ammoniakk der mulig | behold | 25.08.2022: «around 35%». Kuttet tilsvarer 3,1 mill. t ammoniakk i året. Nitratproduksjonen fortsatte med importert ammoniakk «when feasible». | https://www.yara.com/corporate-releases/yara-implements-further-production-curtailments-in-europe/ |
| A:P3-013, B:P3-013 | Ca. 700 av 800 Coop-butikker stengt etter angrepet 02.07.2021 | behold | «close around 700 of its 800 stores». Angrepet kom fredag 02.07.2021 kl. 19. | https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time |
| A:P3-014, B:P3-014 | Automatisert reinstallasjon; alle butikker åpne innen seks dager | behold | Kilden nevner «automating the re-installation of more than 700 store-servers» og «Within six days, Coop was able to reopen all their stores.» Kilden er leverandørens egen beskrivelse. | samme |
| A:P3-015, B:P3-015 | Kilden viser IT-avhengighet, ikke manglende manuelle ferdigheter | behold | Angrepet rammet kasser, selvskanning, vekter, porter og «all payment management within the stores». Manuell drift er ikke omtalt. | samme |
| A:P3-016, B:P3-016 | 4,59 % lavere månedlig melkemengde ved over 72 t avbrudd | behold | «4.59 ± 2.72 at 95% confidence level», mot måneden før. 2 563 gårder, 2010–2015, *Natural Hazards* 104:1695–1704. Tilleggsfunn som mangler i A og B: produksjonen var normal igjen måneden etter, og studien vurderer produksjonen som robust mot avbrudd under tre døgn. | https://link.springer.com/article/10.1007/s11069-020-04240-0 (via cookie-redirect) ; api.semanticscholar.org |
| B:delA-strom | «omtrent fem prosent lavere» (B del A) | rett | **Rett til 4,6 %** (4,59 ± 2,72). | samme |
| A:P3-017, B:P3-017 | Studien isolerer ikke ferdigheter fra utstyr og beredskap | behold | «Farms differ in their equipment and general preparedness» (Discussion and conclusions). | samme |
| A:P3-018, B:P3-018 | Bankkollaps og valutamangel gjorde det vanskelig å betale utenlandske leverandører i 2008 | behold | S. 499: selskaper «could not pay foreign suppliers», og kredittfasiliteter ble kuttet. Kilden for dette er medier («Hagar …»). Stjórnmál og stjórnsýsla 7(2), 2011. | https://ejournals.is/index.php/irpa/article/view/b.2011.7.2.1/pdf_217 |
| A:P3-019, B:P3-019 | Frykt for full importstans, ikke dokumentert stans | behold | S. 499: «it looked as if all food importation would cease». | samme |
| A:P3-020, B:P3-020 | Drivstoff delvis unntatt fra streiken 26.03.2024 for kritisk transport | behold | Stemmer. Presisering: det var **Teollisuusliitto (Industrial Union)** som vedtok unntaket, ikke myndigheten. Vurdering per 05.04, publisert 11.04.2024. | https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024 |
| A:P3-021, B:P3-021 | Ingen umiddelbar virkning på mat og dagligvarer ventet per 05.04 | behold | «not expected to have any immediate impacts on the availability of food». | samme |
| A:P3-030, B:P3-022 | Samarbeid mellom myndigheter og virksomheter (K2) | behold | Under overskriften «Close and effective cooperation»: samarbeid mellom «authorities, companies and all other parties» har spilt en stor rolle. | samme |
| A:P3-022, B:P3-023 | Transportkomiteen: etterslep i testing og lisensiering; covid forverret et eldre problem | behold | HC 162, 01.06.2022. Komiteens egen sammendragsside nevner etterslep hos DVLA/DVSA. Mangelen gikk «from chronic to acute» (Logistics UK). PDF og HTML ga 403, så ordrett sitat og avsnitt 6–9/18 er ikke kontrollert. | https://ukparliament.shorthandstories.com/road-freight-supply-chain-transport-report/index.html ; websøk |
| A:P3-023, B:P3-024 | Endrede testregler (nov. 2021); kjøretidslettelser juli 2021–feb. 2022 | behold | Fakta stemmer etter gov.uk. Nye testmoduler kom 15.11.2021. Kjøretidslettelser gjaldt 12.07.2021–09.01.2022 og 12.01–10.02.2022. **Tillegg:** en ny lettelse gjaldt fra april til 22.04.2022. Rapportens avsnitt 11–13 er ikke kontrollert (403). | gov.uk/government/publications/temporary-relaxation-of-the-enforcement-of-the-retained-eu-drivers-hours-rules-all-road-haulage-sectors-in-great-britain ; gov.uk/government/news/government-takes-further-action-to-tackle-hgv-driver-shortage |
| A:P3-029, B:P3-025 | Lav retensjon: utdannet kompetanse er ikke det samme som tilgjengelig arbeidskraft | behold | Komiteens sammendrag vektlegger å beholde sjåførene («retaining the drivers we train»). Ordrett «retention rate … is low» er ikke kontrollert (403). Påstanden er en tolkning. | shorthandstories-URL over |
| A:P3-024, B:P3-026 | EFRA: mangel på dyktige slaktere ga oppstuving og avliving av gris | behold | HC 713, 06.04.2022. Utdrag av rapportteksten: 35 000 griser avlivet på grunn av mangel på slaktere, og en kø på ca. 150 000 griser (NPA, jan. 2022). Ordrett «a lack of skilled butchers» og avsnitt 13–15 er ikke kontrollert (PDF/HTML 403). | websøk mot publications.parliament.uk/pa/cm5802/cmselect/cmenvfru/713/report.html ; thegrocer.co.uk |
| A:P3-025, B:P3-027 | 115 av 800 slaktervisum utstedt; NPA kritiserte at rekrutteringsoperatørene ikke var spesialister | behold | Utdrag av rapportteksten: 800 visum tilbudt, «only 115 were issued». NPA: operatørene var «none of whom were specialists in recruiting butchers». Relevant for K1: ikke alle søkere hadde nødvendige ferdigheter. Merk at statsråden i des. 2021 oppga under 100 *søknader*, altså et annet tidspunkt og mål. Table 2 og avsnitt 28–31 er ikke kontrollert. | samme |
| A:P3-026, B:P3-028 | Christchurch: frivillige kokker manglet kjennskap til mattrygghetskrav | behold | Mat ved velferdssentre ble laget av folk «not usually involved in the food industry and therefore not aware of food safety requirements». WPSAR 3(2):24–29, 2012. Forfatter: S. Johnston, MPI. | https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1 (PMC ga captcha) |
| A:P3-027, B:P3-029 | Sjekklister fra 2010 gjenbrukt; papirråd via butikker | behold | Kilden nevner «checklists and principles developed in the first response». Flygeblader ble delt ut via supermarkeder fordi mange ikke nådde nettsider under strømbruddene. | samme |
| A:P3-028, B:P3-030 | Erfaring fra 2010 ga forventning om trygt vann i 2011 | behold | Kilden sier at mange hadde «an expectation that water would be safe (because it had proven safe in the first event)». | samme |

## 4. CSV

```csv
id_unik,dom,rettelse,url_kontrollert,kommentar
A:P3-001,rett,"Lokator: s. 83 (ikke s. 84–85)",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"Sitat ordrett; gjelder særlig frukt og grønt"
B:P3-001,rett,"Lokator: s. 83 (ikke s. 84–85)",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"Sitat ordrett"
A:P3-002,rett,"Lokator: s. 83 (ikke s. 84)",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"Bøndenes protest; bondesitat fra Bondebladet 2020"
B:P3-002,rett,"Lokator: s. 83 (ikke s. 84)",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"Sitat ordrett"
A:P3-003,rett,"Lokator: s. 83",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"31.03.2020 og videreført 2021 bekreftet"
B:P3-003,rett,"Lokator: s. 83; innreiseunntak kom ikke senere: EU/EØS-unntak 30.03.2020, utvidet 09.04 og 06.05.2020",https://www.ijsaf.org/index.php/ijsaf/article/download/571/420,"Dagpengeordning 31.03.2020"
B:P3-004,rett,"Kilden sier 'processing plants and demersal fisheries' (to grupper), ikke landbasert bunnfiskforedling",https://api.openalex.org/works/doi:10.1080/08920753.2026.2713824,"Artikkel finnes: Thorvaldsen, Lilleng, Myhre, Størkersen; Coastal Management 05.08.2026; tandfonline 403, sammendrag via OpenAlex"
B:delA-eksport,behold,"",https://api.openalex.org/works/doi:10.1051/alr/2022017,"Asche mfl. 2022 Aquatic Living Resources 35:15; 'not been impacted ... to any measurable extent'; mangler i CSV"
A:P3-004,ikke_verifisert,"",https://onlinelibrary.wiley.com/doi/10.1111/soru.12443,"Wiley 403 på doi/full/abs/epdf/pdfdirect; medier gir 142 positive og ca. 800 i isolasjon, men artikkeltekst ikke sett"
B:P3-005,ikke_verifisert,"",https://onlinelibrary.wiley.com/doi/10.1111/soru.12443,"Som A:P3-004; flytting til Jylland omtalt i TV2 Øst, ikke kontrollert i artikkelen"
A:P3-005,behold,"",https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.750598/full,"once-a-week pick-up i Tuusula; cooked, chilled, distributed frozen"
B:P3-006,behold,"",https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.750598/full,"Studien dekker fem land"
A:P3-006,behold,"",https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.750598/full,"Table 7 bekreftet"
B:P3-007,rett,"Lokator: Table 7 (Introduced solutions), ikke løpende tekst",https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2021.750598/full,"Innhold stemmer"
A:P3-007,behold,"",https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2021.635859/full,"DK: færre turer og mer mat med lang holdbarhet; studien gjelder DK, DE, SI"
B:P3-008,behold,"",https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2021.635859/full,""
A:P3-008,behold,"",https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2021.635859/full,"Ingen ferdighetsmåling"
B:P3-009,behold,"",https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2021.635859/full,"Ingen ferdighetsmåling"
A:P3-009,behold,"",https://www.luke.fi/en/news/exceptionally-high-pressure-to-raise-the-price-of-food,"Over en tredel fra Russland; stans tidlig i mars 2022"
B:P3-010,behold,"",https://www.luke.fi/en/news/exceptionally-high-pressure-to-raise-the-price-of-food,""
A:P3-010,behold,"",https://www.luke.fi/en/news/exceptionally-high-pressure-to-raise-the-price-of-food,"Lagre svært lave etter høsten 2021"
B:P3-011,behold,"",https://www.luke.fi/en/news/exceptionally-high-pressure-to-raise-the-price-of-food,""
A:P3-011,behold,"",https://www.luke.fi/en/statistics/indicators/cap-indicators/nitrogen-and-phosphorus-balance,"Datoer 2015-09-28 / 2026-02-18 bekreftet"
A:P3-012,behold,"",https://www.yara.com/corporate-releases/yara-implements-further-production-curtailments-in-europe/,"around 35%; 25.08.2022"
B:P3-012,behold,"",https://www.yara.com/corporate-releases/yara-implements-further-production-curtailments-in-europe/,""
A:P3-013,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,"700 av 800; 02.07.2021"
B:P3-013,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,"Kilden sier 'its 800 stores', ikke 'rundt 800'"
A:P3-014,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,"Seks dager ordrett bekreftet"
B:P3-014,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,""
A:P3-015,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,""
B:P3-015,behold,"",https://www.truesec.com/cases/back-in-business-after-the-largest-ransomware-attack-of-all-time,""
A:P3-016,behold,"",https://link.springer.com/article/10.1007/s11069-020-04240-0,"4.59 ± 2.72 (95 %) mot måneden før; normal igjen måneden etter"
B:P3-016,behold,"",https://link.springer.com/article/10.1007/s11069-020-04240-0,"CSV-verdi 4.59 stemmer"
B:delA-strom,rett,"Rett 'omtrent fem prosent' til 4,6 % (4,59 ± 2,72)",https://link.springer.com/article/10.1007/s11069-020-04240-0,"B del A og C"
A:P3-017,behold,"",https://link.springer.com/article/10.1007/s11069-020-04240-0,"Sitat i Discussion and conclusions"
B:P3-017,behold,"",https://link.springer.com/article/10.1007/s11069-020-04240-0,""
A:P3-018,behold,"",https://ejournals.is/index.php/irpa/article/view/b.2011.7.2.1/pdf_217,"Sitat s. 499; bygger på mediekilde"
B:P3-018,behold,"",https://ejournals.is/index.php/irpa/article/view/b.2011.7.2.1/pdf_217,""
A:P3-019,behold,"",https://ejournals.is/index.php/irpa/article/view/b.2011.7.2.1/pdf_217,"s. 499"
B:P3-019,behold,"",https://ejournals.is/index.php/irpa/article/view/b.2011.7.2.1/pdf_217,""
A:P3-020,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,"Unntaket vedtatt av Teollisuusliitto 26.03"
B:P3-020,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,""
A:P3-021,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,"Publisert 11.04.2024"
B:P3-021,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,""
A:P3-030,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,""
B:P3-022,behold,"",https://www.huoltovarmuuskeskus.fi/en/a/impact-of-the-ongoing-industrial-action-on-security-of-supply-assessment-5-april-2024,""
A:P3-022,behold,"",https://ukparliament.shorthandstories.com/road-freight-supply-chain-transport-report/index.html,"HC 162, 01.06.2022; rapport-PDF 403, sitat og avsnitt ikke kontrollert"
B:P3-023,behold,"",https://ukparliament.shorthandstories.com/road-freight-supply-chain-transport-report/index.html,"Som A:P3-022"
A:P3-023,behold,"",https://www.gov.uk/government/publications/temporary-relaxation-of-the-enforcement-of-the-retained-eu-drivers-hours-rules-all-road-haulage-sectors-in-great-britain,"Testmoduler 15.11.2021; kjøretid 12.07.2021–09.01.2022 og 12.01–10.02.2022, ny lettelse til 22.04.2022; rapportavsnitt ikke kontrollert"
B:P3-024,behold,"",https://www.gov.uk/government/publications/temporary-relaxation-of-the-enforcement-of-the-retained-eu-drivers-hours-rules-all-road-haulage-sectors-in-great-britain,"Som A:P3-023"
A:P3-029,behold,"",https://ukparliament.shorthandstories.com/road-freight-supply-chain-transport-report/index.html,"Retensjon bekreftet som tema; ordrett sitat ikke kontrollert"
B:P3-025,behold,"",https://ukparliament.shorthandstories.com/road-freight-supply-chain-transport-report/index.html,""
A:P3-024,behold,"",https://publications.parliament.uk/pa/cm5802/cmselect/cmenvfru/713/report.html,"Via søkeutdrag (403): 35 000 griser avlivet pga. mangel på slaktere; kø ca. 150 000"
B:P3-026,behold,"",https://publications.parliament.uk/pa/cm5802/cmselect/cmenvfru/713/report.html,"Som A:P3-024"
A:P3-025,behold,"",https://publications.parliament.uk/pa/cm5802/cmselect/cmenvfru/713/report.html,"Via søkeutdrag (403): 800 tilbudt, 115 utstedt; NPA-sitat ordrett; Table 2 ikke kontrollert"
B:P3-027,behold,"",https://publications.parliament.uk/pa/cm5802/cmselect/cmenvfru/713/report.html,"Som A:P3-025"
A:P3-026,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,"WPSAR 3(2):24–29; PMC ga captcha"
B:P3-028,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,""
A:P3-027,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,"Flygeblader via supermarkeder pga. strømbrudd"
B:P3-029,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,""
A:P3-028,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,""
B:P3-030,behold,"",https://ojs.wpro.who.int/ojs/index.php/wpsar/article/download/143/112?inline=1,""
```

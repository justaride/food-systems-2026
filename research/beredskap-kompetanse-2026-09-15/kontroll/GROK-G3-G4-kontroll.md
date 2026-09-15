# Kontroll av Grok-leveransen: G3 (K1) og G4 (K3)

Kontrollert 15. september 2026 mot primærkildene. Verktøy: WebFetch og WebSearch, SSB-API med curl, og `pdftotext` på PDF-er som WebFetch lastet ned. Den innebygde nettleseren ble prøvd for dsb.no, men viste innhold fra andre faner og ble ikke brukt som kilde. Sitater er korte utdrag.

Grunnlag: del D i `Grok-leveranse-beredskap-kompetanse-2026-09-15.md`, `g3/claims.csv`, `g4/claims.csv` og G3/G4-rapportene.

## 1. Oppsummering

**28 påstander kontrollert:** 19 behold, 8 rett, 0 forkast, 1 ikke_verifisert.

- 18 rader fra del D (10 G3 og 8 G4)
- 10 påstander fra del A–C (94 %, 52 %, konverteringslisten, DSB mot SPEK)

**Viktigste funn**

1. **Tallene i G3 holder.** SSB 05977, Jordbruksverket, Luke, Statistics Finland, Livsmedelsföretagen og Fødevarestyrelsen stemmer med kildene. DSB-tallet 70 % for 2023 er bekreftet i tidsserien i DSBs rapport fra 2026.
2. **Feil kildeoppgivelse for 30 000 sesongarbeidere (G3-NO-001).** DOI-en peker til Jakobsen og Sæther, NJMR 13(2), 2023. Grok oppgir «2022», «Rye m.fl.» og år 2020. Artikkelen oppgir ingen kilde eller år for anslaget. Sitatet er ordrett.
3. **Konverteringslisten overdriver.** Ingen av de åtte casene dokumenterer at mottakeren faktisk *brukte* forskningen. Tre er dokumenterte oppdrag: IFRO for Fødevarestyrelsen, Oslo Economics med NIBIO og SINTEF Ocean for NFD, og LbhÍ for det islandske departementet. To gjelder forventet eller planlagt bruk (FORCE og ARMAS). Tre er feil beskrevet:
   - **NIBIO→LMD:** NIBIO startet arbeidet selv, og LMD omtalte bare rapporten.
   - **LoMaTo→Forsvaret:** et forprosjekt som kartlegger hindringer.
   - **Gene2Bread:** kunnskapsutveksling med industrien, ikke implementering.
4. **Kilde-ID-ene i del A punkt 8 passer ikke.** G4-FI-001 (TREFORM) og G4-SE-001 (SLU i fem sentre) dokumenterer ikke konvertering.
5. **DSB mot SPEK er ikke en ekte motstrid.** SPEK skrev 2.12.2024 at norske myndigheter anbefaler tre dager. Det var utgått, for DSB endret rådet til én uke i 2024. SPEKs Norge-opplysning skal ikke beholdes som en likeverdig versjon.
6. **Formfeil i del D.** G3-DK-001 har forskjøvne kolonner. I G3-NO-009 er kommentaren kuttet, fordi kommaet i «±1,4–3,2» deler feltet. I G4-IS-001 står det at oppdraget er oppgitt «ifølge Matís», men Matís-artikkelen nevner ikke departementet.

## 2. Motstrid med KUNNSKAPSGRUNNLAG.md

| Tema | Grok | Kunnskapsgrunnlaget (KG) | Vurdering |
|---|---|---|---|
| Gjennomsnittsalder NO | 53 år (SSB 05977, 2025) | 53,3 for menn og 50,0 for kvinner (Resultatkontrollen 2026) | **Ikke motstrid.** SSB-tabellen runder til hele år: alle 53, menn 53, kvinner 50. Resultatkontrollen oppgir desimaler per kjønn. |
| Antall personlige brukere NO | 34 628 (SSB 05977, 2025) | 34 603 (Resultatkontrollen, tabell 5-20) | **Liten avvik fra ulike kilder.** Oppgi kilde ved bruk og ikke bland de to tallene. |
| DSB tørrmat | 70 % (data 2023) | 74 % (data 2025) | **Ulike år i samme serie.** DSB 2026 viser 70 % (2023), 65 % (2024) og 74 % (2025). Grok bruker eldre data. |
| DSB «lite/ikke forberedt» | 52 % på tre døgn (data 2023) | Ikke med i KG | Fra 2024 gjelder spørsmålet én uke. For 2025 er litt eller ikke forberedt 40 + 12 = 52 %, men for **én uke**. Samme tall, ulikt mål, så de må ikke blandes. Tidsserien for 2023 gir 38 + 15 = 53 % (avrundet). |
| Finske utenlandske ansatte | Ca. 16 000, herav ca. 2 600 faste og 13 200 korttids (2023) | Ca. 23 % utenlandsandel blant faste (2 600 av litt over 11 000) | **Ikke motstrid.** Samme Luke-kilde, men Grok bruker antall og KG andel. «Short-term» er ikke det samme som sesongarbeid. |
| NJMR-artikkel | «NJMR 2022 (Rye m.fl.)» med DOI njmr.485 | KG bruker Slettebak og Rye, NJMR 12(4), 2022 | **Artikler forvekslet.** DOI njmr.485 er Jakobsen og Sæther 2023, og det er den som har 30 000-sitatet. |
| Svensk alder | 48 % av foretakene har bruker over 60 år (LBR 2025) | Over 40 % av innehaverne er minst 65 år (Sysselsättning 2023) | **Ulike mål og år.** Ikke motstrid. |
| Ukesråd NO | Én uke, ingen dato oppgitt | Én uke, «mai 2024» ikke verifisert | Samsvar. |

## 3. Tabell

| id | påstand (kort) | dom | hva kilden faktisk sier / rettelse | URL brukt |
|---|---|---|---|---|
| G3-NO-001 | Ca. 30 000 internasjonale sesongarbeidere på norske gårder per sesong | rett | Sitatet er ordrett, og «Central and Eastern Europe» og hagebruk nevnes. Men artikkelen er Jakobsen og Sæther, NJMR 13(2), **2023**, ikke 2022 eller «Rye m.fl.». Anslaget har verken kilde eller år i teksten, så «2020» skal fjernes. | https://journal-njmr.org/articles/485 |
| G3-NO-004 | Gjennomsnittsalder 53 år i 2025, 34 628 brukere | behold | SSB 05977, «I alt» 2025: 34 628 brukere, gjennomsnittsalder 53. Menn 53, kvinner 50. Tallet for 2024 var 34 741. | https://data.ssb.no/api/v0/no/table/05977 |
| G3-NO-007 | DSB anbefaler å klare seg selv i én uke | behold | Kilde-URL ga 403, og nettleseren leste ikke siden. Rådet er bekreftet i DSB-brosjyren «Egenberedskap for én uke» og i DSB 2026, der spørsmålet ble endret fra tre dager til én uke i 2024. | dsb.no/…/dsb-egenberedskap-bokmal-uu-web_ny.pdf; dsb.no/…/befolkningsunderokelse-egenberedskap-2026.pdf |
| G3-NO-009 | 70 % hadde tørrmat eller boksmat for noen dager (data 2023) | behold | 2024-rapporten ga 403. Tidsserien i DSB 2026 (s. 19) viser 70 % (2023), 65 % (2024) og 74 % (2025). Kommentarfeltet i del D er kuttet av et komma. | dsb.no/…/befolkningsunderokelse-egenberedskap-2026.pdf |
| G3-SE-003 | 48 % av 54 723 foretak har bruker over 60 år, drøyt 4 % under 35 | behold | Ordrett i kilden. | jordbruksverket.se/…/2026-06-05-generationsvaxling-2026 |
| G3-SE-004 | Knapt en fjerdedel av brukere 60–80 år har etterfølger klar | behold | 24 %. Utvalg 2 013, ca. 1 300 svar, svarprosent ca. 60. Populasjonen på 11 198 ble ikke kontrollert. | samme |
| G3-SE-007 | Vanskeligste kompetanser: spesialister, prosessteknikk, automasjon, vedlikehold, elektriker | behold | Står i kilden: «specialiserad kunskap inom produktion … processteknik, automation, underhåll/mekaniker och industrielektriker». | livsmedelsforetagen.se/…/svensk-livsmedelsindustri-behover-20-000-nya-medarbetare-till-2028/ |
| G3-FI-002 | Nesten 16 000 utenlandske ansatte, ca. 2 600 faste og 13 200 korttids (2023) | behold | Ordrett i kilden, publisert 28.2.2025. | luke.fi/…/agricultural-and-horticultural-labour-force-2023 |
| G3-FI-004 | Gjennomsnittsalder 55 år i 2024, 35 910 aktive foretak | behold | Ordrett i kilden, publisert 25.3.2026. | https://stat.fi/en/publication/cmfxn8zwtac8707utcdy2yq08 |
| G3-DK-001 | Fødevarestyrelsen: klare seg i tre døgn | rett | Innholdet stemmer: «Myndighederne anbefaler, at du og din familie kan klare jer i tre døgn». **Raden må rettes**: `aar` mangler, så kolonnene fra `kilde_url` og utover står ett felt for tidlig. `status` har fått verdien «primær», og «lest_i_kilde» er havnet under `relevans`. | foedevarestyrelsen.dk/…/forberedt-paa-kriser |
| G4-NO-002 | FeedLoop (NMBU, NFR), Tolga og Steinkjer, 2025–2027 | behold | 1.1.2025–31.12.2027, Forskningsrådet, Tolga og Steinkjer, mindre konkurranse mellom fôr og mat. | https://www.nmbu.no/en/research/projects/feedloop |
| G4-NO-007 | ResNor (NFR, 2025–2029, ledet av UiT, Nofima partner): matproduksjon og matsikkerhet i Nord-Norge | rett | Innholdet stemmer: april 2025–mars 2029, Forskningsrådet, UiT leder. Sitatet «strengthen food production and food security in Northern Norway» står ikke ordrett. Siden sier «generate knowledge that is important for food production, food security, and public health». | nofima.com/projects/resilient-north-… |
| G4-SE-001 | SLU er akademisk partner i alle fem Formas-sentre | behold | «SLU medverkar som akademisk partner i alla fem» (13.12.2024). Sentrene er PLATE, Food Defence, PLENTY, AgroDrive og FORCE. | slu.se/nyheter/2024/12/slu-medverkar-i-fem-nya-centrumbildningar/ |
| G4-SE-007 | AgroMixNorth (NordForsk 2023–2026), prosjektleder Anke Herrmann, SLU | behold | Bekreftet. | nordforsk.org/projects/climate-smart-resilience-… |
| G4-FI-001 | TREFORM (Luke, Finlands akademi, 2020–2023) med anbefalinger for beslutninger | behold | 1.11.2020–30.11.2023, med «recommendations for short and long term decision-making». Siden viser ikke at anbefalingene er tatt i bruk. | https://www.luke.fi/en/projects/treform |
| G4-FI-003 | SecureFood (HE 101136583, 2024–2027) med Luke som partner, EU-bidrag ca. 8 M€ | behold | 1.1.2024–30.6.2027, EU-bidrag 7 999 093,75 €. Luke deltar med 363 750 €. Koordinator er European Dynamics Luxembourg. | https://cordis.europa.eu/project/id/101136583 |
| G4-DK-001 | Danske miljøer kan være partnere, ikke prosjekteier | behold | FAQ: «the project owner cannot be from Denmark». Alle partnere kan få finansiering. | nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security |
| G4-IS-001 | LbhÍ-rapporten for departementet; Matís: islandsk korn til mat ca. 1 % | rett | 1 %-tallet står i Matís-artikkelen (7.4.2021), men **Matís nevner ikke departementet**. Oppdraget står i selve rapporten (Rit LbhÍ nr. 139, 2021): «Verkefnið var unnið fyrir atvinnuvega- og nýsköpunarráðuneytið». Rapporten kom i februar 2021 under en tjenesteavtale for 2020–2023. Oppdraget er dokumentert. At departementet brukte rapporten, er ikke. | matis.is/en/frettir/…; stjornarradid.is/…/Fæðuöryggi á Íslandi lokaskýrsla.pdf |
| G3-SE-006 | Livsmedelsföretagen: 94 % har vanskelig for å rekruttere | behold | «94 procent … svårt att hitta och rekrytera rätt kompetens». Enkät i mars 2023 med 134 av 800 medlemsbedrifter (69 % av de ansatte), vektet. Det er bransjeorganisasjonens egen selvrapportering. | livsmedelsforetagen.se/… (samme) |
| G3-NO-012 | DSB 2023: 52 % er litt eller ikke forberedt på tre døgn | ikke_verifisert | 2024-rapporten ga 403 med både WebFetch og curl, og nettleseren leste ikke dsb.no. DSB 2026 (s. 18) viser for 2023 38 % litt og 15 % ikke forberedt, altså 53 % av avrundede tall. Over halvparten stemmer. 52 % for 2025 gjelder én uke og må ikke blandes med dette. | dsb.no/…/rapport-om-husholdningers-egenberedskap-2024/ (403); dsb.no/…/befolkningsunderokelse-egenberedskap-2026.pdf |
| G4-NO-008 | Konvertering NIBIO→LMD | rett | NIBIO satte selv ned arbeidsgruppen: «Derfor bestemte vi oss for å sette ned en arbeidsgruppe» (NIBIO 28.09.2021). LMD omtalte rapporten 30.09.2021. Det er ikke oppdrag, og bruk er ikke dokumentert. Skriv «departementet omtalte», ikke «konvertering». | regjeringen.no/…/id2873090/; nibio.no/nyheter/norsk-matsikkerhet-i-en-ustabil-verden |
| G4-NO-009 | NIBIO og SINTEF Ocean→NFD: bestilt analyse av forsyningskjeder 2023 | behold | Oslo Economics laget rapporten «på oppdrag fra» NFD, i samarbeid med NIBIO, SINTEF Ocean og NUPI (11.10.2023). NIBIO og SINTEF var samarbeidspartnere, ikke oppdragstakere. Oppdraget er dokumentert, bruken er ikke. | regjeringen.no/…/id2999602/ |
| G4-NO-012 | Konvertering SINTEF LoMaTo→Forsvaret/Ørland | rett | Intensjonsavtalen fra 2024 er bekreftet. Den ble signert av Ørland flystasjon, Ørland kommune, Statsforvalteren i Trøndelag, Trøndelag fylkeskommune og Trøndelag Bondelag. Men artikkelen kaller LoMaTo et forprosjekt som finner hindringer. Forsvarets bruk er ikke dokumentert. | sintef.no/siste-nytt/2026/-lokalprodusert-mat-til-forsvaret-er-den-nye-beredskapen/; sintef.no/publikasjoner/…119a00bdfa5c/ |
| G4-DK-002 | Konvertering KU/IFRO→Fødevarestyrelsen | behold | Yu og Jensbye 2024, IFRO Commissioned Work 2024/06, «Commissioning body: Danish Veterinary and Food Administration». Oppdraget er dokumentert, bruken er ikke. | researchprofiles.ku.dk/…/food-security-in-denmark-a-data-driven-assessment/ |
| G4-SE-004 | FORCE: Länsstyrelsen Skåne venter bidrag til försörjnings- och förmågeplanering | behold | Utsagnet står på force-sweden.se, og Länsstyrelsen Skåne står i partnerlisten. Det viser **forventet** bruk. Del A kaller det «dokumentert konvertering», og det er for sterkt. | https://force-sweden.se/ |
| TEKST-1 | Gene2Bread→industri: «formell verdikjedeimplementering» (G4 §8) | rett | Prosjektet er bekreftet (G4-NO-003): 1.4.2024–3.3.2028 ifølge siden, FFL/JA, Nofima leder, og industripartnere som Norgesmøllene, Bakehuset og Orkla. Siden beskriver «active knowledge exchange within the value chain», altså kunnskapsutveksling. Implementering er ikke dokumentert. | https://www.nmbu.no/en/research/projects/gene2bread |
| G4-FI-004 | ARMAS: kompetanse og planleggingsverktøy for matforsyning, utrulling | behold | 1.9.2024–31.12.2027, Ruralia i Mikkeli, finansiert av Häme ELY. Prosjektet «tuottaa elintarvikkeiden huoltovarmuussuunnittelun työvälineitä». Verktøyene er **planlagte**, og bruk er ikke dokumentert. | researchportal.helsinki.fi/fi/projects/huoltovarmuutta-ja-resilienssia-ruokajarjestelmaan-2/ |
| TEKST-2 | «DSB: én uke» mot «SPEK: tre dager», der Grok vil beholde begge | rett | SPEK (2.12.2024): «The Finnish, Danish and Norwegian authorities recommend a supply of three days». For Norge var det utgått, for DSB endret rådet til én uke i 2024 (DSB 2026, s. 18). Dette er en feil hos SPEK, ikke en motstrid. Bruk DSB og dropp SPEKs Norge-opplysning. | epressi.com/tiedotteet/turvallisuus/many-finns-are-missing-the-most-crucial-emergency-supply.html |

## 4. CSV

```csv
id,dom,rettelse,url_kontrollert,kommentar
G3-NO-001,rett,"Forfattere Jakobsen og Sæther, NJMR 13(2), 2023; anslaget har ingen kilde eller år i artikkelen, fjern år 2020 og 'Rye m.fl.'",https://journal-njmr.org/articles/485,"Sitatet er ordrett; Central and Eastern Europe og hagebruk nevnes; KG bruker en annen artikkel (Slettebak og Rye 2022)"
G3-NO-004,behold,,https://data.ssb.no/api/v0/no/table/05977,"I alt 2025: 34628 brukere, snitt 53 (menn 53, kvinner 50); 2024: 34741"
G3-NO-007,behold,,https://www.dsb.no/siteassets/sikkerhverdag/egenberedskap/brosjyren/dsb-egenberedskap-bokmal-uu-web_ny.pdf,"Kilde-URL ga 403; brosjyren Egenberedskap for én uke og DSB 2026 s. 18 bekrefter endringen fra tre dager til én uke i 2024"
G3-NO-009,behold,,https://www.dsb.no/siteassets/rapporter-og-publikasjoner/rapporter/befolkningsunderokelse-egenberedskap-2026.pdf,"2024-rapporten ga 403; tidsserie s. 19: 70 (2023), 65 (2024), 74 (2025); kommentarfeltet i del D er kuttet av komma"
G3-SE-003,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2026-06-05-generationsvaxling-2026,Ordrett
G3-SE-004,behold,,https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2026-06-05-generationsvaxling-2026,"24 %; utvalg 2013, ca. 1300 svar, ca. 60 %; populasjon 11198 ikke kontrollert"
G3-SE-007,behold,,https://www.livsmedelsforetagen.se/nyheter/svensk-livsmedelsindustri-behover-20-000-nya-medarbetare-till-2028/,Ordrett
G3-FI-002,behold,,https://www.luke.fi/en/statistics/agricultural-and-horticultural-labour-force/agricultural-and-horticultural-labour-force-2023,"Ordrett; publisert 28.2.2025; short-term er ikke det samme som sesong"
G3-FI-004,behold,,https://stat.fi/en/publication/cmfxn8zwtac8707utcdy2yq08,"Ordrett; 25.3.2026"
G3-DK-001,rett,"Rett kolonneforskyvning: aar mangler, så kilde_url og feltene etter står ett felt for tidlig; status skal være lest_i_kilde",https://foedevarestyrelsen.dk/kost-og-foedevarer/foedevaresikkerhed/foedevareberedskab/forberedt-paa-kriser,"Innholdet stemmer: myndighederne anbefaler tre døgn"
G4-NO-002,behold,,https://www.nmbu.no/en/research/projects/feedloop,"1.1.2025–31.12.2027; NFR; Tolga og Steinkjer"
G4-NO-007,rett,"Sitatet er ikke ordrett; kilden sier: generate knowledge that is important for food production, food security, and public health",https://nofima.com/projects/resilient-north-food-production-food-safety-and-public-health-in-northern-norway/,"April 2025–mars 2029; NFR; UiT leder; innholdet stemmer"
G4-SE-001,behold,,https://www.slu.se/nyheter/2024/12/slu-medverkar-i-fem-nya-centrumbildningar/,"13.12.2024; fem sentre bekreftet"
G4-SE-007,behold,,https://nordforsk.org/projects/climate-smart-resilience-through-diversified-cropping-systems-identifying-springboards,Bekreftet
G4-FI-001,behold,,https://www.luke.fi/en/projects/treform,"1.11.2020–30.11.2023; Finlands akademi; anbefalinger, ikke dokumentert bruk"
G4-FI-003,behold,,https://cordis.europa.eu/project/id/101136583,"EU-bidrag 7999093,75 EUR; Luke 363750 EUR; koordinator European Dynamics Luxembourg"
G4-DK-001,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,"FAQ: project owner cannot be from Denmark; danske partnere kan finansieres"
G4-IS-001,rett,"Oppdraget står i rapporten (Rit LbhÍ nr. 139, 2021: unnið fyrir atvinnuvega- og nýsköpunarráðuneytið), ikke i Matís-artikkelen",https://www.stjornarradid.is/library/01--Frettatengt---myndir-og-skrar/ANR/KThJ/F%C3%A6%C3%B0u%C3%B6ryggi%20%C3%A1%20%C3%8Dslandi%20lokask%C3%BDrsla.pdf,"1 % bekreftet i Matís 7.4.2021; tjenesteavtale ANR og LbhÍ 2020–2023; bruk ikke dokumentert"
G3-SE-006,behold,,https://www.livsmedelsforetagen.se/nyheter/svensk-livsmedelsindustri-behover-20-000-nya-medarbetare-till-2028/,"94 % svårt att hitta och rekrytera rätt kompetens; 134 av 800, vektet; selvrapportert"
G3-NO-012,ikke_verifisert,,https://www.dsb.no/siteassets/rapporter-og-publikasjoner/rapporter/rapport-om-husholdningers-egenberedskap-2024/,"403 med WebFetch og curl; nettleseren leste ikke dsb.no; DSB 2026 s. 18 for 2023: 38+15=53 % (avrundet); 52 % i 2025 gjelder én uke"
G4-NO-008,rett,"Ikke oppdrag og ikke dokumentert bruk: NIBIO satte selv ned arbeidsgruppen, og LMD omtalte rapporten 30.09.2021",https://www.nibio.no/nyheter/norsk-matsikkerhet-i-en-ustabil-verden,"Også https://www.regjeringen.no/no/dokumentarkiv/regjeringen-solberg/aktuelt-regjeringen-solberg/lmd/nyheter/2021/sept-21/norsk-matsikkerhet-i-en-ustabil-verden/id2873090/"
G4-NO-009,behold,,https://www.regjeringen.no/no/dokumenter/en-gjennomgang-av-sarbarheten-i-globale-forsyningskjeder-for-matvarer/id2999602/,"Oslo Economics på oppdrag fra NFD i samarbeid med NIBIO, SINTEF Ocean og NUPI; 11.10.2023; bruk ikke dokumentert"
G4-NO-012,rett,"Konvertering til Forsvaret er ikke dokumentert; LoMaTo er et forprosjekt som kartlegger hindringer for intensjonsavtalen",https://www.sintef.no/siste-nytt/2026/-lokalprodusert-mat-til-forsvaret-er-den-nye-beredskapen/,"Avtale 2024: Ørland flystasjon, Ørland kommune, Statsforvalteren i Trøndelag, Trøndelag fylkeskommune, Trøndelag Bondelag; rapport 2026-00211 (21.04.2026)"
G4-DK-002,behold,,https://researchprofiles.ku.dk/en/publications/food-security-in-denmark-a-data-driven-assessment/,"IFRO Commissioned Work 2024/06; oppdrag fra Fødevarestyrelsen; bruk ikke dokumentert"
G4-SE-004,behold,,https://force-sweden.se/,"Forventet bruk, ikke dokumentert; del A kaller det dokumentert konvertering, og det er for sterkt"
TEKST-1,rett,"Gene2Bread: kunnskapsutveksling med industripartnere, ikke formell implementering i verdikjeden",https://www.nmbu.no/en/research/projects/gene2bread,"G4-NO-003 stemmer: 1.4.2024–3.3.2028, FFL/JA, Nofima leder, industripartnere bekreftet"
G4-FI-004,behold,,https://researchportal.helsinki.fi/fi/projects/huoltovarmuutta-ja-resilienssi%C3%A4-ruokaj%C3%A4rjestelm%C3%A4%C3%A4n-2/,"1.9.2024–31.12.2027; Häme ELY; verktøy og utrulling er planlagt; bruk ikke dokumentert"
TEKST-2,rett,"Ikke motstrid: SPEK 2.12.2024 oppga feilaktig tre dager for Norge; DSB endret til én uke i 2024; bruk bare DSB",https://www.epressi.com/tiedotteet/turvallisuus/many-finns-are-missing-the-most-crucial-emergency-supply.html,"Endringen er bekreftet i DSB 2026 s. 18"
```

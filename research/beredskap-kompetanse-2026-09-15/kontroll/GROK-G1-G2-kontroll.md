# Kontroll av Grok-leveransen: G1 (søknadsfit) og G2 (policy og mandat)

**Kontrollert:** 2026-09-15
**Grunnlag:** `research/_status/kompetanse-beredskap-2026-09-14/Grok-leveranse-beredskap-kompetanse-2026-09-15.md` (del D, pluss påstander i del A–C), `g1/claims.csv`, `g2/claims.csv`, `g6/claims.csv`
**Metode:** Hver påstand er sjekket mot kilde_url. Verktøy: WebFetch, innebygd nettleser (sidetekst) der WebFetch ga 403 (norden.org, government.se) eller tom side (NordForsk-portalen, Livsmedelsverket), og `pdftotext` på PDF-ene fra DSB og EU (Horizon Europe-arbeidsprogrammet). Ingen skjemaer, ingen innlogging, ingen kontakt.

---

## 1. Oppsummering

**Kontrollert:** 28 påstander. Det er de 20 G1/G2-radene i del D, pluss 8 påstander fra del A–C.

| Dom | Antall |
|---|---|
| behold | 22 |
| rett | 6 |
| forkast | 0 |
| ikke_verifisert | 0 |
| intern_kilde | 0 |

Ingen av påstandene i denne delen viser bare til prosjektets egne filer.

**Viktigste funn**

1. **Søknadsfakta holder.** Frist 02.12.2026 kl. 13:00, maks 15 MNOK samlet for de nordiske partnerne, Danmark kan ikke være prosjekteier, konsortiekrav og krav om ikke-akademisk partner står ordrett i utlysningen og portalteksten. Alle fristene for Horizon (11.05.2027 og 23.09.2027), Nordplus (01.02.2027) og Interreg Aurora (07.10.2026) stemmer.
2. **Karlstad-sitatet er ekte.** Formuleringen «sufficient labour with relevant education and skills» står i erklæringsteksten på norden.org. Siden kunne leses i nettleseren, selv om Grok skrev at den var blokkert. Men G2-NX-001 overdriver: erklæringen *uttrykker ambisjon*, den *forplikter* ikke. «Felles kunnskap» står i erklæringen, ikke i regeringen.se-artikkelen som G2-NX-001 viser til.
3. **2026-erklæringen er bekreftet,** både «not legally binding» og mulighetsstudien som rapporteres til NSSN i 2027. Men den handler om forsyningssikkerhet generelt, ikke om mat eller kompetanse. Den nevner verken arbeidskraft eller kompetanseutvikling, bare utveksling av erfaring på tvers av sektorer. Topp-10-funn nr. 10 bør derfor ikke antyde at *begge* erklæringene løfter arbeidskraft.
4. **Danmark må rettes.** Fødevarestyrelsen sender *én* forhåndsutpekt og utdannet forbindelsesoffiser til NOST-møter. Formuleringen «utdannede forbindelsesofficerer» i G2-tabellen i del C gir inntrykk av et større korps. (G2-DK-003 i CSV-en har riktig entall.)
5. **Mindre presiseringer:** NordForsk ber om *transdisiplinært* samarbeid med samfunns- og næringsaktører, ikke «tverrfaglig» (G1-NF-009). Sektoransvaret til Livsmedelsverket gjelder hele sektoren, mens samordningsansvaret gjelder leddene etter primærproduksjonen (G2-SE-001). HVK-teksten knytter «poolens veiledning» til bedriftenes egen beredskap, ikke til deltakelsen i opplæring (G2-FI-002). Horizon-arbeidsprogrammet er vedtatt 11.12.2025, og teksten bruker «Proposals should», ikke et hardt krav (G1-HE-001).
6. **Island og DSB holder.** Lov 82/2008 har fortsatt § 3 om birgðir og § 17 om øving i gjeldende versjon (157c, 01.09.2026). Grok brukte en eldre lovsamling (141b, 2013). DSB-veilederen sier at planen skal øves hvert annet år, i § 7 på s. 31 (versjon 2, september 2021). Kravet gjelder kommunens overordnede beredskapsplan generelt, ikke mat spesielt.

---

## 2. Tabell

| id | påstand (kort) | dom | hva kilden faktisk sier / rettelse | URL brukt |
|---|---|---|---|---|
| G1-NF-002 | NordForsk-frist 02.12.2026 13:00 CET | behold | «Call Deadline: 02.12.2026 13:00 (CET/Oslo Time)». Portalen sier det samme. | nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security; funding.nordforsk.org/#call/4685/main |
| G1-NF-004 | Maks 15 MNOK samlet for nordiske partnere | behold | FAQ: «The total budget for the Nordic partners. Not 15,0 million per partner.» | nordforsk.org (call-side, FAQ) |
| G1-NF-009 | Utvikle ny kunnskap og bygge forskningsekspertise gjennom tverrfaglig samarbeid | rett | Portalen: «promote transdisciplinary research collaboration between research groups and relevant societal and business actors». Rettelse: *transdisiplinært* samarbeid mellom forskergrupper og samfunns- og næringsaktører. | funding.nordforsk.org/#call/4685/main |
| G1-NF-016 | Interessenter og sluttbrukere i samutvikling og medledelse | behold | Ordrett i både utlysningen og portalen. | nordforsk.org; funding.nordforsk.org |
| G1-NF-017 | Ikke implementering/piloting; eier må være forskningsutførende organisasjon | behold | FAQ: «The call is not aimed at implementation or piloting.» Merk: svaret gjelder et spørsmål om sivilsamfunnsaktører som implementerer eller piloterer. Utlysningen omtaler seg selv som «research and innovation projects». | nordforsk.org (FAQ) |
| G1-NF-019 | Eier i NO, SE, FI, FO, IS, EE eller LT | behold | «based in one of the countries co-funding the call: Norway, Sweden, Finland, Faroe Islands, Iceland, Estonia or Lithuania». | funding.nordforsk.org |
| G1-NF-020 | DK kan være partner, ikke prosjekteier | behold | FAQ: «the project owner cannot be from Denmark». | nordforsk.org (FAQ) |
| G1-NF-023 | Minst tre nordiske land, eller to nordiske pluss EE/LT | behold | Ordrett i portalen. «Nordisk» omfatter DK, FI, IS, NO, SE, FO, GL og ÅL. | funding.nordforsk.org |
| G1-NF-025 | Minst én ikke-akademisk partner | behold | «at least one non-academic partner.» FAQ: én holder for hele konsortiet. | funding.nordforsk.org; nordforsk.org |
| G1-HE-001 | GOVERNANCE-01: kapasitetsbygging og «risk literacy»; frist 11.05.2027; ca. 6 mill. EUR | rett | Frist 11 May 2027, åpning 04 Feb 2027, «around EUR 6.00 million» per prosjekt og 12 mill. EUR totalt (RIA, multi-actor-krav): alt stemmer. Scope-punktet står ordrett under «Proposals should». Rettelser: (a) arbeidsprogrammet er vedtatt 11.12.2025 (C(2025) 8493), ikke 10.12.2025; (b) skriv «forventer» i stedet for «krever», fordi det er ett av flere scope-punkter; (c) målgruppen er «farmers and other relevant agri-food supply chain operators». | ec.europa.eu/…/wp-9-food-bioeconomy…_horizon-2026-2027_en.pdf (s. 309–310) |
| G2-NO-001 | Rådet for matvareberedskap er rådgivende organ og kriseorganisasjon for NFD | behold | Rådgivende organ for NFD ved beredskapsplanlegging og kriser, og NFDs kriseorganisasjon «innenfor sin sektor». Opprettet 2003. | regjeringen.no/…/radet-for-matvareberedskap/id2577746/ |
| G2-NO-003 | NOU: regionale kurs om totalforsvar for lokale og regionale ressurser | behold | NOU-en anbefaler at slike kurs tilbys «sentrale beredskapsressurser på lokalt og regionalt nivå». | regjeringen.no/no/dokumenter/nou-2023-17/id2982767/?ch=2 |
| G2-NO-009 | Kommunal beredskapsplan øves minst hvert annet år (§ 7, s. 31) | behold | § 7: «Kommunens beredskapsplan skal øves hvert annet år.» Veilederen: «øves minimum hvert annet år». Står på s. 31, versjon 2 (sept. 2021). Merk: kravet gjelder kommunens overordnede plan, ikke storkjøkken eller mat spesielt. | dsb.no/…/veileder_til_forskrift_om_kommunal_beredskapsplikt.pdf |
| G2-SE-001 | Livsmedelsverket er sektoransvarlig beredskapsmyndighet for matforsyning etter primærproduksjonen | rett | Livsmedelsverket er både beredskapsmyndighet og «sektorsansvarig myndighet» for hele sektoren «Livsmedelsförsörjning och dricksvatten», som også omfatter primærproduksjon og drikkevann. Avgrensningen «i leden efter primärproduktion» gjelder bare ansvaret for nasjonal samordning av krise- og beredskapsplanlegging. | livsmedelsverket.se/om-oss/livsmedelsverkets-beredskap |
| G2-SE-004 | Sektorens viktige samfunnsfunksjoner omfatter måltidsverksamhet | behold | «måltidsverksamhet» står i listen over de ti viktige samfunnsfunksjonene. | livsmedelsverket.se/beredskap/…/beredskapssektorn-livsmedelsforsorjning-och-dricksvatten |
| G2-SE-006 | SOU: ca. 3 mill. offentlige måltider per hverdag | behold | «Varje vardag serveras cirka tre miljoner måltider i skola, vård och omsorg.» (sammendraget) | riksdagen.se/…/livsmedelsberedskap-for-en-ny-tid_hcb38/html/ |
| G2-FI-001 | HVK-pooler arrangerer informasjons-, opplærings- og øvelsesarrangementer | behold | Ordrett: «tiedotus-, koulutus- ja harjoitustilaisuuksia». | huoltovarmuuskeskus.fi/huoltovarmuusorganisaatio/sektorit-ja-poolit |
| G2-FI-002 | Bedrifter deltar i poolens opplæring og planlegging etter poolens veiledning | rett | Kilden: bedriftene «osallistuvat poolin järjestämään koulutukseen ja suunnittelutyöhön sekä varautuvat poolin antamien ohjeiden mukaan». Rettelse: bedriftene deltar i opplæring og planlegging, *og* de innretter sin egen beredskap etter poolens veiledning. | huoltovarmuuskeskus.fi/…/sektorit-ja-poolit |
| G2-EU-001 | Preparedness Union Strategy 26.03.2025: 30 tiltak og preparedness by design | behold | «30 key actions» og en handlingsplan, pluss en «preparedness by design culture». Datert 26.03.2025. | civil-protection-humanitarian-aid.ec.europa.eu/…/eu-preparedness-union-strategy…2025-03-26_en |
| G2-NX-001 | Karlstad (19.06.2024) *forplikter* til dypere nordisk matberedskapssamarbeid og felles kunnskap | rett | Regeringen.se (publ. 20.06.2024) bekrefter «fördjupat nordiskt samarbete kring frågor gällande beredskap, robusthet och resiliens», men sier ingenting om kunnskap. Erklæringen på norden.org sier «strengthen and deepen our common knowledge and understanding» og kaller seg et uttrykk for «ambition». Rettelser: skriv «uttrykker ambisjon om», ikke «forplikter»; oppgi norden.org som kilde for «felles kunnskap»; erklæringen gjelder mat *og* skog. | regeringen.se/artiklar/2024/06/…; norden.org/en/deklaration/karlstad-declaration… |
| G1-HE-002 | CLIMATE-02: frist 23.09.2027 | behold | Opening 20 Apr 2027, deadline 23 Sep 2027, ca. 6 mill. EUR per prosjekt og 12 mill. EUR totalt, RIA. | ec.europa.eu/…/wp-9-…_en.pdf |
| G1-NP-001 | Nordplus 2027: åpner 02.11.2026, frist 01.02.2027 | behold | UHR: runden åpner 2. november 2026, siste søknadsdag 1. februar 2027. | uhr.se/…/nordplus/ |
| G1-IA-001 | Interreg Aurora Call 7 SSP og Call 9 REG, frist 07.10.2026 | behold | Åpne 7. sep.–7. okt. 2026, frist kl. 16.00 CET. SO 3.1 (bare Sápmi) og SO 4.1 er åpne. Prioritet 1 er stengt. | interregaurora.eu/projects/calls-for-applications/ |
| G6-NX-001 | Karlstad: «sufficient labour with relevant education and skills» | behold | Ordrett i erklæringsteksten: «We will work to ensure sufficient labour with relevant education and skills…». Vedtatt 19.06.2024 i Karlstad. Siden kunne leses i nettleseren. | norden.org/en/deklaration/karlstad-declaration-nordic-co-operation-preparedness-and-robustness-related-food |
| G6-NX-002 | Nordisk erklæring 02.09.2026 er ikke rettslig bindende | behold | «This declaration is not legally binding or intended to constitute an international agreement». Merk: erklæringen gjelder forsyningssikkerhet generelt og er signert av departementer for forsvar, beredskap og næring. Den er ikke matspesifikk. | government.se/statements/2026/09/joint-nordic-declaration-on-security-of-supply/ |
| G6-NX-003 | Mulighetsstudie 2027 | behold | En «feasibility study» skal rapporteres til NSSN «during 2027». En første felles rapport skal legges fram senest høsten 2027. | government.se/statements/2026/09/joint-nordic-declaration-on-security-of-supply/ |
| TEKST-1 | Island: lov 82/2008 om birgðir og æfingar (del C, G2-tabell; jf. G2-IS-002/-003) | behold | § 3: «nauðsynlegar birgðir til þess að tryggja lífsafkomu þjóðarinnar á hættutímum». § 17: planen «skal hún æfð eftir því sem frekast er kostur». § 21 og § 22 gjelder plikt til kurs og øvelser. Merk: Grok brukte lagasafn 141b (2013). Gjeldende versjon 157c (01.09.2026) har samme ordlyd og flere endringslover, sist 11/2026. | althingi.is/lagas/141b/2008082.html; althingi.is/lagas/nuna/2008082.html |
| TEKST-2 | Danmark: Fødevarestyrelsen og «utdannede forbindelsesofficerer» (del C, G2-tabell) | rett | Kilden: ved innkalling til NOST-møte sender FVST «en på forhånd udpeget og uddannet forbindelsesofficer (FO)». Rettelse: én forhåndsutpekt og utdannet forbindelsesoffiser til NOST ved behov, ikke flere. | foedevarestyrelsen.dk/om-os/…/foedevarestyrelsen-og-det-nationale-beredskab |

**Andre merknader (ikke egne dommer)**

- **Topp-10 nr. 10** knytter «arbeidskraft og kunnskapsdeling» til både Karlstad og 2026-erklæringen. Arbeidskraft står bare i Karlstad. 2026-erklæringen har bare «facilitate exchange of cross sectorial experience and dialogue», og nevner «a well-educated workforce» som et kjennetegn ved regionen, ikke som et mål.
- **G2-rapporten** siterer «exchange of experiences and knowledge» fra en «norsk omtale» av 2026-erklæringen. Den formuleringen finnes ikke i den offisielle engelske teksten.
- **Proveniensen for Karlstad er motstridende.** G2 sier at norden.org var blokkert, mens G6-NX-001 og G6-NX-009 har status `lest_i_kilde` mot norden.org. Teksten stemmer, men sporet bør ryddes. NordForsk-utlysningen viser selv til Karlstad-erklæringen i bakgrunnsteksten.
- **Merkingen av G2-NO-009** (verdikjedeledd «forbruk, storhusholdning og kjøkken») er misvisende, fordi DSB-kravet gjelder kommunens overordnede beredskapsplan generelt.

---

## 3. CSV

```csv
id,dom,rettelse,url_kontrollert,kommentar
G1-NF-002,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,Ordrett på call-siden og i portalen (funding.nordforsk.org/#call/4685/main)
G1-NF-004,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,FAQ: totalt for nordiske partnere; ikke per partner
G1-NF-009,rett,"Transdisiplinært (ikke tverrfaglig) forskningssamarbeid mellom forskergrupper og relevante samfunns- og næringsaktører, for å utvikle ny kunnskap og bygge forskningsekspertise",https://funding.nordforsk.org/#call/4685/main,Lest i portalen via nettleser
G1-NF-016,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,Ordrett også i portalen
G1-NF-017,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,FAQ-svaret gjelder spørsmål om sivilsamfunn som implementerer eller piloterer; utlysningen omtaler research and innovation projects
G1-NF-019,behold,,https://funding.nordforsk.org/#call/4685/main,Landlisten er ordrett; DK kan være co-host ved eier i EE/LT
G1-NF-020,behold,,https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security,FAQ ordrett; portalens landliste bekrefter
G1-NF-023,behold,,https://funding.nordforsk.org/#call/4685/main,Nordisk = DK FI IS NO SE FO GL ÅL
G1-NF-025,behold,,https://funding.nordforsk.org/#call/4685/main,FAQ: én ikke-akademisk partner holder for hele konsortiet
G1-HE-001,rett,"Arbeidsprogrammet er vedtatt 11.12.2025 (C(2025) 8493), ikke 10.12.2025; scope-punktet står under 'Proposals should' (forventning, ikke hardt krav); målgruppe: farmers and other relevant agri-food supply chain operators. Frist 11.05.2027, åpning 04.02.2027, ca. 6 mill. EUR per prosjekt, 12 mill. EUR totalt, multi-actor påkrevd: stemmer",https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-9-food-bioeconomy-natural-resources-agriculture-and-environment_horizon-2026-2027_en.pdf,PDF-tekst s. 309-310 og samletabell for Call 03 (2027)
G2-NO-001,behold,,https://www.regjeringen.no/no/dep/nfd/org/etater-og-virksomheter-under-narings--og-fiskeridepartementet/styrer-rad-og-utvalg/permanente-styrer-rad-og-utvalg/radet-for-matvareberedskap/id2577746/,Kriseorganisasjon innenfor sin sektor; opprettet 2003; medlemsliste per 31.03.2025
G2-NO-003,behold,,https://www.regjeringen.no/no/dokumenter/nou-2023-17/id2982767/?ch=2,Anbefaling i kap. 2
G2-NO-009,behold,,https://www.dsb.no/siteassets/rapporter-og-publikasjoner/veileder/veileder_til_forskrift_om_kommunal_beredskapsplikt.pdf,"§ 7 s. 31; versjon 2 sept. 2021; gjelder overordnet beredskapsplan generelt, ikke mat spesielt; verdikjedeledd-merkingen er misvisende"
G2-SE-001,rett,"Livsmedelsverket er beredskapsmyndighet og sektorsansvarig myndighet for hele sektoren Livsmedelsförsörjning och dricksvatten (inkl. primärproduktion og dricksvatten); ansvaret for nasjonal samordning av kris- og beredskapsplanering gjelder leddene etter primærproduksjonen",https://www.livsmedelsverket.se/om-oss/livsmedelsverkets-beredskap,Lest via nettleser; siden sist gjennomgått 2026-03-20
G2-SE-004,behold,,https://www.livsmedelsverket.se/beredskap/livsmedelsberedskap--vad-ar-det/beredskapssektorn-livsmedelsforsorjning-och-dricksvatten,Måltidsverksamhet er én av ti viktige samhällsfunktioner
G2-SE-006,behold,,https://www.riksdagen.se/sv/dokument-och-lagar/dokument/statens-offentliga-utredningar/livsmedelsberedskap-for-en-ny-tid_hcb38/html/,Ordrett i sammanfattningen; gjelder skola vård och omsorg
G2-FI-001,behold,,https://www.huoltovarmuuskeskus.fi/huoltovarmuusorganisaatio/sektorit-ja-poolit,Ordrett
G2-FI-002,rett,"Bedriftene deltar i poolens opplæring og planlegging og innretter sin egen beredskap etter poolens veiledning ('varautuvat poolin antamien ohjeiden mukaan')",https://www.huoltovarmuuskeskus.fi/huoltovarmuusorganisaatio/sektorit-ja-poolit,Veiledningen er knyttet til bedriftenes beredskap og ikke til deltakelsen
G2-EU-001,behold,,https://civil-protection-humanitarian-aid.ec.europa.eu/news-stories/news/eu-preparedness-union-strategy-prevent-and-react-emerging-threats-and-crises-2025-03-26_en,30 key actions og preparedness by design culture
G2-NX-001,rett,"Karlstad-erklæringen uttrykker ambisjon (forplikter ikke) om fordypet nordisk samarbeid om beredskap, robusthet og resiliens i mat og skog; 'felles kunnskap' står i erklæringsteksten på norden.org, ikke i regeringen.se-artikkelen",https://www.norden.org/en/deklaration/karlstad-declaration-nordic-co-operation-preparedness-and-robustness-related-food,Regeringen.se-artikkelen (publ. 20.06.2024) bekrefter sitatet om fördjupat samarbete; norden.org lest via nettleser
G1-HE-002,behold,,https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-9-food-bioeconomy-natural-resources-agriculture-and-environment_horizon-2026-2027_en.pdf,Åpning 20.04.2027; frist 23.09.2027; ca. 6 mill. EUR; RIA
G1-NP-001,behold,,https://www.uhr.se/internationella-mojligheter/samarbete-och-utbyte/kom-igang/finansiarer-och-program/nordplus/,Åpner 02.11.2026; frist 01.02.2027
G1-IA-001,behold,,https://www.interregaurora.eu/projects/calls-for-applications/,Call 7 SSP og Call 9 REG; frist 07.10.2026 16.00 CET; P1 stengt
G6-NX-001,behold,,https://www.norden.org/en/deklaration/karlstad-declaration-nordic-co-operation-preparedness-and-robustness-related-food,Ordrett i erklæringsteksten; lest via nettleser (WebFetch ga 403)
G6-NX-002,behold,,https://government.se/statements/2026/09/joint-nordic-declaration-on-security-of-supply/,"Ordrett; lest via nettleser (WebFetch ga 403); gjelder forsyningssikkerhet generelt, ikke mat spesielt"
G6-NX-003,behold,,https://government.se/statements/2026/09/joint-nordic-declaration-on-security-of-supply/,Rapporteres til NSSN i løpet av 2027; første felles rapport senest høsten 2027
TEKST-1,behold,,https://www.althingi.is/lagas/nuna/2008082.html,"Lov 82/2008 § 3 (birgðir) og § 17 (æfð) står i gjeldende versjon 157c; Grok brukte lagasafn 141b fra 2013; jf. G2-IS-002 og G2-IS-003"
TEKST-2,rett,"Fødevarestyrelsen sender én forhåndsutpekt og utdannet forbindelsesoffiser (FO) til NOST-møter ved innkalling, ikke 'utdannede forbindelsesofficerer' i flertall",https://foedevarestyrelsen.dk/om-os/nationalt-og-internationalt-samarbejde/nationale-samarbejder/foedevarestyrelsen-og-det-nationale-beredskab,G2-DK-003 i claims.csv har riktig entall; feilen ligger i G2-tabellen i del C
```

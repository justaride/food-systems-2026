---
id: R13-LAND-004
tittel: Datagap-atlas — norsk matsystem R13
dato: 2026-06-28
gate: internal
importDecision: vent
regel: intern-datagap-atlas
sourceClass: intern syntese — ikke siterbar
basertPå: R13 batch 01-11 + R12 eskaleringsfil (R13-GAP-006)
---

# R13-LAND-004 — Datagap-atlas: hva som ikke måles og av hvem

## Hva dette er — og hva det ikke er

Dette dokumentet er et **internt arbeidskart** over type-C-hull i Food TG R13-materialet (batch 01-11), supplert med ekte C-funn fra R12 slik de er klassifisert i R13-GAP-006. Det er ikke en faktakomponent, ikke siterbar kunnskap, ikke whitepaper-stemme og ikke et ferdig visualiseringsgrunnlag.

Formålet er å samle alle dokumenterte gap på ett sted slik at:
1. Prosjektet vet hva som blokkerer hvilke faktagrunnlag.
2. Ingen fremtidige claims formuleres som om C-hullene er fylt.
3. Prioritering av actor-gate, primærdata og metodeutviklingstiltak kan gjøres systematisk.

**Overclaim-vakt:** type-C er funn, ikke research-gjeld som "vil bli løst". Hullene registreres her som de er — tomme celler er synlige, ikke skjult i en pen figur.

**Skillet som brukes i dette atlasset:**
- **Strukturelt C:** aldri målt, ikke mulig å hente uten primærdata/aktørdata/ny metodeutvikling. Vil ikke bli lukket av videre desk-research.
- **Temporalt C:** ikke målt ennå, men måleprogram er opprettet eller data vil foreligge på kjent tidspunkt.

---

## Domenetabell

### Domene 1 — Volum og massestrøm

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| WASTE-002-A | Faktisk innsamlet oppdrettsslam per år, nasjonalt (tørrstoff, tonn) | Strukturelt C | Åpne merder har ingen oppsamlingsplikt; «~2 %» er anslag (NIBIO), ikke serie. FHF-tall er modellert fra fôrforbruk — ikke målt volum | Oppdrettsoperatører + Miljødirektoratet tilsynsrapport per anlegg | B (modellert) / C (innsamlet) | Uten aktørdata: aldri (åpne merder) | Massebalansen oppdrettsslam; fosforretur til jord |
| WASTE-002-B | Behandlet oppdrettsslam (biogass/gjødsel/kompost) per år, nasjonalt | Strukturelt C | Bransjeanslag finnes (Bioretur/Sterner), men ingen anleggsserierevidert nasjonal total | Biogassanlegg/leverandør; NIBIO; Miljødirektoratet driftsrapport | C | Uten aktørdata: aldri | Fosfor- og nitrogenregnskap; sirkulærøkonomiestimater |
| WASTE-002-C | Tre-kolonners massebalanse (modellert/innsamlet/behandlet) per lokalitet/år | Strukturelt C | Koblingen mellom de tre kolonnene finnes ikke i noen åpen kilde; anleggsvis kontroll mangler | Statsforvalter-tillatelser + driftsdata per anlegg | C | Krev aktørkontakt + Statsforvalter-API | Lokal tiltaksanalyse; regulatorisk effektvurdering |
| WASTE-005-NO | Nasjonalt aggregert NPK-retur fra digestat (N/P/K kg/tonn, absolutte verdier) | Strukturelt C | Ingen norsk SPCR 120-ekvivalent. Ny gjødselvareforskrift (2025) innfører registreringsplikt, men ikke obligatorisk sertifisert rapportering | Biogass Norge; NIBIO (Eva Brod); Mattilsynet | C (NO systemivå) / B (enkeltanlegg) | Tidligst 2027 (om ny forskrift gir aggregerte data) | Gjødselpotensial-beregning; mineralgjødselsubstitusjon |
| WASTE-005-K | Kalium (K) retur fra norsk digestat — særlig svak | Strukturelt C | K er nesten ikke kvantifisert i norsk FoU-litteratur; SPCR 120 finnes kun for Sverige | Som over | C | Ikke mulig uten systematisk anleggsmåling | Næringsstoffbalansen for K i norsk jord |
| WASTE-007-A | Industrielle næringssidestrømmers volum per fraksjon (per år, per sektor) | Temporalt C | Siste aggregering er Nofima 67/2016 (~10 år gammel); meieri-tall aktørformidlet uten verifiserbar primærkilde | Nofima; TINE årsrapport; SSB industritall | B (utdatert) / C (per fraksjon) | Ny Nofima-rapport når bestilt | Ressursregnskap; potensiell verdiskapingskart |
| WASTE-006-A | Kaffegrut (SCG) disponering — faktisk masseflyt til biogass/kompost/avfall | Strukturelt C | Ikke separat SSB-avfallsfraksjon; HORECA-etterlevelse ikke kartlagt | Avfallsmottak; biogassanlegg; SSB 08801 kaffeimport (estimat-inngang) | C (disponering) / B (volum estimert) | Uten avfallsaktørdata: ikke mulig | Materialgjenvinningspotensial; urban sidestrøm-atlas |
| PROT-008-B | Belgvekstareal i tonn (norsk produksjon bønner/erter/åkerbønne per år) | Strukturelt C | SSB tabell 07495 finnes men er ikke systematisk hentet for belgvekster som SSB-serie; nesten alt til fôr, matserien mangler | SSB tabell 07495; Landbruksdirektoratet | C (SSB-serie) | Mulig etter SSB-uttrekk | Norsk proteinvekststatistikk |
| PROT-001-A | Realisert tonn insektmel/-protein solgt i Norge/Norden per år | Strukturelt C | Invertapro, Enorm, Tebrito oppgir ikke tonn; kapasitet finnes, realisert produksjon ikke åpen | Aktørkontakt; produksjonsregnskap | C | Uten aktørdata: aldri | Proteinalternativ-rangering; fôrproteinkart |
| PROT-002-A | Realisert nordisk årsvolum single-cell/fermenteringsprotein (mat + fôr) | Strukturelt C | Kapasitet og LOI er åpent; realisert fôr-grade nordisk volumserie ikke offentlig | Unibio, Solar Foods, Calysta aktørkontakt | C | Uten aktørdata: aldri | Proteinalternativ-kart; fôrimportreduksjon |
| PROT-003-A | Kommersielt realisert nordisk fôrvolum musling/tang/tare | Strukturelt C | FoU og potensial er sterke; ingen kommersiell volumserie identifisert | Nofima; aktørkontakt (Norcod, Seaweed Solutions) | C | Uten aktørdata: aldri | Havbasert protein-kart |
| GAP-001-A | Fôrprotein-total (all import av råprotein til norsk matproduksjon, samlet) | Strukturelt C | SSB 08801 lukker varekode/mengde/verdi per HS-nummer, men sluttbruk (husdyr/fisk/human) er ikke i koden; ingen nasjonal aggregering av fôrprotein-total | Landbruksdirektoratets kraftfôrstatistikk (husdyr) + FHF ressursregnskap (fisk) krever metodekobling | C | Mulig med metodeutvikling (3–6 mnd) | Proteinselvforsyningsberegning inkl. fisk |
| GAP-003-A | Transport/lager-kapasitet (tonn/dag/lager, kaldkjedekapasitet) | Strukturelt C | Forretnings-/beredskapssensitivt; ikke åpent. ØA 60-2023 kvalitativt | Forsvarsdepartementet/DSB; aktørkontakt | C/klassifisert | Uten tilgang: ikke mulig | Forsyningssikkerhet; kriseplan |

---

### Domene 2 — Eierskap og aksjonær

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| AKTOR-006-A | Aksjonærregister for alle kartlagte sirkulær/altprotein/CEA-selskaper | Strukturelt C | Skatteetatens aksjonærregister er ikke åpent. Brreg API gir rolledata (styre/DL), ikke eierstruktur | Proff Forvalt/Infotorg (betalt); Skatteetaten innsynsbegjæring | C (alle 8 selskaper) | Mulig med betalingsverktøy | Eierskapskart; maktanalyseclaims |
| AKTOR-006-B | Vestkorn Milling AS — tilknytning til dsm-firmenich | Strukturelt C | Indikasjon via styremedlems etternavn, men ikke bekreftbart via Brreg | dsm-firmenich årsrapport; Proff Forvalt | C | Mulig med manuell rapport-sjekk | Konsentrasjonskart altprotein |
| AKTOR-006-C | Invertapro AS — aksjeklassestruktur (A/B-klasser) | Strukturelt C | Brreg viser at tre styremedlemmer er «valgt av A-aksjonærene», men klassestruktur ikke offentlig | Selskapets vedtekter (betalt); Proff Forvalt | C | Mulig med betalingsverktøy | Eiermaktanalyse |
| AKTOR-006-D | NorInsect Holding AS — ytterste eiere | Strukturelt C | Holdingselskap uten åpent aksjonærregister; fire datterselskaper bekreftet | Skatteetaten/Proff Forvalt | C | Mulig med betalingsverktøy | Konsentrasjonskart altprotein |
| AKTOR-006-E | Gruten AS — org.nr og driftstatus | Strukturelt C | Ikke funnet i Brreg (aktive eller slettede) — kan operere under annet navn, som ENK, eller slettet | Sekundærkilder fra 2017/2021; Brreg historisk søk | C | Ukjent | Kaffegrut-aktørkart |
| DIST-001 | ASKO storh.andel 70 % — uavhengig bekreftelse | Strukturelt C | Tall sirkulerer i bransje, men ingen uavhengig primærkilde identifisert i R12/R13 | Dagligvarerapport KT 2024-25 (PCQ gjenstår); aktørkontakt | C (uavhengig) / B (bransje) | Mulig etter KT-rapport PCQ | HORECA-konsentrasjonsanalyse |
| DIST-003 | EMV-andel i Danmark og Island | Strukturelt C (IS) / Temporalt C (DK) | DK: eldre primærkilde; IS: ikke søkt/ikke funnet | Oppdatert nordisk myndighets-/markedskilde | C (IS) / B (DK) | DK: mulig med ny kilde; IS: ukjent | Nordisk EMV-rangering |
| AKTOR-001-POP | Totalpopulasjon markedshager i Norge | Strukturelt C | Ingen nasjonal database; Brreg-treff (18 foretak) er minimumsanker; mange bruker ikke «markedshage» i foretaksnavn | Småskala Grønt Norge (ingen nettside/liste); Debio | C | Etter aktørkontakt Småskala Grønt Norge | Markedshagebransjens størrelse |
| AKTOR-006-F | Onna Greens AS — kunder og salgssteder i dagligvare | Strukturelt C | Ikke bekreftet i åpen kilde | Coop/NorgesGruppen årsrapporter; aktørkontakt | C | Mulig med manuell årsrapportsjekk | CEA-distribusjonskanal-analyse |

---

### Domene 3 — Jordkvalitet og karbon

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| OKO-003-A | Nasjonal SOC-baseline for jordbruksjord | Temporalt C | JordVAAK startet datafangst 2026; 10-årig rotasjonssyklus — første fullstendige tilstandsanalyse ~2036 | JordVAAK/NIBIO | B (program etablert, ingen data) | ~2036 (første fullstendige) / ~2029 (delresultater mulig) | Karbonberegninger; UNFCCC-rapportering; klimakalkulator-validering |
| OKO-003-B | Nasjonal SOC-baseline skog og eng (NSCM) | Temporalt C | NSCM-innsamling startet 2023, første fullstendige runde ~2032 | NIBIO NSCM | B (innsamles, ikke publisert) | ~2032 | LULUCF-rapportering; areal-CO₂-regnskap |
| OKO-003-C | Historisk SOC-tidsserie for norsk jordbruksjord | Strukturelt C | Aldri systematisk målt — NIBIO bekrefter eksplisitt «no historic data» | Finnes ikke i eksisterende datakilder | C | Vil ikke foreligge | Trendanalyse jordkarbon; klimascenarioer |
| OKO-003-D | Andel jordbruksareal med jordsmonnskart | Temporalt C | 39 % av arealet mangler per 2026; løpende ~100 km²/år (siden 1980-tallet) | NIBIO jordkartlegging | B (61 % dekning) | Tidligst 2040+ for full dekning | Klimakalkulator (settes til 0 for ukartlagte arealer) |
| OKO-002-A | EOV-sertifiserte gårder i Norge — antall og liste | Strukturelt C | Regenerativt Norge tilbyr EOV-metoden, men antall norske sertifiserte gårder er ikke offentliggjort | Regenerativt Norge aktørkontakt | C | Etter aktørkontakt | Regenerativt landbruk-spredningsanalyse |
| OKO-002-B | Nasjonal myrjordbaseline (SOC i torvjord) | Temporalt C | Forskning pågår (NORSØK PEATIMPROVE 2022–2025); ingen nasjonal samlet baseline | NORSØK; NIBIO | B/C | ~2026-2027 (prosjektavslutning) | Myrjord klimaregnskap; dreneringspolicy-vurdering |
| OKO-003-E | Karbonfarmingprogram i norsk jordbruk — etablerte kredittordninger | Strukturelt C | Ingen etablerte programmer per juni 2026; EU CRCF trådte i kraft 2024 men ikke EØS-innlemmet | Bionova; EU CRCF innlemmelsesprosess | C | Tidligst 2028 (EØS-prosess) | Carbon farming business case; bønders insentiver |

---

### Domene 4 — Aktørstatus

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| AKTOR-002-A | Per-gård aktiv status andelslandbruk (av ~90 aktive, kun 25 Brreg-bekreftet) | Strukturelt C | Økoguiden-kart er JavaScript-drevet — ikke maskinlesbar; resten krever per-gård-bekreftelse | Debio for produsentliste; Chrome MCP på Økoguiden | C (65–70 gårder) | Mulig med Chrome MCP/Debio-kontakt | Andelslandbruk-sektors faktiske størrelse |
| AKTOR-004-A | Totaltall regenerative bønder i Norge | Strukturelt C | HM-utøverkart (Regenerativt Norge) ikke offentlig navneliste; 11 gårder er bekreftet navngitt (B) | Regenerativt Norge aktørkontakt | C | Etter aktørkontakt | Regenerativ praksis-spredningsanalyse |
| AKTOR-007-A | Nasjonal inventarliste skogshage/permakultur-sites | Strukturelt C | Google Maps-embed ikke maskinlesbar; 13 sites bekreftet (B) — ikke fullstendig | Norsk Permakulturforening; Root2Fork-forum | C | Høst 2026 (Root2Fork åpnet juni 2026) | Permakultur-sektorkart |
| AKTOR-003-A | Oppdaterte REKO-ringer/-produsent-/-kundetall (etter feb 2022) | Temporalt C | Primærtall fryst ved feb. 2022; REKO Norge stiftet jan. 2025 men ingen årsmelding per juni 2026; DIGIFOOD-sluttrapport ikke funnet | REKO Norge årsmelding (mulig høst 2026); DIGIFOOD/USN | B (fryst 2022) | Etter årsmelding REKO Norge | Direktesalg-kanal-kart; REKO omsetning |
| INNO-001-A | Realisert produksjonsvolum (tonn/år) for alle norske CEA-aktører | Strukturelt C | Ingen aktør har offentliggjort faktisk produksjonsvolumt; alle tall er aktøregenrapportert ambisjon | Brønnøysund regnskap; direkte aktørkontakt | C (alle aktører) | Mulig med regnskap + aktørkontakt | CEA-sektors faktiske matproduksjon |
| INNO-001-B | Himmelgrønt AS org.nr og regnskap | Temporalt C | Nyregistrert 2023, org.nr ikke funnet i åpent søk; ikke innlevert regnskap | Brreg-API; Coop årsrapport 2025 | C | Mulig etter årsrapport innlevering 2026 | CEA joint venture status |

---

### Domene 5 — Markedskonsentrasjon

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| PROT-004-A | Markedsandel per produkt/produsent plantebasert humanprotein — én åpen tabell | Strukturelt C | Markedstall, produsent, salgsvolum og råvareopprinnelse er ikke koblet i noen åpen tabell | NielsenIQ/Circana (betalt); aktørkontakt | C | Mulig med markedsdata-abonnement | Planteprotein-konkurransekart |
| AKTOR-008-A | Kanaldekomponering direktesalg (REKO/Bondens marked/gårdsbutikk/netthandel) | Strukturelt C | 938 mill. kr direktesalg 2025 er aggregert A-kilde (Lokalmatrapport); kanalfordeling ikke offentlig | Stiftelsen Norsk Mat; Bondens marked; per-kanal-kontakt | C | Etter per-kanal-kontakt | Direktesalg-kanalanalyse; REKO vs. andre kanaler |
| INNO-002-A | Aggregert VC-kapital i norsk agritech/foodtech per år | Strukturelt C | Funding-runder for enkeltselskaper (B/bransjepress); nasjonal VC-statistikk for agritech ikke offentlig | Dealroom NO; NIC-klyngedatabase; Argentum | C | Mulig med Dealroom-abonnement | Agritech-vekstanalyse; investeringsklima |
| DIST-004 | Grossistgate — dokumentert nektelse/avvisning til alternativ leverandør | Strukturelt C | Struktur/kanalspor deskbart; faktisk bevist nekt krever kontrakt/sak/aktørdata | KT/saksbehandling; aktørkontrakt | C | Uten sak: ikke mulig | Markedsmakt-analyse |

---

### Domene 6 — Innovasjon og volum

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| INNO-004-A | Nordic Harvest finansiell status 2025-2026 | Strukturelt C | Dansk selskap; Bolagsverket/Erhvervsstyrelsen for primærregister; ikke hentet i R13 | Erhvervsstyrelsen; bransjepresse | C | Mulig med Erhvervsstyrelsen-søk | Failure/survival-ledger nordiske CEA |
| PROT-005-A | Mattilsynets regulatoriske stilling til presisjonsfermentering og dyrket kjøtt | Strukturelt C | Ikke funnet i åpne kilder; realisert volum EU/NO = null; ingen EU Novel Food-godkjenning for dyrket kjøtt | Mattilsynet direkte henvendelse | C | Etter aktørkontakt | Regulatorisk fremtidskart ny matteknologi |
| INNO-005-A | Norsk-spesifikk kvantitativ evidens per konverteringsbarriere (WTP/TTO/prisdata) | Strukturelt C | 7 barrierekategorier har god internasjonal evidens (EPIC-SHIFT, OECD, GFI); norsk-spesifikk kvantifisering mangler | Ruralis MatMakt-rapport (ventet); VKM | C | Etter Ruralis MatMakt-rapport | Norsk barriereanalyse; politikkanbefalinger |
| INNO-006-A | Budsjett og bemanning per FoU-prosjekt (Nofima, NIBIO, NMBU, SINTEF, Ruralis) | Strukturelt C | 30+ prosjekter kartlagt; budsjett per prosjekt ikke åpent | prosjektbanken.forskningsradet.no; aktørkontakt | C | Mulig med prosjektbank-søk | FoU-kapasitetsanalyse |
| INNO-007-A | LUP-arkiv og Doffin mat-IPP/PCP-portfolio | Strukturelt C (LUP) / Temporalt C (Doffin) | LUP: ingen mat-case bekreftet i aktiv portefølje; Doffin: systematisk søk ikke gjennomført | LUP-arkiv direkte; Doffin CPV-søk | C (LUP) / B→A etter søk (Doffin) | Mulig med Doffin-søk | Offentlig innkjøp matinnovasjon |

---

### Domene 7 — Food waste per kanal

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| WASTE-004-A | Husholdningsmatsvinn 2024 — oppdaterte tall | Temporalt C | NORSUS/Matvett publiserte 2023-tall (193 200 t); 2024-tall ikke publisert per juni 2026 | Matvett (publiserer normalt H2 påfølgende år) | C (2024) | Estimert H2 2026 | Matsvinn-trendkurve husholdning |
| WASTE-004-B | Matindustri matsvinn etter 2022 | Temporalt C | Siste bransjeavtale-tall er t.o.m. 2022 | Matvett neste kartlegging | C (2023-2024) | Estimert 2027 | Tverrledd-matsvinn-figur |
| WASTE-007-B | Matsvinn primærjordbruk — nasjonal kartlegging | Strukturelt C | Ikke inkludert i nasjonal matsvinnkartlegging (bransjeavtale dekker ikke jordbruket) | Landbruksdirektoratet; ny sektoravtale | C | Usikkert — krever metodeutvikling | Totalmatsvinntall; halveringsmål-sporing |
| WASTE-003-A | TGTG (Too Good To Go) norsk 2024-statistikk | Temporalt C | 2024-statistikk ikke offentliggjort per juni 2026 | TGTG; Matvett | C | Ukjent publiseringstidspunkt | Redistribusjonstotal; reddings-kanalsammenligning |
| WASTE-003-B | Nasjonal redistributionstotal (alle kanaler samlet) | Strukturelt C | Ingen metodebro mellom Matsentralen/TGTG/REDD! — ulike definisjoner og tellemetoder | Matvett metodeutvikling; aktørsamarbeid | C | Ikke mulig uten metodestandardisering | Total food rescue-statistikk |
| WASTE-008-A | Effektstørrelse per enkelt preventions-tiltak med kontrollgruppe | Strukturelt C | Bransjeavtale/KuttMatsvinn gir sektorbaseline, men ingen studie isolerer ett tiltak med kontrollgruppe i norsk kontekst | Nordic Council Nord 2024:034; ny FoU | C | Uten ny FoU: ikke mulig | Tiltaksrangering; evidensbasert policy |

---

### Domene 8 — Biologisk mangfold

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| OKO-004-A | Pollinatortrend fra 3Q-feltregistreringer | Temporalt C | Overvåking startet 2021 — for kort serie for trendangivelse | 3Q-programmet (NIBIO) — trenger ~5–7 år til | B (status, ikke trend) | ~2028-2030 | Pollinatortilstandsclaim |
| OKO-004-B | Insektbiomasse/-tetthet i norske åkerlandskap | Strukturelt C | Ingen systematisk nasjonal overvåking; 3Q dekker humler/sommerfugler kun fra 2021 | Ny FoU; NIBIO-initiativ | C | Uten nytt program: ikke mulig | Insektbiodiversitetstrender |
| OKO-004-C | Åkerblomster / segetal flora (åkerugras med naturverdi) — nasjonal serie | Strukturelt C | Ingen identifisert nasjonal overvåkingsserie | Ny FoU; 3Q-utvidelse mulig | C | Uten program: ikke mulig | Åkermark-biodiversitetsindeks |
| OKO-004-D | Norsk Farmland Bird Index (FBI) per år — numerisk tallserie | Temporalt C | 3Q-NIBIO-serie starter 2000 og er A-kilde, men eksakt numerisk tallserie ikke uttrekket fra Nordic Statistics PxWeb i R13 | Nordic Statistics / OECD PxWeb: BIOD01 | B→A etter PxWeb-uttrekk | Mulig ved direkte PxWeb-uttrekk | Nordisk FBI-rangering |
| OKO-004-E | Jordlevende invertebrater/meitemark — nasjonal overvåking | Strukturelt C | Ikke identifisert nasjonalt overvåkingsprogram | Ny FoU; jordovervåkingsprogram-utvidelse | C | Uten program: ikke mulig | Jordhelseindikator; meitemark-karbonbinding |
| OKO-002-C | Nasjonal pollinatorabundans-indeks for landbrukslandskap | Strukturelt C | Artsdatabanken aggregerer borgervitenskapelige observasjoner men uten geografisk representativitet for landbruksareal | Ny overvåkingsordning; NORSØK BEESPOKE/POLLIBRING | C | Uten program: ikke mulig | Bestøver-tjenestemål; nasjonal pollinatorstrategi-evaluering |
| OKO-007-D | Pollinatorbestandsindikatorer — kvantitative trenddata | Strukturelt C | Nasjonal pollinatorstrategi (2018) + tiltaksplan (2021–2028) uten kvantitative bestandstall publisert | Miljødirektoratet; sluttevaluering 2028 | C | Sluttevaluering 2028 | Pollinatormål-sporing |

---

### Domene 9 — Proteinselvforsyning

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| PROT-007-A | Proteinselvforsyning i gram/capita/dag — offisiell norsk serie | Strukturelt C | NIBIO nevner muligheten, men beregner per energi (kJ), ikke per protein-gram. Ingen offisiell serie | NIBIO Mads Svennerud; FAO FAOSTAT direkteuttak | C (nasjonal serie) | Mulig med FAO-uttrekk + NIBIO-aktørkontakt | Proteinsjølforsyningsanalyse |
| PROT-007-B | Fôrkorrigert selvforsyningsgrad inkl. fiskefôr | Strukturelt C | Offisiell beregning korrigerer kun for kraftfôr til husdyr; fiskefôr (SPC, fiskemel, rapsolje) er strukturelt ekskludert og NIBIO erkjenner dette | Ny metodeutvikling; NIBIO/Landbruksdirektoratet samarbeid | C | Usikkert — krever nytt beregningsrammeverk | Total fôrkorrigert selvforsyningsanalyse |
| PROT-006-A | Soya/SPC ressursregnskap etter 2020 | Temporalt C | Siste A-kilde er Nofima/FHF ressursregnskap 2020; ingen åpen 2022/2023-serie identifisert | Nofima/FHF nyere ressursregnskap | C (post-2020) | Etter ny rapport fra Nofima/FHF | Soyaerstatnings-trendanalyse |
| PROT-007-C | Matsystemutvalgets (NOU 2026) protein-kapittel | Temporalt C | NOU ikke levert per juni 2026; leveres innen 1. november 2026 | NOU 2026 (november) | C | November 2026 | Protein-politikkgrunnlag |

---

### Domene 10 — Policy-effekt

| Hull-ID | Hullbeskrivelse | Hulltype | Hvorfor ikke målt | Hvem som kan fylle det | Kildeklasse i R13 | Første mulige dato | Blokkerer |
|---|---|---|---|---|---|---|---|
| OKO-007-A | Matsvinn fra primærjordbruk — inkludert i matsvinnkartlegging | Strukturelt C | Bransjeavtale og Matvett dekker ikke jordbrukssektoren; metodikk mangler | Ny sektoravtale/metodeutvikling; Landbruksdirektoratet | C | Uten ny metodiikk: ikke mulig | Halverings-mål-sporing 2030 |
| OKO-007-B | Selvforsyningsgrad 2030-prognose (offisiell fremskrivning) | Temporalt C | Ingen offisiell fremskrivning identifisert; Ruralis/NIBIO scenarioanalyse overlevert mars 2026 men ikke publisert | NOU 2026; Ruralis/NIBIO-rapport | C | November 2026 (NOU) | 50%-mål politisk begrunnelse |
| OKO-007-C | Klimaavtalen jordbruk — løpende gap-tall 2022-2025 | Temporalt C | Mars 2024-rapport finnes; 2025-tall ikke fremskaffet i R13 | LMD klimastatus-rapport 2025 | C (2025-tall) | Mulig med LMD-rapport-søk | Klimamål-sporing for jordbruk |
| OKO-007-E | Gjødselreduksjon — norsk kvantifisert reduksjonsmål | Strukturelt C | Ingen norsk 20%-mål (F2F ikke innlemmet); nytt gjødselregelverk 2025 uten kvantifisert kutt | Ny policy-utvikling | C | Uten ny policy: ikke mulig | EU F2F-sammenligning |
| OKO-007-F | Pesticidbruk — total norsk bruksstatistikk 2024/2025 | Temporalt C | Risikoindikatorer finnes, men samlet bruksstatistikk per 2024/2025 ikke fremskaffet | Mattilsynet/Miljødirektoratet statistikk | C (2024-2025) | Mulig med kildeuttrekk | Plantevernmiddel-trendanalyse |
| WASTE-008-B | Matsvinnloven (2025) — effektdata | Temporalt C | Loven vedtatt 27.05.2025 men ikrafttredelsesdato ikke satt; ingen effektdata mulig ennå | Loven i kraft + måling (må vente 1-2 rapporteringssykluser) | C | Tidligst 2027-2028 | Matsvinnlovens effekt |
| OKO-001-A | Import vs. norsk andel i norsk øko-omsetning | Strukturelt C | Øko-salg +17,6 % 2025, men import/norsk-andel i omsetningen ikke offentlig brytes ned | Debio statistikkhefte 2025; Matmerk | C | Mulig med Debio-rapport-uttrekk | Norsk øko-produksjonsstatus |
| AKTOR-002-B | Nasjonal telling av markedshager | Strukturelt C | SSB bruker ikke «markedshage» som kategori; Småskala Grønt Norge ny (2026) uten liste | SSB grønnsaker + Småskala Grønt Norge | C | Etter organisasjonsvekst | Småskala grøntsektor-størrelse |

---

## Prioriteringskolonne

Hvilke gap blokkerer viktigst faktagrunnlag per tema:

| Prioritet | Hull-ID | Begrunnelse |
|---|---|---|
| P1 — blokkerer | PROT-007-A | Ingen protein-spesifikk selvforsyningsserie finnes — hele proteinselvforsyningsanalysen hviler på energi-basis |
| P1 — blokkerer | OKO-003-A | Nasjonal SOC-baseline finnes ikke — all karbonpåstand for norsk jordbruksjord er modellert |
| P1 — blokkerer | WASTE-002-A+B | Oppdrettsslam-massebalansen har tre adskilte størrelser ingen åpen kilde kobler |
| P1 — blokkerer | AKTOR-006-A | Aksjonærregister systematisk lukket — all eierskapspåstand for altprotein/CEA/sirkulær er B/C |
| P1 — blokkerer | WASTE-007-A | Industrielle næringssidestrømmers volum er ~10 år gammel — ressurskart kan ikke oppdateres |
| P2 — delvis blokkerende | WASTE-004-A | Husholdningsmatsvinn 2024 mangler — matsvinntrendkurve kan ikke avsluttes |
| P2 — delvis blokkerende | GAP-001-A | Fôrprotein-total-aggregering ikke mulig uten metodeutvikling |
| P2 — delvis blokkerende | OKO-004-A | Pollinatortrend ikke mulig ennå — 3Q for ny |
| P2 — delvis blokkerende | PROT-007-B | Fiskefôr-korrigert selvforsyning strukturelt ekskludert — 50%-mål uten fisk|
| P3 — kontekstblokkerende | INNO-005-A | Norsk-spesifikk konverteringsbarriere-evidens mangler — policy-anbefalinger mangler tallgrunnlag |
| P3 — kontekstblokkerende | OKO-007-B | Selvforsynings-2030-prognose ikke publisert |
| P3 — kontekstblokkerende | PROT-006-A | Ressursregnskap post-2020 mangler — soyaerstatnings-trendanalyse avskåret |

---

## Tomme celler i atlasset selv

Disse hullene er **ikke lukket av R13-materialet** og er ikke forsøkt fylt her:

1. **R4/R5/R6-gap systematisk:** Oppgaven ba om gap fra R4/R5/R6, men disse rundenes filer er ikke lest i dette atlasset. Kun R12 (via R13-GAP-006 eskaleringsfil) og R13 (batch 01-11) er systematisk dekket. R4-R6 kan ha egne C-gap som ikke fremkommer her.
2. **Nordisk harmonisert matsvinn per kanal:** Ingen nordisk metodebro identifisert — tabellen viser kun norsk kontekst.
3. **Leaseback eksklusjon — bevist saksmateriale:** Mekanismen er dokumentert, men eksistensen av bevist ulovlig eksklusjon (sak/aktøravtale) er ikke undersøkt i R13.
4. **Per-kg bondemargin (R12-FARM-002):** Ikke dekket i R13 batch 01-11 (LAND-runde). Tas inn i neste runde om relevant.
5. **Aggregert offentlig matinnkjøp — øko-andel:** Tiltak 6 i øko-strategien 2025, men ingen kvantifisert tall og ingen R13-prompt dekket dette systematisk.
6. **Markedskonsentrasjon grossist frukt/grønt (konkret HHI):** Ikke komputert i R13; Dagligvarerapport er identifisert som mulig locator men ikke uttrekket.

---

## Ikke si

Disse formuleringene må ikke brukes basert på R13-materialet:

1. Ikke si «Norge er X % selvforsynt med protein» — ingen offisiell protein-gram-serie eksisterer.
2. Ikke si «norsk oppdrett samler inn X tonn slam» — ~0 samles i åpne merder; 535 412 t er modellert utslipp.
3. Ikke si «norsk biorest inneholder Y kg/tonn NPK» som nasjonalt gjennomsnitt — kun anleggsspesifikke B-tall finnes.
4. Ikke si «Norge har en nasjonal SOC-baseline» — JordVAAK startet 2026, ingen data publisert.
5. Ikke si «Klimakalkulatoren måler jordkarbon» — den modellerer via ICBM, ikke direkte måling.
6. Ikke si «hvem eier [altprotein/CEA-selskap]» uten kildeklasse — aksjonærregister er ikke offentlig.
7. Ikke si «det finnes X markedshager i Norge» — ingen nasjonal primærtelling; 18 er minimumsanker.
8. Ikke si «Himmelgrønt produserer 100 tonn salat» — planmål, ikke dokumentert realisert volum.
9. Ikke si «pollinatorene er i sterk tilbakegang i Norge» — rødliste viser truethet; felttrend fra 3Q mangler (serie for kort).
10. Ikke si «klimamålet for jordbruket er i rute» — Riksrevisjonen konkluderte motsatt (juni 2025).
11. Ikke si «matsvinnmålet er nådd» — bransjen nådde 2025-delmålet (–30 %); nasjonalt halverings-mål (–50 % innen 2030) ikke nådd; primærjordbruk ekskludert.
12. Ikke si «selvforsyningsgraden er 50 %» — 50 % er mål for 2030, ikke nådd; dagens nivå ~40 % fôrkorrigert ekskl. fisk.
13. Ikke si «Norge har et sertifiseringssystem tilsvarende SPCR 120» — eksisterer ikke per 2026.
14. Ikke si «Farmland Bird Index viser [X] for Norge» uten å oppgi at eksakt tallserie ikke er uttrekket fra PxWeb i denne runden.
15. Ikke si «insektprotein-volum i Norge er [X] tonn» — ingen åpen serie; alt er kapasitet/ambisjon.
16. Ikke si «ASKO kontrollerer 70 % av storhusholdning» uten uavhengig primærkilde — ikke verifisert.
17. Ikke si «matsvinnloven er i kraft» — vedtatt 27.05.2025, ikrafttredelsesdato bestemmes av Kongen.
18. Ikke si «EU Farm to Fork forplikter Norge» — ikke EØS-innlemmet som helhet.

---

## Anbefalt gate: internal

Dette dokumentet er utelukkende for intern prosjektbruk. Det er ikke siterbar kunnskap, ikke et faktaunderlag og ikke en del av whitepaper, deck eller ekstern kommunikasjon. Ingen av radene i domenetabellene åpner claims. Domenetabellen er et arbeidskart for å:
- identifisere hvilke actor-gate-spørsmål som er høyest prioritert,
- forhindre at prosjektet formulerer claims basert på C-hull,
- styre neste innsamlingsrunde (R14 eller actor-gate-sesjon).

---

---DECISION-JSONL---
{"id":"R13-LAND-004","decision":"enrich","valueTier":"high","title":"Datagap-atlas — norsk matsystem R13","canonicalPath":"docs/project/mandates/R13-LAND-004-datagap-atlas.md","shortVerdict":"Systematisk ekstraksjon av type-C-hull fra R13 batch 01-11 og R12-eskaleringsfil. 10 domener kartlagt, 60+ hull identifisert. Skillet strukturelt C vs temporalt C er gjennomgående. Flest gap i domenene jordkarbon (SOC-baseline mangler til ~2036), eierskap (aksjonærregister lukket), oppdrettsslam (massebalanse tre-kolonner ikke koblet) og proteinselvforsyning (ingen gram-serie). Atlasset er arbeidskart, ikke faktakomponent.","strongestSource":"R13 batch 01-11 systematisk C-gap-ekstraksjon fra originalfiler + R13-GAP-006 eskaleringsfil (R12-triagesyntese)","weakestPoint":"R4/R5/R6-gap er ikke systematisk dekket; atlasset baserer seg kun på R12 (via eskaleringsfil) og R13. Tomme celler i atlasset selv er registrert eksplisitt.","sourceClass":"intern syntese — ikke siterbar","gapType":"strukturelt C (aldri målt, ikke mulig uten primærdata) og temporalt C (målprogram opprettet, data ikke klar ennå)","gate":"internal","importDecision":"vent","ikkeSi":["Norge er X prosent selvforsynt med protein — ingen offisiell gram-serie","Norsk oppdrett samler inn X tonn slam — åpne merder samler tilnærmet null","Norsk biorest inneholder Y kg/tonn NPK som nasjonalt gjennomsnitt — kun anleggsspesifikke B-tall","Norge har en nasjonal SOC-baseline — JordVAAK startet 2026 ingen data publisert","Klimakalkulatoren måler jordkarbon — modellerer via ICBM ikke direkte måling","Aksjonærstruktur for altprotein/CEA-selskaper — aksjonærregister er ikke offentlig","Det finnes X markedshager i Norge — 18 er minimumsanker ikke nasjonal primærtelling","Himmelgrønt produserer 100 tonn salat — planmål ikke dokumentert realisert volum","Pollinatorene er i sterk tilbakegang — felttrend mangler fra 3Q-serie som er for kort","Klimamålet for jordbruket er i rute — Riksrevisjonen konkluderte motsatt juni 2025","Matsvinnmålet er nådd — bransje nådde 2025-delmål men nasjonal halvering ikke nådd primærjordbruk ekskludert","Selvforsyningsgraden er 50 prosent — mål for 2030 ikke nådd dagens nivå ca 40 prosent","Norge har SPCR 120-ekvivalent for biorest — eksisterer ikke per 2026","ASKO kontrollerer 70 prosent storhusholdning — ikke verifisert med uavhengig primærkilde","Matsvinnloven er i kraft — vedtatt men ikrafttredelsesdato ikke satt","EU Farm to Fork forplikter Norge — ikke EØS-innlemmet som helhet"],"fetchedSources":[],"fileEdited":true}

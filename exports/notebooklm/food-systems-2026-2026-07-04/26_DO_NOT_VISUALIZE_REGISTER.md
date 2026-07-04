# Do-Not-Visualize Register

Export date: 2026-07-04
Packet type: evidence
Status label: do-not-visualize-yet
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for do-not-visualize register.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
- docs/project/mandates/R13-LAND-006-figurkandidater.md

## Source Excerpts

### research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

````markdown
# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 50 / 50
- **Decision-batcher funnet:** batch-01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002), batch-02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002), batch-03 (R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007), batch-04 (R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007), batch-05 (R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004), batch-06 (R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003), batch-07 (R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007), batch-08 (R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002), batch-09 (R13-INNO-003, R13-INNO-004, R13-INNO-005, R13-INNO-006), batch-10 (R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003), batch-11 (R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007), batch-12 (R13-LAND-001, R13-LAND-002, R13-LAND-003, R13-LAND-004), batch-13 (R13-LAND-005, R13-LAND-006)
- **Batcher ikke funnet som decision/report-fil:** batch-13 (ikke startet)
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 14 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 24 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 1 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 8 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 4 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 3 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 46 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 gir Type-A importtidsserie 2020–2024 (volum+verdi separat) for soya/fiskeolje/kaffe/kakao; fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke. | importer (PCQ; speil holdt ute) | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | 3 løftbare m/caveat (REKO 2022, andelslandbruk 93/2023, Rest-konkurs 2024), 1 delvis (fiskeolje), 3 parkert/nedgradert (ASKO 70 %, SOIL-score, Plantagon). | claim-lock-kandidat for smale rader; verifiser per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF fulltekst: ~1,1 mill. t, 89 % utnyttet, men kun ~15 % humant konsum vs 66 % fôr / ~19 % energi — utnyttet ≠ høyverdi. | importer (PCQ) | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Offentlige tall er modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet/behandlet kun fragmenter; åpne merder samler ~0. Ingen 3-kolonners anleggsbalanse i åpne kilder. | vent — parkert til actor/primærdata (se også parkert) | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | NORSUS/Matvett OR.16.24 (husholdning 2023: 193 200 tonn) og OR.28.25 (dagligvare 2024: 43 600 tonn); bransjeavtale og matsvinnlov primærkilder. A-klasse med C-gap (husholdning 2024 mangler, matindustri kun t.o.m. 2022). | importer med synlige caveater og tomme 2024-celler | research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige A (SPCR 120 2023: Tot-N ~5,1 / P ~0,60 / K ~2,1 kg/tonn); Norge B/C — ingen nasjonal aggregering, strukturelt hull. | aktørspørsmål til Biogass Norge/NIBIO | research/external/r13/R13-WASTE-005-digestat-npk-retur.md |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | SPC dominerer (~21 % av fôr 2020, Nofima/FHF A-kilde). Fiskemjøl ned fra 65 % (1990) til 12 % (2020). All SPC ProTerra/RTRS-sertifisert via Denofa. Ingen offentlig ressursregnskap etter 2020. | vent — hent nyere Nofima/FHF ressursregnskap 2022/2023 | research/external/r13/R13-PROT-006-soya-erstatning-for.md |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | Rå 41,3 % / fôrkorrigert 34,9 % (2024, energibasis, A). Protein-gram-serie mangler offisiell beregning (C). Fôrkorrigert ekskluderer fiskefôr — strukturelt hull. | vent — aktørspørsmål til NIBIO om protein-gram-serie og akvakulturfôr-korreksjon | research/external/r13/R13-PROT-007-proteinselvforsyning.md |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Brreg rolledata (A) for 8 aktører: Invertapro, NorInsect, Vestkorn, NoMy, Avisomo, Onna, Vertical Agri. Rest AS bekreftet slettet (konkurs 2024-09-05). Gruten AS ikke funnet. Aksjonærregister C-celle systematisk. | vent — Proff Forvalt/Skatteetaten for aksjonærdata; dsm-firmenich årsrapport for Vestkorn | research/external/r13/R13-AKTOR-006-eierskap-founders.md |
| R13-OKO-001 | 10 | Økologisk areal og produksjon i Norge | PCQ | Norsk øko-areal stabilt ~4,3–4,5 % (2024, inkl. karens), vedvarende nedgang i produsentantall siden 2011–2012. 10%-mål 2032 krever dobling. Øko-salg +17,6 % 2025, men norsk melkeproduksjon faller. Import-vs-norsk andel: C. | **importer** med synlige tomme celler (godkjent/karens-skille; import/norsk) — Debio statistikkhefte 2025 er sterkeste A-kilde | research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord: måleprogrammer og baseline | PCQ | Norge mangler nasjonal SOC-baseline for jordbruksjord. JordVAAK oppstartet 2026, første analyse tidligst ~2036. UNFCCC-karbontall er Tier 1/2-modellert, ikke direkte målt. 39 % av jordbruksareal mangler jordsmonnskart. | vent — JordVAAK tidligst 2029; NIBIO jordsmonnskart (61 % dekning) kan brukes som proxy med caveat | research/external/r13/R13-OKO-003-jordhelse-karbon.md |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft: nasjonale mål, EU F2F og måloppnåelse | PCQ | Riksrevisjonen (jun. 2025): klimamål IKKE i rute. Jordvernmål nådd 2025 (1 763 daa, foreløpig). Øko-areal 4,6 % mot 10 %-mål 2032. Selvforsyning ~40 % mot vedtatt mål 50 %. EU F2F ikke EØS-innlemmet. | **importer** med synlige tomme celler (matsvinn ekskl. primærjordbruk; selvforsyningsprognose; pollinatorbestandsmål) | research/external/r13/R13-OKO-007-policy-mal-okologi.md |
| R13-LAND-001 | 12 | Makt- og eierkonsentrasjon — dagligvare, grossist, foredling og fôr | PCQ | KT Dagligvarerapport 2024 (A): NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 %. Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023, A). Grossistprosenter: C. Fiskefôr 2024: C. Kraftfôrandel: C. | **importer** med synlige C-celler (grossistprosenter, fiskefôr, Tine 2024, kraftfôrandel) — KT-rapporten er sterkeste A-kilde | research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md |
| R13-LAND-002 | 12 | Vertikal integrasjon og kontroll i norsk matsystem | PCQ | 28 integrasjonskoblinger dokumentert fra årsrapporter: NG (ASKO, UNIL, BAMA 46 %), Coop (industri, logistikk), Reitan (Norsk Kylling 100 %, Stange Gård 95 %), Nortura, Tine, Mowi (rogn-til-pakke), FK (Norgesmøllene 2025). 6 tomme celler. | **importer** med 6 navngitte PCQ-tomme celler (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | research/external/r13/R13-LAND-002-vertikal-integrasjon.md |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Lokal/kort kjede øker forsyningssikkerhet kun via navngitt mekanisme (redundans, desentralisert lager, redusert innsatsvare-import) — ikke via identitet; ingen norsk kvantifisering funnet. | vent — kildekort, ikke claim | research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Feltet dominert av kapasitet/plan, ikke realisert fôr-grade volum; Enorm (DK) konkurs okt 2025, Solar Foods 160 t/år men mat ikke fôr, Invertapro er mealworm. | aktørspørsmål (realisert volum, se også actor-gate) | research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md |
| R13-GAP-003 | 02 | Transport/lager-sårbarhet (mat, Norden) | source-shortlist | Åpent myndighetsmateriale kobler transport/havn/lager/kaldkjede til mat, men overveiende kvalitativt; tallfestet: NO ~60 % importavhengighet, 34–40 % fôrjustert selvforsyning, 82 500 t matkorn (~3 mnd) innen 2029. | importer som kildekort; node-tonnasje forblir C | research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Matsentralen 5 735 tonn omfordelt 2024 (primær/aktørrapport B). TGTG norsk 2024-statistikk ikke offentliggjort (C). Ingen nasjonal redistributionstotal mulig uten metodebro. | vent — hold til TGTG og Matvett publiserer oppdaterte per-kanal-tall | research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Nofima 67/2016 gir samlede estimater (bryggeri ~17 000 tonn mask, slakteri ~264 000 tonn), men utdatert (~10 år). Meieri-tall aktørformidlet uten verifiserbar primærkilde. Per-fraksjon-celler tomme. | vent — hent Nofima-fulltekst, TINE-årsrapport og SSB 14458 | research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md |
| R13-WASTE-006 | 04 | Kaffegrut og urbane sidestrømmer | source-shortlist | SCG-volum estimert til 70 000–84 000 t/år vått (B, avledet). Ingen separat SSB-fraksjon. Mesteparten i matavfallsstrøm (R3/R9). Gruten AS marginalt. HORECA-data er C. | vent — kjør SSB 08801 API for kaffeimport; kartlegg HORECA-etterlevelse | research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md |
| R13-WASTE-008 | 04 | Prevention-tiltak med baseline | source-shortlist | Bransjeavtale/KuttMatsvinn gir sektorbaseline (2015/2017), men ingen studie isolerer enkelt-tiltak (R1) med kontrollgruppe. Matsvinnloven (juni 2025) strukturelt tiltak uten effektdata. Dagligvare –47 % er sterkest dokumentert. | vent — PCQ per tallfestet effektutsagn; hent Nordic Council Nord 2024:034 fulltekst | research/external/r13/R13-WASTE-008-prevention-baseline.md |
| R13-PROT-001 | 05 | Insektprotein aktørledger | source-shortlist | Insektprotein i Norge/Norden er FoU/pilot/kapasitet/regulatorisk mulighet, ikke åpen realisert fôrvolumserie; Invertapro er sterkt aktøranker, men ingen tonnasje. | importer som aktør-/regelverksledger; volum til actor-gate/PCQ | research/external/r13/R13-PROT-001-insektprotein.md |
| R13-PROT-002 | 05 | Single-cell og fermenteringsprotein | source-shortlist | Unibio har fôrrelevant førsteforsendelse og Solar Foods har matprotein-kapasitet, men kapasitet/LOI/førsteforsendelse er ikke kontinuerlig nordisk årsvolum. | importer som teknologi-/aktørledger; hold mat og fôr separat | research/external/r13/R13-PROT-002-single-cell-fermentering.md |
| R13-PROT-003 | 05 | Musling, tang og tare | source-shortlist | FHF/Nofima/HI gir FoU-anker for blåskjellprotein, men prosjektmål og potensial er ikke realisert fôrvolum; tang/tare/mikroalger mangler kommersiell volumserie. | importer som FoU-/datagapledger, ikke volumclaim | research/external/r13/R13-PROT-003-musling-tang-tare.md |
| R13-PROT-004 | 05 | Plantebasert humanprotein | source-shortlist | Nofima/NIBIO/Landbruksdirektoratet gir markeds- og råvareankre, men ikke én åpen tabell for produkt, volum, markedsandel og råvareopprinnelse. | importer som marked-/råvareprofil med C-felt | research/external/r13/R13-PROT-004-plantebasert-humanprotein.md |
| R13-AKTOR-003 | 06 | REKO-ringer oppdaterte tall | source-shortlist | Primærtall fryst ved feb. 2022 (rekonorge.no: >140 ringer, ~500 000 kunder, >600 produsenter, B-klasse). REKO Norge stiftet jan. 2025 men ingen årsmelding per juni 2026. | vent — kontakt REKO Norge; sjekk DIGIFOOD-sluttrapport (USN) | research/external/r13/R13-AKTOR-003-reko-ringer-tall.md |
| R13-AKTOR-008 | 08 | Lokalmat-distribusjon og REKO-alternativer | source-shortlist | 938 mill. kr direktesalg 2025 (A, Lokalmatrapport 2025). Godt Lokalt/DLVRY >1 mrd. kr (A). Kanaldekomponering ikke offentlig (C). Digitale plattformer uten omsetningstall (B/C). | vent — kanaldekomponering mangler; kontakt Stiftelsen Norsk Mat og Bondens marked for per-kanal-tall | research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md |
| R13-PROT-008 | 08 | Norsk dyrking av bønner, erter og åkerbønne | source-shortlist | Samlet belgvekstareal ~86 000 daa 2024 (B, NIBIO). Nesten all produksjon til kraftfôr. Volumtall (tonn) mangler som SSB-serie (C). Landbruksdirektoratets rapport feb. 2026 utreder virkemidler — ingen tilskudd vedtatt. | vent — hent SSB tabell 07495 belgvekster; les rapport 3-16/2026 fulltekst | research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md |
| R13-INNO-001 | 08 | CEA og vertikalt landbruk i Norge | source-shortlist | Onna Greens: NOK 17,5 mill. omsetning 2024, -9,6 mill. driftsresultat (A). Himmelgrønt (Coop/Avisomo JV): 100 t/år mål, i butikk 2026 (B), regnskap ukjent (C). Ingen aktør med realisert produksjonsvolum i åpen kilde. | vent — Himmelgrønt org.nr. i Brreg; Coop-årsrapport 2025; aktørspørsmål til Onna Greens | research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md |
| R13-INNO-002 | 08 | Agritech/foodtech-økosystem Norge | source-shortlist | NCE Heidner Biocluster: 50+ medl., NOK 66 mrd. membersmasse-omsetning (A). Nofence €30M Series B 2025, Saga Robotics €9,5M 2025 (B). Stortinget: nasjonal agritech-strategi bestilt mai 2025, ikke fremlagt. Aggregert VC-kapital mangler offentlig kilde (C). | vent — nasjonal strategistatus; NIC-klyngedatabase; Dealroom NO for kapitalstatistikk | research/external/r13/R13-INNO-002-agritech-okosystem.md |
| R13-INNO-007 | 10 | Offentlig innovasjonsetterspørsel: mat og kommunale piloter | source-shortlist | Oslo kommune FUSILLI (2021–2024) og 46-tiltaksplan (2023) er sterkeste caser. DFØ-veiledning for lokalprodusert mat i anskaffelser (A, 2025). LUP/Innovative anskaffelser: ingen mat-case i aktiv portefølje per juni 2026. Doffin og Forsvaret: C. | vent — LUP-arkiv direkte; Doffin systematisk søk; Oslo Bymiljøetat for FUSILLI-implementeringsstatus | research/external/r13/R13-INNO-007-offentlig-innovasjon.md |
| R13-OKO-004 | 11 | Biodiversitet i jordbrukslandskap — indikatorer, kilder og trend | source-shortlist | Fugler ned ~25 % siden 2000 (3Q/NIBIO 2026, DOI). Naturindeks 2025: åpent lavland = 0,445, lavest av alle 7 økosystemer. 60 % av semi-naturlig eng i gjengroing (ASO/NIBIO 2026). Pollinatortrend: for kort serie (fra 2021). Insektbiomasse i åker: C. | **importer** — sterk A-kildedekning for fugler og naturtyper; tomme celler for pollinatortrend og insekter synlige | research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md |
| R13-OKO-005 | 11 | Sertifiserings- og merkeordninger for mat i Norge | source-shortlist | Debio: 3 018 godkjente virksomheter 2025 (A). Nyt Norge: 6 100 produkter / 43 mrd. NOK 2024 (A). Distinksjon: Nyt Norge = opprinnelse (ikke miljø). Stiftelsen Norsk Mat er privat stiftelse. Kontroll via egenrevisjon. | **importer** — primærkildedekning god; tomme celler for Debio avgift, USDA-ekvivalens, BOB/BGB-liste 2025 | research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md |
| R13-OKO-006 | 11 | Beite, utmark og husdyr-økologi | source-shortlist | 1,3 mill. sau/lam + 270 000 storfe + 63 000 geit på utmarksbeite 2025 (SSB, A). Metan = 48,5 % av jordbruksutslipp (NID 2025, Tier 2, GWP100/AR5). SOC i utmark: utenfor inventaret, endringsdata tidligst 2033. | **importer** — solid A-kildedekning for areal og utslipp; SOC-gap eksplisitt dokumentert | research/external/r13/R13-OKO-006-beite-utmark-husdyr.md |
| R13-LAND-005 | 13 | Bevegelse- og nettverkskart — regenerativ/lokalmat/øko | source-shortlist | 19 nettverkskoblinger (A fra org.sider): Økologisk Norge drifter andelslandbruk.no; GMO-nettverket = paraply for 18 medl. + 3 støttemedl. med styreoverlapp; Bondens marked stiftet av Oikos/Bondelaget/NBS m.fl.; KVANN spunnet ut av NIBIO/Hageselskapets Planteklubber. Oikos→Økologisk Norge (2018). | vent — kildekort; Slow Food-status, KVANN org.nr/permakultur-link og Bondens marked-stifterskap (B) er C/uverifisert | research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ → claim-lock | Kun de smaleste radene med uavhengig primær (Rest-konkurs 2024, andelslandbruk 93/2023) er claim-lock-kandidater; ASKO 70 % og SOIL-score blir IKKE claims. | smal claim-lock kun etter PCQ, per rad | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### docs/project/mandates/R13-LAND-006-figurkandidater.md

````markdown
# R13-LAND-006 — Figurkandidat-oversikt for whitepaper

## Hva dette er — og hva det ikke er

Dette er et **internt arbeidsregister** over hvilke R13-funn som *teknisk kunne bli* en figur, tabell, case-card eller kart i et eventuelt fremtidig whitepaper. Det er en kartlegging, **ikke en godkjenning til å publisere**, og **ikke en faktastemme**.

- Hver kandidat beholder **gaten fra originalfilen** (PCQ / source-shortlist / actor-gate / forstaelse / internal / parkert). Ingen funn er oppgradert fordi det ville gitt en god figur. En klar dataserie og en figur-klar dataserie er ikke det samme: gate avgjør, ikke estetikk.
- Kolonnen **Figur-klar?** sier kun om funnet *per nå* har den datakvaliteten + synlige tomme cellene en ærlig figur krever — den endrer ikke gaten.
- Filen er ikke siterbar, åpner ingen ekstern claim, ingen DB-skriving, ingen `safe_for_ai_context`, ingen deck-/whitepaper-stemme.
- **Overclaim-vakt:** ingen kandidat er listet uten både gate, status og en eksplisitt figur-klar-vurdering. Funn som er Type C, PCQ-med-C-hull, eller parkert er listet — men flagget *ikke figur-klar* med grunn. En C-luke skal aldri fremstå som figur-klar data.

Kilde: syntese fra R13 batch 01–12 (`r13-intake-index-2026-06-25.md` + de underliggende batch-filene) og claim-lock-/PCQ-status i `food-tg-claim-lock-table-2026-05.md`. Ingen ny primærresearch.

## Kort dom

R13 inneholder en håndfull funn som er nær figur-klare som tabell/figur — først og fremst dagligvarekonsentrasjon (KT 2024), vertikal-integrasjonskjedene (28 koblinger fra årsrapporter), marint restråstoff R-stige, proteinselvforsyning (rå vs. fôrkorrigert), og biodiversitetsindikatorene. Flertallet av R13-funnene er derimot **ikke figur-klare**: de er enten PCQ med navngitte C-celler, source-shortlist (kildekort, ikke claim), actor-gate (mangler aktør-/volumdata), eller `forstaelse`/`internal` (arbeidskart, ikke faktastemme). Av ~30 kandidater under er ca. 6–8 figur-klare *med synlige tomme celler og caveat*, resten er kandidater-blokkert til neste kontrollsteg.

## Sterkeste kilde

Dette er en **syntese**, så "sterkeste kilde" er det sterkeste underliggende R13-grunnlaget: R13-LAND-001 (Konkurransetilsynets Dagligvarerapport 2024, A), R13-LAND-002 (konsernårsrapporter + BAMA-eierseksjon, A), R13-WASTE-001 (SINTEF/FHF Analyse marint restråstoff 2024, A, fulltekst), R13-PROT-007 (NIBIO/Helsedirektoratet 2025, A) og R13-OKO-004 (NIBIO 3Q + Naturindeks 2025, A). Disse fem har primærkildedekning som tåler en figur dersom tomme celler vises.

## Svakeste punkt

Selve registeret arver alle svakhetene i underlaget: mange "fristende" funn (fiskefôr-andeler, grossistprosenter, aktør-/volumserier for altprotein og CEA, nasjonal SOC-baseline, protein-gram-serie) ser tabellklare ut men er C-hull. Den største risikoen ved et figur-register er nettopp at en C-luke pakkes inn som en pen figur. Registeret kan dessuten gi falsk inntrykk av at "mange figurer er klare" — i realiteten er stoppregelen «ikke visualiser R13 før gate, dataklasse, svakeste punkt og tomme celler vises i selve figuren» (intake-index) bindende for alle rader.

## Figurkandidater

Kolonner: **Funn | Figurtype | Kilde-ID (R13) | Gate | Status | Figur-klar? (ja/nei + grunn) | Caveat**

### Domene: Landskap / makt

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Dagligvarekonsentrasjon: NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 % (2024) | Stolpe-/kakediagram | R13-LAND-001 | PCQ | importer | **Ja** — 4 kjeder ≈ 100 %, A-kilde (KT 2024), tomme celler ligger i andre ledd, ikke i dagligvare | Coop oppgir selv 29,3 %; «~100 %» må vises som fire konkurrenter, ikke monopol |
| Vertikal integrasjon: 28 dokumenterte konsern→ledd-koblinger | Sankey/nettverk/integrasjonskart | R13-LAND-002 | PCQ | importer | **Ja, betinget** — A-kilder for hovedledd; men 6 navngitte PCQ-tomme celler MÅ vises (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | Eierandel på underdatterselskap delvis C; ikke fremstill 49 %-Nova Sea som heleid |
| Foredlingskonsentrasjon: Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023) | Tabell | R13-LAND-001 | PCQ | importer | **Nei** — Tine 2024 ikke isolert (B/C); Norturas slakteandel i % er C (NOEK ikke i åpen tabell) | Ikke si Tine >80 %; merk samvirke/markedsregulator-kontekst |
| Grossistledd: tre vertikalt integrerte fullsortimentsgrossister (ASKO/Coop/REMA Distr.) | Tabell/struktur-diagram | R13-LAND-001 | PCQ | importer | **Nei** — ingen offentlige prosentandeler per grossist (C); kun utledet | Kvalitativ strukturbeskrivelse mulig, men ingen prosentfigur |
| Fiskefôr-oligopol: Skretting/Cargill/BioMar | Kake-/stolpediagram | R13-LAND-001 | PCQ | importer | **Nei** — 2024-andeler er C; siste tall er 2012/estimat (iLaks/Studocu) | Ikke gi prosentandeler uten 2024-primærkilde; alle tre utenlandsk eid |
| Helsystem-kart, ti-node aktørtypologi | Oversiktsfigur / systemkart | R13-LAND-003 | forstaelse | vent (arbeidskart) | **Nei** — `forstaelse`, ikke faktastemme; blinde flekker (WASTE, regenerativ) | Kan inspirere whitepaper-struktur, men kan ikke presenteres som datafigur |
| Datagap-atlas: 60+ C-hull i 10 domener | Heatmap / gap-matrise | R13-LAND-004 | internal | vent | **Nei (som ekstern figur)** — intern kartleggingsmatriks, ikke siterbar | Stoppliste forbyr nordisk/datagap-figur uten scope+metode+gate; egnet kun internt |

### Domene: Waste / sidestrømmer

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Marint restråstoff R-stige: 1,094 mill. t, 89 % utnyttet, 15 % konsum / 66 % fôr / 19 % energi (2024) | R-stige / verdihierarki-figur | R13-WASTE-001 | PCQ | importer | **Ja, betinget** — A-fulltekst (SINTEF/FHF); MÅ vise tomme celler (eksportvolum per R-nivå, biogass-tonn avledet) og skille utnyttet fra høyverdi | «Utnyttet ≠ høyverdi»; eksport er kryssende destinasjon, ikke R-nivå |
| Husholdnings-/detaljmatsvinn: husholdning 193 200 t (2023), dagligvare 43 600 t (2024) | Tverrledd stolpediagram | R13-WASTE-004 | PCQ | importer | **Nei** — husholdning 2024 mangler, matindustri kun t.o.m. 2022; ulike basisår/metoder | Ingen tverrledd-figur før alle ledd har samme år+metode |
| Dagligvare matsvinn –47 % mot baseline | Trend-/baseline-figur | R13-WASTE-008 | source-shortlist | vent | **Nei** — sektorbaseline finnes, men ingen tiltaks-isolasjon med kontrollgruppe | «Måltider reddet» ≠ effektbevis (jf. CL-B-022 `klar-med-forbehold`) |
| Matsvinn-redistribusjon: Matsentralen 5 735 t (2024) | Kanalsammenligning / total | R13-WASTE-003 | source-shortlist | vent | **Nei** — TGTG 2024 er C; ingen nasjonal total uten metodebro | Ingen redistribusjonstotal-figur før per-kanal-tall foreligger |
| Oppdrettsslam massebalanse: 535 412 t slam / 14 000 t P (2019, modellert) | 3-kolonners massebalanse | R13-WASTE-002 | PCQ (parkert) | parkert | **Nei** — modellert ≠ innsamlet ≠ behandlet; åpne merder samler ~0; tre kolonner ukoblet | Parkert til aktør-/primærdata kobler kolonnene; ingen massebalanse-figur |
| Industrielle sidestrømmer: bryggeri ~17 000 t, slakteri ~264 000 t | R-stige / sektor-tabell | R13-WASTE-007 | source-shortlist | vent | **Nei** — tall fra 2016 (~10 år); meieri aktørformidlet; per-fraksjon C | Ingen sektorrangering før oppdaterte primærtall + bruk/potensial skilt |
| Kaffegrut / SCG: 70 000–84 000 t/år vått (avledet) | Massestrøm-figur | R13-WASTE-006 | source-shortlist | vent | **Nei** — dobbelt avledet estimat (B); ingen SSB-fraksjon; HORECA er C | Ingen massestrøm-/R-stige-figur før SSB-API + HORECA-data |
| Digestat NPK-retur: SE-tall (N 5,1 / P 0,60 / K 2,1 kg/t) | NO/SE-sammenligningstabell | R13-WASTE-005 | PCQ → actor-gate | vent | **Nei** — Norge B/C; ingen nasjonal aggregering; K særlig svak | SPCR 120 aggregerer ikke NO-data; ingen norsk NPK-figur uten primærmåling |

### Domene: Protein

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Proteinselvforsyning: rå 41,3 % / fôrkorrigert 34,9 % (2024) | Dobbel-søyle med metodeetikett | R13-PROT-007 | PCQ | vent | **Ja, betinget** — A-kilde; MÅ ha metodeetikett (rå/fôrkorrigert) og vise at fiskefôr er ekskludert | Protein-gram-serie er C; fôrkorrigert dekker ikke akvakultur |
| Soya/SPC-erstatning i fôr: SPC ~21 %, fiskemjøl 65 %→12 % (1990→2020) | Tidsserie / stacked area | R13-PROT-006 | PCQ | vent | **Nei (post-2020)** — ressursregnskap 2020 er siste A-kilde; post-2020 er B/C | Ingen erstatningsgraf etter 2020 uten nyere Nofima/FHF-primærkilde |
| Norsk belgvekstareal ~86 000 daa (2024) | Arealtrend-figur | R13-PROT-008 | source-shortlist | vent | **Nei** — areal er B (NIBIO); volum (tonn) mangler som SSB-serie (C) | Ikke kombiner ert+åkerbønne uten SSB-tabell; ikke bland mat/fôr |
| Plantebasert humanprotein: marked/produsent/volum/råvare | Markedsandels-figur | R13-PROT-004 | source-shortlist | vent | **Nei** — ingen åpen tabell kobler produkt, volum, andel og råvareopprinnelse | Marked-/råvareprofil med C-felt; ingen andelsgraf |
| Insektprotein aktørledger (Norge/Norden) | Aktør-/volumledger | R13-PROT-001 | source-shortlist | vent | **Nei** — FoU/pilot/kapasitet; åpent realisert fôrvolum mangler (C) | Ikke bland kapasitet og realisert; jf. CL-A-021 `krever-bekreftelse` |
| Single-cell / fermenteringsprotein (Unibio, Solar Foods) | Teknologi-/kapasitetsledger | R13-PROT-002 | source-shortlist | vent | **Nei** — kapasitet/LOI/førsteforsendelse ≠ årsvolum; mat og fôr blandes lett | Ingen kapasitetsfigur som blander mat, fôr, plan og produksjon |
| Musling/tang/tare som fôrprotein | FoU-/datagapledger | R13-PROT-003 | source-shortlist | vent | **Nei** — FoU/potensial sterkt, kommersiell volumserie mangler | Ingen marint-proteinvolumfigur før realisert vs. potensial skilt |
| Presisjonsfermentering / dyrket kjøtt: realisert EU/NO-volum = 0 | Status-/regulatorisk figur | R13-PROT-005 | forstaelse | vent (bakgrunnskart) | **Nei** — `forstaelse`; ingen EU/NO-godkjenning; Mattilsynets stilling er C | Ingen statusrangering uten regulatorisk godkjenning + realisert volum |

### Domene: Innovasjon

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Failure/survival-ledger: 5 av 9 aktører konkurs/avviklet siden 2019 | Case-card-sett / ledger-tabell | R13-INNO-004 | source-shortlist | vent | **Delvis (case-card, ikke dom-figur)** — Rest AS er A (Brreg); øvrige B; Nordic Harvest C | Konkurs ≠ teknologisvikt; ikke bland teknologisvikt og forretningssvikt i én dom-figur |
| CEA / vertikalt landbruk: Onna Greens 17,5 mill. oms / −9,6 mill. drift (2024) | Aktør-case-card | R13-INNO-001 | source-shortlist | vent | **Nei (som sektorfigur)** — Onna er A, men ingen aktør oppgir realisert tonn/år (C) | Ambisjon ≠ realisert (Himmelgrønt planmål B/C); ingen produksjonsvolum-figur |
| Agritech/foodtech-økosystem: NCE Heidner 50+ medl. | Økosystem-/klyngekart | R13-INNO-002 | source-shortlist | vent | **Nei** — aggregert VC-statistikk er C; medlemsmasse-oms (66 mrd.) ≠ klyngekapital | Ingen aggregert kapitalfigur; nasjonal strategi ikke vedtatt |
| Konverteringsbarrierer: 7 kategorier | Barriere-rammeverk / matrise | R13-INNO-005 | source-shortlist | vent | **Nei** — norsk-spesifikk kvantitativ evidens C for nær alle | Ingen barriere-rangering uten norsk kvantitativ evidens |
| FoU-aktører: 30+ aktive prosjekter | FoU-landskapskart | R13-INNO-006 | source-shortlist | vent | **Nei** — budsjett/bemanning per prosjekt C; prosjekt ≠ resultat | Listen ikke fullstendig; ingen av prosjektene gir nåtidsvalidering |
| Offentlig innovasjonsetterspørsel: FUSILLI, Oslo 46-tiltaksplan | Portfolio-/case-figur | R13-INNO-007 | source-shortlist | vent | **Nei** — caser avsluttet/uklart operativ; DFØ er verktøy, ikke case; Doffin C | Ikke behandle DFØ-veiledning som implementert case (jf. CL-C-002 `krever-bekreftelse`) |

### Domene: Økologi / jord / biodiversitet

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Biodiversitet: kulturlandskapsfugler −25 % siden 2000 (indeks 75, basis 100) | Tidsserie-figur | R13-OKO-004 | source-shortlist | importer | **Ja** — A-kilde (NIBIO 3Q, DOI); konsistent 2000–2023-serie | Proxy for landskapskvalitet, ikke kausalitet; ikke si «biodiversiteten i fri fall» |
| Naturindeks åpent lavland = 0,445 (lavest av 7 økosystemer) | Sammenligningsstolper | R13-OKO-004 | source-shortlist | importer | **Ja, betinget** — A (Naturindeks 2025); aggregert indeks, ikke direkte bestandstall | Indirekte mål via naturtypetilstand; forklar skala 0–1 |
| Semi-naturlig eng: 60 % i gjengroing, CR på rødliste | Status-/tilstandsfigur | R13-OKO-004 | source-shortlist | importer | **Ja (status), Nei (trend)** — A statusmål fra første ASO-omdrev; ingen trenddata ennå | Arealanslag bredt konfidensintervall; kun statusmål |
| Pollinatortrend (humler/sommerfugler, 3Q) | Trend-figur | R13-OKO-004 | source-shortlist | importer | **Nei** — serie fra 2021, for kort for trend | Ikke si pollinatorer i sterk tilbakegang uten trenddata |
| Økologisk areal stabilt ~4,3–4,6 % vs. 10 %-mål 2032 | Mål-mot-status-figur | R13-OKO-001 | PCQ | importer | **Ja, betinget** — A (Debio 2025); MÅ vise godkjent/karens-skille + import/norsk tom celle | Ikke vis som «vekst»; salgsøkning ≠ produksjonsøkning |
| Beite/utmark: 1,3 mill. sau + 270 000 storfe + 63 000 geit (2025) | Tabell / fordelingsfigur | R13-OKO-006 | source-shortlist | importer | **Ja (areal/dyr), Nei (karbon)** — A for dyretall; SOC-utmark utenfor inventaret (C) | Ikke si utmarksbeite er karbonnøytralt/lagrer karbon |
| Husdyr-metan = 48,5 % av jordbruksutslipp (Tier 2, GWP100/AR5) | Andelsfigur | R13-OKO-006 | source-shortlist | importer | **Ja, betinget** — A; MÅ merke metode (Tier 2, GWP100/AR5) | Ikke si GWP20 er brukt |
| Policy-måloppnåelse: klima ikke i rute, øko 4,6/10 %, selvforsyning ~40/50 % | Mål-mot-status dashboard | R13-OKO-007 | PCQ | importer | **Ja, betinget** — A (Riksrevisjonen jun. 2025); flere tomme celler (matsvinn ekskl. primær, pollinatormål) | Ikke si klimamål i rute; ikke si EU F2F forplikter Norge |
| Sertifisering: Debio 3 018 virksomheter; Nyt Norge 6 100 produkter / 43 mrd. (2024) | Tabell / oversiktsfigur | R13-OKO-005 | source-shortlist | importer | **Ja, betinget** — A-tall; distinksjon opprinnelse vs. miljø MÅ stå | Ikke si Nyt Norge = miljømerke; ikke si Debio = offentlig tilsyn |
| Jordhelse/SOC: ingen nasjonal baseline; JordVAAK først ~2036 | Tidslinje / gap-figur | R13-OKO-003 | PCQ | vent | **Nei** — ingen SOC-tidsserie; UNFCCC-tall er Tier 1/2-modellert | Ikke fremstill modellerte UNFCCC-tall som direktemålinger |
| Agroøkologisk/regenerativ metrikk: ingen samlet nasjonal overvåking | Gap-figur | R13-OKO-002 | forstaelse | vent (arbeidskart) | **Nei** — `forstaelse`; C-gap for nær alle nasjonal-metrikker | Ikke bruk prosjektresultater som nasjonale data |

### Domene: Aktør / bevegelse

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Lokalmat-distribusjon: 938 mill. kr direktesalg (2025) | Kanal-/markedsfigur | R13-AKTOR-008 | source-shortlist | vent | **Nei** — totaltall A, men kanaldekomponering ikke offentlig (C); plattformer B/C | Ingen kanalsammenligning uten dekomponering |
| REKO-ringer: >140 ringer, ~500 000 kunder (frosset feb. 2022) | Vekst-/kart-figur | R13-AKTOR-003 | source-shortlist | vent | **Nei** — primærtall frosset 2022 (B); ingen 2025-årsmelding | Ikke fremstill 2022-tall som nåtidsfaktum |
| Eierskap/founders sirkulær/altprotein/CEA (8 aktører, Brreg-roller) | Foundernettverk / eierskapsgraf | R13-AKTOR-006 | PCQ | vent | **Nei** — aksjonærregister C for alle 8; Rest AS slettet; Gruten ikke funnet | Ingen eierskapsgraf uten aksjonærdata; styrerolle ≠ eierskap |
| Markedshager: 18 Brreg-bekreftede foretak | Bransje-/kart-figur | R13-AKTOR-001 | actor-gate | vent | **Nei** — Brreg gir minimumsanker; populasjonstotal ukjent | Ingen totaltall; ingen bransjefigur uten Småskala Grønt Norge-data |
| Andelslandbruk: 90 aktive (B) / 25 Brreg-bekreftet (A), jan. 2026 | Per-gård-kart / trend | R13-AKTOR-002 | actor-gate | vent | **Nei** — ~65–70 gårder per-status ikke tilgjengelig (Økoguiden JS-blokkert) | Ingen per-gård-oversikt; ingen trendgraf uten konsistent kilde |
| Regenerative praktikere: 11 navngitte gårder (B) | Distribusjons-/kart-figur | R13-AKTOR-004 | actor-gate | vent | **Nei** — HM-utøverkart ikke offentlig; totalpåstand mangler primærkilde | Ingen totaltall; ingen geografisk figur uten primærregister |
| Frønettverk/genressurs: 4 noder (KVANN, NIBIO, NordGen ~33 000 prøver, Solhatt) | Nodekart | R13-AKTOR-005 | actor-gate | vent | **Nei (som datafigur)** — A for nodene, men nåværende tall/norsk-andel mangler | Frøsamlerne = dansk (ikke norsk); ingen NordGen norsk-andel uten GENBIS |
| Skogshage/permakultur: 13 sites (B) | Site-kart | R13-AKTOR-007 | actor-gate | vent | **Nei** — ingen nasjonal inventarliste; Google Maps-embed ikke maskinlesbar | Ingen nasjonalt dekkende siteoversikt |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````


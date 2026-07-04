# R13 Intake And Triage Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: internal triage; not fact voice
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for r13 intake and triage evidence.

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
- research/_status/food-tg-r13/r13-qc-report-2026-06-25.md
- research/_status/food-tg-r13/r13-risk-closeout-2026-06-25.md

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

### research/_status/food-tg-r13/r13-qc-report-2026-06-25.md

````markdown
# Food TG R13 QC-rapport

**Dato:** 2026-06-25
**Scope:** R13 decision JSONL, backlogg, canonical output-filer og intake-indeks.
**Regel:** Intern kontroll. Ingen DB-skriving, ingen claim-åpning, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Kort dom

R13 er strukturelt komplett etter QC-passet: 50 backlogg-IDer, 50 decision-rader, 50 unike decision-IDer og 50 eksisterende canonical output-filer. Ingen decision-rad er claim-lock-kandidat. Alle canonical output-filer har ID, gate/status/bruk-markør og `Ikke si`-seksjon.

QC-passet fant én indekskorreksjon: `må ikke visualiseres ennå` manglet `R13-GAP-002` og `R13-GAP-006` selv om begge fortsatt er stop-/gateavhengige. Intake-indeksen er derfor oppdatert fra 48 til 50 rader i den gruppen.

## Strukturkontroll

| Kontroll | Resultat | Evidens |
|---|---:|---|
| Backlogg-rader | 50 | `research/_status/food-tg-research-backlog-2026-06-25.csv` |
| Decision-rader | 50 | `batch-01` til `batch-12` har 4 hver; `batch-13` har 2 |
| Unike decision-IDer | 50 | ingen duplikater |
| Missing decisions mot backlogg | 0 | `[]` |
| Ekstra decision-IDer | 0 | `[]` |
| Manglende canonical paths | 0 | alle `canonicalPath` finnes som fil |
| Manglende required decision-felt | 0 | schemafeltene var utfylt for alle 50 |

## Gate- og importkontroll

Decision-loggene summerer slik:

| Gate | Antall |
|---|---:|
| source-shortlist | 24 |
| PCQ | 13 |
| actor-gate | 6 |
| forstaelse | 3 |
| internal | 3 |
| parkert | 1 |

Intake-indeksen viser i tillegg `forstaelse` som 4 fordi `R13-GAP-006` er krysslistet som actor-gate og forståelses-/triageunderlag. Dette er en bevisst overlapp, ikke en ekstra decision-rad.

| Importbeslutning | Antall |
|---|---:|
| importer | 37 |
| aktørspørsmål | 6 |
| vent | 6 |
| parker | 1 |
| claim-lock-kandidat | 0 |

## Output-filkontroll

| Krav | Resultat |
|---|---:|
| Literal ID i canonical output | 50 / 50 |
| Gate-markør | 50 / 50 |
| Status/bruksregel/bruk-markør | 50 / 50 |
| `Ikke si` eller tilsvarende stoppliste | 50 / 50 |
| Tomme celler / gap / hull synlig i output | 50 / 50 |

## Intake-indeks

Etter QC-korreksjonen stemmer nøkkeltallene i indeksen med decision-loggene og overlappsregelen:

| Gruppe | Antall | Merknad |
|---|---:|---|
| PCQ-ready | 13 | matcher PCQ-gate |
| source-shortlist | 24 | matcher source-shortlist-gate |
| claim-lock candidate | 0 | matcher decision-logg |
| actor-gate | 6 | matcher actor-gate-gate |
| forstaelse | 4 | inkluderer `R13-GAP-006` som overlapp |
| internal only | 3 | matcher internal-gate |
| parkert | 1 | matcher parkert-gate |
| må ikke visualiseres ennå | 50 | alle R13-rader holdes utenfor ekstern figur til gate/metode/tomme celler er synlige |

## Visualiseringskontroll

Ingen R13-rad er figurklar som ekstern figur, radar, rangering eller deckuttak. PCQ- og source-shortlist-rader trenger metodefelt, kildeklasse og tomme celler. Actor-gate-rader trenger aktør-/registerdata. Forståelse/internal-rader er ikke kilder. `R13-GAP-005` er parkert.

Korreksjonen som ble gjort i indeksen:

| ID | Hvorfor lagt inn i `må ikke visualiseres ennå` |
|---|---|
| R13-GAP-002 | mekanisme-evidens kan ikke bli resiliensfigur uten volum, robusthetsmål og actor-gate for REKO/andelslandbruk |
| R13-GAP-006 | intern Type A/B/C-triage kan ikke bli datagap- eller actor-gate-figur uten å gjøre intern syntese til kilde |

## Claim-lock kontroll

Det finnes ingen claim-lock candidates i decision-loggene eller intake-indeksens claim-lock-tabell. R13-GAP-005 ble eksplisitt parkert, og PCQ-ready-radene er bare kontrollkø, ikke claim-lock.

## Gjenværende risiko

- PCQ-risikoen er fulgt opp i `r13-pcq-first-pass-2026-06-25.md`: top 8 har live locator-sjekk, kontrollkort og fortsatt claim-lock-stopp.
- Actor-gate-risikoen er fulgt opp i `r13-actor-gate-action-packet-2026-06-25.md`: alle seks actor-gate-rader har minimumsspørsmål, dataminimum og stoppsignal.
- `forstaelse` og `internal only` kan styre videre arbeid, men må ikke siteres som ekstern kilde.
- Noen output-filer inneholder ASCII-normalisert norsk tekst fra tidligere batcher; dette påvirket ikke schema/QC, men kan ryddes språklig senere hvis de skal publiseres internt bredere.

Se samlet status i `r13-risk-closeout-2026-06-25.md`.
````

### research/_status/food-tg-r13/r13-risk-closeout-2026-06-25.md

````markdown
# Food TG R13 risk closeout

**Dato:** 2026-06-25
**Scope:** Oppfølging av gjenværende risiko fra R13 QC-closeout.
**Regel:** Intern kontroll. Ingen DB-skriving, ingen claim-åpning, ingen commit.

## Kort dom

De gjenværende risikoene er gjennomgått og flyttet fra løse risikopunkter til kontrollerte arbeidsflater:

1. PCQ-risikoen er redusert med `r13-pcq-first-pass-2026-06-25.md`.
2. Actor-gate-risikoen er redusert med `r13-actor-gate-action-packet-2026-06-25.md`.
3. Commit-/lekkasjerisikoen er fortsatt styrt av `r13-commit-gate-2026-06-25.md`; ingen staging eller commit er gjort.
4. Neste session er forberedt i `docs/project/mandates/food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md`.

Det som fortsatt står igjen, er ikke desk-completable i denne runden uten å bryte gate-reglene: claim-lock krever radvis uttrekk/metodearbeid etter PCQ, og actor-gate krever aktør-/registerdata eller menneskelig oppfølging.

## Risiko etter oppfølging

| Risiko fra QC | Tiltak gjort | Status etter tiltak | Neste ansvar |
|---|---|---|---|
| PCQ-rader har sterke A-kilder, men mangler primærkontroll | Top 8 fikk live locator-sjekk, kontrollkort, tillatt intern formulering og claim-lock-stopp | Redusert; ikke claim-locket | neste PCQ-arbeidspakke |
| Actor-gate-rader mangler aktiv-status, volum, register/nodeinfo eller avtaledata | Seks actor-gate-rader fikk ask-matrise, dataminimum og stoppsignal | Redusert; fortsatt actor-gate | menneske/aktør/register |
| Forståelse/internal kan forveksles med kilde | Closeout markerer at disse styrer arbeid, men ikke siteres eksternt | Kontrollert | behold i intake/QC |
| ASCII-normalisert tekst i enkelte output-filer | Ikke rettet i denne runden fordi det ikke påvirker schema/QC og ville være kosmetisk | Lav, akseptert | eventuell senere språkvask |
| Hovedcheckout har unrelated dirty state | Ikke rørt; arbeidet holdt i `.worktrees/food-tg-research-r13` | Kontrollert | ikke stage/commit fra hovedcheckout |
| Neste session kan starte fra utdatert QC-handoff | Ny continuation prompt er laget, og gammel QC-prompt er markert superseded | Kontrollert | bruk ny prompt |

## Stopppunkt

Ikke gå videre til claim-lock, figurer, deck, whitepaper eller DB uten ny eksplisitt beskjed og en egen kontrollrunde. R13 er nå sterkere som intern research- og gatepakke, men ikke som ekstern faktapakke.
````


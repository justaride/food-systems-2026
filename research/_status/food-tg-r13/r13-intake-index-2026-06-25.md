---
tittel: Food TG R13 intake/triageindeks
dato: 2026-06-25
status: UNDER ARBEID — batch 01-13 mottaksført
scope: Runde 13 batch 01-13, basert på batchrapporter og decision JSONL
bruksregel: Ikke faktastemme. Ikke batch-output. Ikke whitepaper/deck. Bruk som triagekart for neste kontrollsteg.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
  - docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
---

# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 50 / 50
- **Decision-batcher funnet:** `batch-01`, `batch-02`, `batch-03`, `batch-04`, `batch-05`, `batch-06`, `batch-07`, `batch-08`, `batch-09`, `batch-10`, `batch-11`, `batch-12`, `batch-13`
- **Batcher ikke funnet som decision/report-fil:** ingen
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 13 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 24 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 0 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 6 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 4 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 3 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 50 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 lukker konkrete HS-serier, men sluttbruk og samlet fôrprotein er fortsatt C/metodegap. | importer | `research/external/r13/R13-GAP-001-kritiske-importnoder.md` |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF 2024 er A-anker for restråstoffstatus; R-stige krever synlig metode. | importer | `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md` |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Oppdrettsslam er godt dokumentert som ressurs/problem; nasjonal realisert massebalanse mangler. | importer | `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md` |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | Matvett/NORSUS gir baseline, men sektorer og metoder må vises per rad. | importer | `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md` |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige er A-anker via SPCR 120; Norge har ikke lukket faktisk NPK-retur. | importer | `research/external/r13/R13-WASTE-005-digestat-npk-retur.md` |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | Kraftfôrproteinråvarer i 2025 var ca. 95 % importert; dette er mix, ikke soya-substitusjon. | importer | `research/external/r13/R13-PROT-006-soya-erstatning-for.md` |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | NIBIOs 35 % fôrkorrigert selvforsyning er energibasert, ikke proteinselvforsyning. | importer | `research/external/r13/R13-PROT-007-proteinselvforsyning.md` |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Brreg gir selskapsstruktur/roller, ikke komplett eierskap/founders. | importer | `research/external/r13/R13-AKTOR-006-eierskap-founders.md` |
| R13-OKO-001 | 10 | Økologisk areal og produksjon | PCQ | Økologisk areal ligger rundt 4,5 % inkl. karens i 2025, men SSB/Debio og karens/sertifisert må avstemmes. | importer | `research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md` |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord | PCQ | JordVAAK/LSK er sterke programkilder, men målt nasjonal baseline/trend er under bygging. | importer | `research/external/r13/R13-OKO-003-jordhelse-karbon.md` |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft | PCQ | Norge har 10 %-økomål innen 2032; øvrige bærekraftsmål må skilles fra EU- og metodekilder. | importer | `research/external/r13/R13-OKO-007-policy-mal-okologi.md` |
| R13-LAND-001 | 12 | Makt og eierkonsentrasjon | PCQ | Dagligvarekonsentrasjon har sterke regulatorankre, men tverrledds makt er strukturkart, ikke intensjonsclaim. | importer | `research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md` |
| R13-LAND-002 | 12 | Vertikal integrasjon | PCQ | Vertikal integrasjon kan kartlegges som datert eier-/strukturkart, ikke kartell- eller tilgangsnektclaim. | importer | `research/external/r13/R13-LAND-002-vertikal-integrasjon.md` |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Mekanisme-evidens finnes, men ikke for "lokalmat = resilient" uten mekanisme. | importer | `research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md` |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Alternative fôrproteiner er mest kapasitet/plan/pilot; realisert fôr-grade årsvolum er ikke offentlig lukket. | importer | `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md` |
| R13-GAP-003 | 02 | Transport og lager-sårbarhet | source-shortlist | Transport/lager kan være matrelevant risikoinventar, men ikke tallfestet kapasitetsmodell. | importer | `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md` |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Matsentralen gir B-anker for 5 735 tonn omfordelt i 2024; ikke nasjonal redistribusjonstotal. | importer | `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md` |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Industrielle sidestrømmer kan bli fraksjonsledger, ikke nasjonal volumclaim. | importer | `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md` |
| R13-WASTE-006 | 04 | Kaffegrut og urbane sidestrømmer | source-shortlist | Kaffegrut er avledet massestrøm, ikke målt norsk avfallsfraksjon. | importer | `research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md` |
| R13-WASTE-008 | 04 | Prevention-tiltak med baseline | source-shortlist | Prevention-tiltak krever baseline og målemetode før effektpåstand. | importer | `research/external/r13/R13-WASTE-008-prevention-baseline.md` |
| R13-PROT-001 | 05 | Insektprotein aktørledger | source-shortlist | Insektprotein er FoU/pilot/kapasitet/regulatorisk mulighet, ikke åpen realisert fôrvolumserie. | importer | `research/external/r13/R13-PROT-001-insektprotein.md` |
| R13-PROT-002 | 05 | Single-cell og fermenteringsprotein | source-shortlist | Single-cell har sterke teknologispor; kapasitet og første shipment er ikke årlig realisert volum. | importer | `research/external/r13/R13-PROT-002-single-cell-fermentering.md` |
| R13-PROT-003 | 05 | Musling, tang og tare | source-shortlist | Musling/tang/tare lukkes som FoU- og datagapledger, ikke volumclaim. | importer | `research/external/r13/R13-PROT-003-musling-tang-tare.md` |
| R13-PROT-004 | 05 | Plantebasert humanprotein | source-shortlist | Plantebasert humanprotein har markedsankre, men ikke komplett åpen volum-/råvaretabell. | importer | `research/external/r13/R13-PROT-004-plantebasert-humanprotein.md` |
| R13-PROT-008 | 06 | Norsk dyrking av bønner og erter | source-shortlist | Erter og åkerbønner har sterk 2026-statistikk, men mat/fôr-splitt og foredlingskjede er fortsatt gap. | importer | `research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md` |
| R13-AKTOR-003 | 07 | REKO-ringer oppdaterte tall | source-shortlist | REKO har ferskt ringtall, men ikke ferske produsent-/kundetall. | importer | `research/external/r13/R13-AKTOR-003-reko-ringer-tall.md` |
| R13-AKTOR-008 | 08 | Lokalmat-distribusjon og REKO-alternativer | source-shortlist | Lokalmat-kanaler kan kartlegges, men volum og markedsandel er B/C. | importer | `research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md` |
| R13-INNO-001 | 08 | CEA/vertikalt landbruk | source-shortlist | CEA-aktører finnes, men ambisjon/kapasitet/produksjon må skilles. | importer | `research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md` |
| R13-INNO-002 | 08 | Agritech/foodtech-økosystem | source-shortlist | Agrifoodtech-økosystemet har klyngeankre, ikke komplett funding-/effektledger. | importer | `research/external/r13/R13-INNO-002-agritech-okosystem.md` |
| R13-INNO-004 | 09 | Failure/survival-ledger | source-shortlist | Failure/survival må føres per juridisk enhet og jurisdiksjon, ikke som teknologidom. | importer | `research/external/r13/R13-INNO-004-failure-survival-ledger.md` |
| R13-INNO-006 | 09 | FoU-aktører og forskningsmiljøer | source-shortlist | FoU-aktører har sterke prosjektlokatorer, men prosjekt er ikke implementert resultat. | importer | `research/external/r13/R13-INNO-006-fou-aktorer.md` |
| R13-INNO-005 | 09 | Konverteringsbarrierer | source-shortlist | Barrieremønstre kan kartlegges, men enkeltcase generaliserer ikke alene. | importer | `research/external/r13/R13-INNO-005-konverteringsbarrierer.md` |
| R13-INNO-007 | 10 | Offentlig innovasjonsetterspørsel | source-shortlist | Offentlig etterspørsel finnes som anskaffelser og piloter, ikke skalert systemendring. | importer | `research/external/r13/R13-INNO-007-offentlig-innovasjon.md` |
| R13-OKO-005 | 11 | Sertifiserings- og merkeordninger | source-shortlist | Merkeordninger dokumenterer ulike krav, ikke netto miljøeffekt. | importer | `research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md` |
| R13-OKO-004 | 11 | Biodiversitet i jordbrukslandskap | source-shortlist | Biodiversitetsproxyer viser press/nedgang, men ikke kausal driftspraksis. | importer | `research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md` |
| R13-OKO-006 | 11 | Beite, utmark og husdyr-økologi | source-shortlist | Beite/utmark har sterke statistikk- og metodeankre, men ikke kausalt metan-/karbontall. | importer | `research/external/r13/R13-OKO-006-beite-utmark-husdyr.md` |
| R13-LAND-005 | 12 | Bevegelse- og nettverkskart | source-shortlist | Bevegelsesfeltet kan mottaksføres som kildedatert relasjonsliste, ikke komplett nettverksgraf. | importer | `research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md` |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| | | | | | | |

## actor-gate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering og actor-gate-kø | actor-gate | Intern triage av hull; ikke ekstern kilde. | aktørspørsmål | `research/forstaelse/R13-GAP-006-type-c-eskalering.md` |
| R13-AKTOR-001 | 06 | Markedshager fra kandidat til verifisert | actor-gate | Markedshager har nettverks-/kartlokatorer, men ikke komplett verifisert produsentregister. | aktørspørsmål | `research/_status/R13-AKTOR-001-markedshager-verifisert.md` |
| R13-AKTOR-002 | 06 | Andelslandbruk aktiv status per gård | actor-gate | Økoguiden gir andelslandbruk-lokatorer, men ikke verifisert aktiv 2025/2026-status per gård. | aktørspørsmål | `research/_status/R13-AKTOR-002-andelslandbruk-aktiv-status.md` |
| R13-AKTOR-004 | 07 | Regenerative og agroøkologiske praktikere | actor-gate | Regenerative praktikere har prosjekt-/nettverkslokatorer, ikke verifisert gårdsregister. | aktørspørsmål | `research/_status/R13-AKTOR-004-regenerative-praktikere.md` |
| R13-AKTOR-005 | 07 | Frøbevarings- og genressurs-nettverk | actor-gate | Frønettverk har tydelige noder, men nodevis sort-/volumstatus mangler. | aktørspørsmål | `research/external/r13/R13-AKTOR-005-fronettverk-genressurs.md` |
| R13-AKTOR-007 | 08 | Skogshage og permakultur-sites | actor-gate | Skogshage/permakultur har kart- og nettverkslokatorer, ikke verifisert site-register. | aktørspørsmål | `research/_status/R13-AKTOR-007-skogshage-permakultur-sites.md` |

## forstaelse

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-006 | 02 | Type-C-eskalering og actor-gate-kø | actor-gate | R12 C-hull er delt i Type A desk-uttak, Type B actor-gate og ekte Type C. | aktørspørsmål | `research/forstaelse/R13-GAP-006-type-c-eskalering.md` |
| R13-PROT-005 | 06 | Presisjonsfermentering og dyrket kjøtt | forstaelse | Presisjonsfermentering har aktør-/kapasitetsankre, men EU/Norge-salg og dyrket-kjøttvolum er ikke lukket. | vent | `research/forstaelse/R13-PROT-005-presisjonsfermentering-dyrket-kjott.md` |
| R13-OKO-002 | 10 | Agroøkologisk og regenerativ metrikk | forstaelse | Måleprogrammer finnes, men ikke offentlig nasjonalt register for regenerative effekter per gård. | vent | `research/forstaelse/R13-OKO-002-agrookologisk-metrikk.md` |
| R13-LAND-003 | 12 | Helsystem-kart | forstaelse | Helsystem-kartet er intern kontrollmodell for videre gatearbeid, ikke faktakilde. | vent | `research/forstaelse/R13-LAND-003-helsystem-kart.md` |

## internal only

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-INNO-003 | 09 | Finansiering og virkemidler | internal | Funding-fit har sterke virkemiddelankre, men søkerrolle, konsortium og topic-frister er ikke avklart. | vent | `docs/project/mandates/R13-INNO-003-finansiering-virkemidler.md` |
| R13-LAND-004 | 13 | Datagap-atlas | internal | Datagap-atlaset sorterer Type A/B/C-hull, men er intern kontrollkø, ikke kilde. | vent | `docs/project/mandates/R13-LAND-004-datagap-atlas.md` |
| R13-LAND-006 | 13 | Figurkandidater | internal | Figurkandidater må bli små kontrollfigurer med gate, kildeklasse, metode og tomme celler synlig før bruk. | vent | `docs/project/mandates/R13-LAND-006-figurkandidater.md` |

## parkert

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-005 | 01 | Parkerte R12-claims verifisering | parkert | Ingen parkert R12-tallclaim kan løftes direkte; delankre er styrket, men claimsene forblir parkert. | parker | `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md` |

## må ikke visualiseres ennå

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | Kan visualiseres først når HS/proxy, sluttbruksgap og foreløpig/endelig status vises. | importer | `research/external/r13/R13-GAP-001-kritiske-importnoder.md` |
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Ingen resiliensfigur uten dokumentert mekanisme, volum, robusthetsmål og actor-gate for REKO/andelslandbruk. | importer | `research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md` |
| R13-GAP-005 | 01 | Parkerte R12-claims verifisering | parkert | Skal ikke visualiseres som verifiserte claims; dette er en park-/nedgraderingsledger. | parker | `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md` |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | R-stigefigur må vise metode og enhet per kategori. | importer | `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md` |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Ingen aktørgraf som viser volum uten at realisert/kapasitet/plan er skilt. | importer | `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md` |
| R13-GAP-006 | 02 | Type-C-eskalering og actor-gate-kø | actor-gate | Ingen datagap- eller actor-gate-figur som gjør intern triage til primærkilde eller fyller C-celler med estimat. | aktørspørsmål | `research/forstaelse/R13-GAP-006-type-c-eskalering.md` |
| R13-GAP-003 | 02 | Transport og lager-sårbarhet | source-shortlist | Ingen sårbarhetskart med dagsdekning/lagerkapasitet som ikke er åpent dokumentert. | importer | `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md` |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Ingen massebalansefigur som blander modellert, oppsamlet og behandlet volum. | importer | `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md` |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Ingen nasjonal redistribusjonsgraf uten metode og dobbelttellingskontroll. | importer | `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md` |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | Ingen sektorfigur uten år/metode/scope per rad. | importer | `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md` |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Ingen nordisk NPK-rangering eller digestat-returfigur uten faktisk spredd mengde. | importer | `research/external/r13/R13-WASTE-005-digestat-npk-retur.md` |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Ingen R-stige eller sidestrømsvolum som blander dagens bruk og potensial. | importer | `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md` |
| R13-WASTE-006 | 04 | Kaffegrut og urbane sidestrømmer | source-shortlist | Ingen kaffegrutvolumfigur uten avledet/metodeetikett og våt/tørr-vekt. | importer | `research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md` |
| R13-WASTE-008 | 04 | Prevention-tiltak med baseline | source-shortlist | Ingen tiltak/effektfigur uten baseline, måleperiode og scope. | importer | `research/external/r13/R13-WASTE-008-prevention-baseline.md` |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | Ingen soya-erstatningsfigur uten tidsserie og skille landfôr/fiskefôr. | importer | `research/external/r13/R13-PROT-006-soya-erstatning-for.md` |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | Ingen proteinselvforsyningsfigur før proteinfaktorer og mat/fôr-scope er definert. | importer | `research/external/r13/R13-PROT-007-proteinselvforsyning.md` |
| R13-PROT-001 | 05 | Insektprotein aktørledger | source-shortlist | Ingen volumgraf for insektprotein uten realisert tonnasje. | importer | `research/external/r13/R13-PROT-001-insektprotein.md` |
| R13-PROT-002 | 05 | Single-cell og fermenteringsprotein | source-shortlist | Ingen single-cell kapasitetsgraf som blander mat, fôr, plan og produksjon. | importer | `research/external/r13/R13-PROT-002-single-cell-fermentering.md` |
| R13-PROT-003 | 05 | Musling, tang og tare | source-shortlist | Ingen marint-proteinvolumfigur uten å skille potensial, FoU og realisert volum. | importer | `research/external/r13/R13-PROT-003-musling-tang-tare.md` |
| R13-PROT-004 | 05 | Plantebasert humanprotein | source-shortlist | Ingen markedsandelsgraf uten datadekning og råvareopprinnelse. | importer | `research/external/r13/R13-PROT-004-plantebasert-humanprotein.md` |
| R13-PROT-005 | 06 | Presisjonsfermentering og dyrket kjøtt | forstaelse | Ingen modenhets-/volumgraf som blander kapasitet, søknad, godkjenning og salg. | vent | `research/forstaelse/R13-PROT-005-presisjonsfermentering-dyrket-kjott.md` |
| R13-PROT-008 | 06 | Norsk dyrking av bønner og erter | source-shortlist | Ingen areal-/volumtrend uten fôr/mat-scope, foreløpig status og sesongsvingninger. | importer | `research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md` |
| R13-AKTOR-001 | 06 | Markedshager fra kandidat til verifisert | actor-gate | Ingen markedshagekart som later som kart-/API-dekning er komplett eller aktiv-verifisert. | aktørspørsmål | `research/_status/R13-AKTOR-001-markedshager-verifisert.md` |
| R13-AKTOR-002 | 06 | Andelslandbruk aktiv status per gård | actor-gate | Ingen andelslandbruk-total eller kart som bruker Økoguiden-treff som aktiv 2026-register. | aktørspørsmål | `research/_status/R13-AKTOR-002-andelslandbruk-aktiv-status.md` |
| R13-AKTOR-003 | 07 | REKO-ringer oppdaterte tall | source-shortlist | Ingen REKO-trend eller nasjonal total uten år og kildeklasse. | importer | `research/external/r13/R13-AKTOR-003-reko-ringer-tall.md` |
| R13-AKTOR-004 | 07 | Regenerative og agroøkologiske praktikere | actor-gate | Ingen praktikerkart som later som dekningen er komplett/verifisert. | aktørspørsmål | `research/_status/R13-AKTOR-004-regenerative-praktikere.md` |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Ingen eierskapsgraf uten aksjonærregister og dato. | importer | `research/external/r13/R13-AKTOR-006-eierskap-founders.md` |
| R13-AKTOR-005 | 07 | Frøbevarings- og genressurs-nettverk | actor-gate | Ingen frønettverksatlas uten nodevis norsk kobling og accession-/sortscaveat. | aktørspørsmål | `research/external/r13/R13-AKTOR-005-fronettverk-genressurs.md` |
| R13-AKTOR-007 | 08 | Skogshage og permakultur-sites | actor-gate | Ingen nasjonalt skogshagekart uten site-verifikasjon. | aktørspørsmål | `research/_status/R13-AKTOR-007-skogshage-permakultur-sites.md` |
| R13-AKTOR-008 | 08 | Lokalmat-distribusjon og REKO-alternativer | source-shortlist | Ingen lokalmat-kanalfigur uten dedupe og volumcaveat. | importer | `research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md` |
| R13-INNO-001 | 08 | CEA/vertikalt landbruk | source-shortlist | Ingen CEA-volumgraf uten realisert årsvolum. | importer | `research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md` |
| R13-INNO-002 | 08 | Agritech/foodtech-økosystem | source-shortlist | Ingen økosystem-/kapitalgraf uten kildeklasse per node. | importer | `research/external/r13/R13-INNO-002-agritech-okosystem.md` |
| R13-INNO-003 | 09 | Finansiering og virkemidler | internal | Ingen funding-radar uten søkerrolle, frist og konsortium. | vent | `docs/project/mandates/R13-INNO-003-finansiering-virkemidler.md` |
| R13-INNO-004 | 09 | Failure/survival-ledger | source-shortlist | Ingen failure-graf som beviser teknologi- eller sektortrend. | importer | `research/external/r13/R13-INNO-004-failure-survival-ledger.md` |
| R13-INNO-006 | 09 | FoU-aktører og forskningsmiljøer | source-shortlist | Ingen FoU-økosystemkart som later som dekningen er komplett eller resultater implementert. | importer | `research/external/r13/R13-INNO-006-fou-aktorer.md` |
| R13-INNO-005 | 09 | Konverteringsbarrierer | source-shortlist | Ingen barrieremodell uten A-kilde per mønster og single-case caveat. | importer | `research/external/r13/R13-INNO-005-konverteringsbarrierer.md` |
| R13-INNO-007 | 10 | Offentlig innovasjonsetterspørsel | source-shortlist | Ingen offentlig-innovasjonskart uten pilot/status/anskaffelsesutfall. | importer | `research/external/r13/R13-INNO-007-offentlig-innovasjon.md` |
| R13-OKO-001 | 10 | Økologisk areal og produksjon | PCQ | Ingen økoarealfigur uten karens vs sertifisert og SSB/Debio-valg. | importer | `research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md` |
| R13-OKO-002 | 10 | Agroøkologisk og regenerativ metrikk | forstaelse | Ingen regenerativ effektfigur uten offentlig baseline/resultatdata. | vent | `research/forstaelse/R13-OKO-002-agrookologisk-metrikk.md` |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord | PCQ | Ingen jordkarbontrendfigur før målt baseline og gjentaksmåling finnes. | importer | `research/external/r13/R13-OKO-003-jordhelse-karbon.md` |
| R13-OKO-005 | 11 | Sertifiserings- og merkeordninger | source-shortlist | Ingen merke-score uten auditdata og effektgrunnlag. | importer | `research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md` |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft | PCQ | Ingen måloppnåelsesgraf før achievement-seriene er PCQ-et. | importer | `research/external/r13/R13-OKO-007-policy-mal-okologi.md` |
| R13-OKO-004 | 11 | Biodiversitet i jordbrukslandskap | source-shortlist | Ingen samlet biodiversitetsfigur uten proxy- og scopeetikett. | importer | `research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md` |
| R13-OKO-006 | 11 | Beite, utmark og husdyr-økologi | source-shortlist | Ingen beite/metan/karbonfigur uten metode og systemgrense. | importer | `research/external/r13/R13-OKO-006-beite-utmark-husdyr.md` |
| R13-LAND-001 | 12 | Makt og eierkonsentrasjon | PCQ | Ingen makt-/HHI-figur uten metode, nevner og tomme celler. | importer | `research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md` |
| R13-LAND-002 | 12 | Vertikal integrasjon | PCQ | Ingen eiergraf uten datert eierprosent og franchisecaveat. | importer | `research/external/r13/R13-LAND-002-vertikal-integrasjon.md` |
| R13-LAND-005 | 12 | Bevegelse- og nettverkskart | source-shortlist | Ingen nettverkskart uten relasjonstype, dato og aktiv-statuscaveat. | importer | `research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md` |
| R13-LAND-003 | 12 | Helsystem-kart | forstaelse | Ingen systemfigur eksternt; dette er forståelsesnotat. | vent | `research/forstaelse/R13-LAND-003-helsystem-kart.md` |
| R13-LAND-004 | 13 | Datagap-atlas | internal | Ingen datagap-atlasfigur før Type A/B/C, gate og neste handling vises. | vent | `docs/project/mandates/R13-LAND-004-datagap-atlas.md` |
| R13-LAND-006 | 13 | Figurkandidater | internal | Ingen radar/rangering/spider chart uten radvis kildeklasse, metode og tomme celler. | vent | `docs/project/mandates/R13-LAND-006-figurkandidater.md` |

## Neste kontrollrekkefølge

1. Løft `PCQ-ready` først, men bare som smale kontrolloppgaver med locator, metodefelt og synlige C-celler.
2. Flytt `source-shortlist` til kildekort/metodekort før noen tekst blir claim-nær.
3. Hold `actor-gate` utenfor desk-claims til aktørdata eller primærlokator per aktør er innhentet.
4. Bruk `forstaelse` og `internal only` som arbeidskart, ikke som siterbar kunnskap.
5. Ikke visualiser R13 før figurgrunnlag har gate, dataklasse, svakeste punkt og tomme celler i selve figuren.

## Stoppliste

- Ikke importer hele R13-output i source-shortlist, PCQ, claim-lock, deck eller whitepaper.
- Ikke løft tall som bare er aktørrapportert, kapasitet forvekslet med realisert, eller strukturindikator gjort til intensjon, uten ny kontroll.
- Ikke lag nordisk rangering, radar/spider eller datagapfigur uten synlig scope, metode, gate og tomme celler.
- Ikke behandle `forstaelse` som kilde.

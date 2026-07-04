# Figure Candidates Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: internal figure candidates; not publish-ready
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for figure candidates evidence.

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

- docs/project/mandates/R13-LAND-006-figurkandidater.md
- research/_status/food-tg-r13/r13-pcq-first-pass-2026-06-25.md

## Source Excerpts

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

### research/_status/food-tg-r13/r13-pcq-first-pass-2026-06-25.md

````markdown
# Food TG R13 PCQ first pass

**Dato:** 2026-06-25
**Scope:** Første pass på topp 8 fra `r13-pcq-queue-2026-06-25.md`.
**Regel:** Dette er primary-check queue-kontroll, ikke claim-lock. Ingen claims åpnes.

## Kort dom

Første PCQ-pass reduserer risikoen fra "sterke, men ukontrollerte PCQ-kandidater" til konkrete kontrollkort. Alle toppkandidatene har live primær-/ankerlokatorer per 2026-06-25, med ett viktig unntak: Brreg-lenken i `R13-LAND-002` er en mal (`{orgnr}`) og kan ikke brukes som kilde før den erstattes med orgnummer-spesifikke kall.

Ingen av radene er klare for claim-lock. De er klare for neste kontrollerte arbeidspakke: radvis uttrekk med metodekolonner, tomme celler og presis stoppliste.

## Live locator-sjekk

| ID | Primær-/ankerlokatorer sjekket | Status | Merknad |
|---|---|---|---|
| R13-GAP-001 | SSB 08801 / import og eksport alle land og varenummer | 200 | SSB-lokator live; bulkuttak må dokumentere kode, år, kg, verdi og opprinnelsesland. |
| R13-OKO-001 | SSB 12661, SSB artikkel, Debio statistikk | 200 | SSB/Debio-live; tall må avstemmes før kanonisk formulering. |
| R13-WASTE-001 | SINTEF publikasjon, FHF prosjekt 901844 | 200 | Kildene er live; R-stige er fortsatt vår omkoding. |
| R13-LAND-001 | Konkurransetilsynet Dagligvarerapport 2025, ASKO, Coop årsrapporter | 200 | Regulatorrapport live; aktørsider er støtte, ikke nøytral andelskilde. |
| R13-OKO-007 | Regjeringen/LMD strategi, Landbruksdirektoratet rapport, EU Farm to Fork | 200 | Nasjonalt mål live; EU-mål må ikke gjøres norsk. |
| R13-WASTE-004 | Matvett/NORSUS faktaark, SSB notat 2025/37, SSB husholdningsavfall | 200 | Kildene er live; SSB avfallskategori er ikke spiselig matsvinn. |
| R13-LAND-002 | KT Dagligvarerapport 2024/25, Menon/NFD rapport | 200 | Brreg-mal `{orgnr}` feiler som forventet; erstatt med orgnummer-spesifikke kall før bruk. |
| R13-OKO-003 | NIBIO JordVAAK, JordVAAK implementation, LSK-jord | 200 | Programkilder live; baseline/trend er ikke publisert som ferdig nasjonal målt serie. |

## PCQ-kontrollkort

| Pri | ID | PCQ-status etter første pass | Tillatt intern formulering | Må fortsatt kontrolleres før claim-lock/figur |
|---:|---|---|---|---|
| 1 | R13-GAP-001 | Locator live og kontrollspørsmål er smalt nok. | SSB kan støtte importserier per HS/proxy for utvalgte noder. | Sluttbruk, art/fiskeri, rent fosfat og samlet fôrprotein er ikke lukket. |
| 2 | R13-OKO-001 | Locator live, men kanonisk tallvalg er ikke låst. | Økoareal kan omtales med SSB/Debio som kilde og eksplisitt karens-/sertifisert-splitt. | Velg SSB eller Debio som kanonisk rad; ikke si 4,5 % sertifisert. |
| 3 | R13-WASTE-001 | Locator live og A-anker sterkt. | SINTEF/FHF kan støtte 2024-restråstoffstatus og hovedanvendelser. | R-stige må ha metode, enhet og råstoff-/produktvekt-splitt. |
| 4 | R13-LAND-001 | Regulatorlocator live. | Dagligvarekonsentrasjon kan beskrives som regulatorstøttet strukturindikator. | Grossist/fôr/tverrsegment HHI, beneficial ownership og intensjonsclaims er ikke lukket. |
| 5 | R13-OKO-007 | Nasjonal strategi og støtteindikatorer live. | Norge har et nasjonalt 10 %-mål for økologisk jordbruksareal innen 2032. | EU 25 %-mål, pesticider/næringsstoffer, matsvinn og klimaavtale må holdes i egne målserier. |
| 6 | R13-WASTE-004 | Baseline-/metodelokatorer live. | Matvett/NORSUS kan støtte kartlagt matsvinn med sektor-/metodecaveat. | Direkte 2024-husholdningsmåling, harmonisert sektormetode og SSB-avfallsbegrep må ikke blandes. |
| 7 | R13-LAND-002 | Regulator-/rapportlokatorer live, Brreg ikke kildeklar før orgnr-kall. | Vertikale koblinger kan føres som datert struktur-/ownership-edge ledger. | Franchise-/kontrollvilkår, private avtaler og Brreg-orgnummer per rad. |
| 8 | R13-OKO-003 | Programlokatorer live. | Norge har etablerte overvåkingsprogrammer for jordhelse/jordkarbon. | Ferdig målt nasjonal baseline, trend, usikkerhet og LULUCF-vs-målt karbon-splitt. |

## Beslutning

Disse åtte radene går ikke til claim-lock. De går til smale neste artefakter med radvis uttrekk:

1. `R13-GAP-001`: importnode extraction sheet.
2. `R13-OKO-001`: økoareal-/mål-kort.
3. `R13-WASTE-001`: R-stige-metodetabell.
4. `R13-LAND-001`: strukturkart-ledger.
5. `R13-OKO-007`: policy target matrix.
6. `R13-WASTE-004`: matsvinn-baseline-tabell.
7. `R13-LAND-002`: datert ownership-edge ledger.
8. `R13-OKO-003`: soil-monitoring gap card.

## Ikke si

- Ikke si at noen av disse er claim-locket.
- Ikke bruk live URL-status som bevis for tallinnhold; den beviser bare at locator er tilgjengelig.
- Ikke bruk Brreg-mal-URL som kilde.
- Ikke lag figur uten metodekolonner og tomme celler.
````


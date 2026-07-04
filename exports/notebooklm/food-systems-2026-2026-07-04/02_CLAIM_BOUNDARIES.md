# Claim Boundaries And Source Labels

Export date: 2026-07-04
Packet type: control
Status label: internal context
Allowed use: Use as the hard boundary document for claims, citations, figures and external language.

## What This Source Is For

Prevent NotebookLM from smoothing parked, uncertain or actor-gated research into confident presentation claims.

## Core Claims Or Working Propositions

- External claims require source locators, accessed dates and provenance.
- Internal synthesis can organize thinking, but it is not a substitute for primary evidence.
- The R13 intake index is a triage map, not a fact source.
- Do-not-visualize-yet is a blocking label for charts, rankings and deck figures.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| primary | Original publication, official register, law text, annual report or authority data. | Required for central external claims. |
| synthesis | Project synthesis of named sources. | Not primary proof for finance, ownership, legal or register facts. |
| legacy_unsourced | Historical row without sufficient source. | Blocked from whitepaper and new imports. |
| PCQ-ready | Candidate for primary-claim qualification. | Needs locator and method check before external voice. |

## Known Caveats

- Do not use internal status counts as if they were current live production facts unless the source itself is current.
- Do not cite source-shortlist packets as completed evidence.

## Deck Angles

- Make the claim boundary visible as a trust feature: "what we know / what is blocked / what must be asked".
- Use the stop-list as an appendix for reviewers.

## Bad Generic Framing To Avoid

- Do not say "verified" unless the source status says verified.
- Do not say "complete coverage" when a dashboard or backlog shows gaps.
- Do not make actor intent claims from structural market data.

## Source Paths Included

- .claude/source-attribution-policy.md
- research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

## Source Excerpts

### .claude/source-attribution-policy.md

````markdown
# Source Attribution Policy

> Datert: 2026-05-18
> Gjelder: nye importer, nye DB-fakta, whitepaper-eksport og brukerflater som viser faktiske påstander.

## Formål

Alle faktiske påstander som importeres, vises i appen eller brukes i juni-2026-whitepaperet skal kunne spores til en navngitt kilde med lokator, aksessdato og klassifisert proveniens. Eldre data kan merkes som legacy i en overgangsfase, men skal ikke passere som whitepaper-klare uten eksplisitt kildegrunnlag.

## SourceClass

| Klasse | Bruk | Minimumskrav |
|---|---|---|
| `primary` | Original publisering, årsrapport, offentlig vedtak, lovtekst, registerutskrift eller myndighetsdata | URL, `accessedAt`, og lokal kopi når kilden er brukt til en sentral påstand |
| `secondary` | Analyse, media, bransjeartikkel eller rapport som tolker primærdata | URL, `accessedAt`, tydelig avsender og publiseringsdato hvis tilgjengelig |
| `synthesis` | Prosjektets egen sammenstilling av flere navngitte kilder | Underlagskilder må være koblet; syntesen er ikke selv primærbevis |
| `internal_construct` | Forskningskonstrukt laget for analysemodellering, for eksempel syntetisk eiendomsgren | Må ha forklaring, ansvarlig import og lenke til intern syntese eller beslutningsnotat |
| `registry_snapshot` | Maskinell eller manuell snapshot fra offentlig register/API | URL/API-endepunkt, `accessedAt`, lokal JSON/PDF/HTML-kopi og SHA-256 når mulig |
| `legacy_unsourced` | Historisk rad uten tilstrekkelig kilde | Tillatt bare som overgangsstatus; blokkeres fra whitepaper-eksport og nye importer |

## VerificationStatus

| Status | Betydning |
|---|---|
| `unverified` | Kilden er registrert, men feltet er ikke kontrollert manuelt eller maskinelt |
| `machine_verified` | Feltet er avstemt mot strukturert ekstern kilde eller registersnapshot |
| `human_verified` | Feltet er kontrollert av navngitt reviewer med dato |
| `disputed` | Kildene spriker eller feltet trenger faglig vurdering |
| `rejected` | Feltet er vurdert som feil, blokkert eller uegnet for bruk |

## AccessedAt

- `accessedAt` skal lagres som ISO-8601 med dato-presisjon: `YYYY-MM-DD`.
- Nye kilder uten aksessdato skal avvises av import-helper eller audit.
- Hvis en kilde har både publiseringsdato og aksessdato, skal begge bevares der modellen støtter det. Aksessdato erstatter ikke publiseringsdato.

## Lokatorer

For alle nye ikke-interne kilder kreves minst én av:

- `url`
- `localPath`
- `sourceDocId`
- `documentId`

For sentrale whitepaper-påstander skal en ekstern URL normalt ha lokal arkivkopi eller en koblet `Document`/`SourceDoc`.

## Internal Synthesis

`synthesis` eller eksisterende `internal_synthesis` er gyldig når prosjektet sammenstiller flere navngitte kilder, lager et register, eller formulerer en analyse basert på dokumenterte underlagskilder.

Det er ikke gyldig som erstatning for manglende primærkilde til:

- regnskapstall
- eierandeler
- styre- og rolleinformasjon
- subsidiebeløp
- registerstatus for selskaper
- konkrete juridiske eller regulatoriske vedtak

## Forskningskonstrukter

Forskningskonstrukter er entiteter som finnes i analysemodellen, men ikke nødvendigvis som juridisk registrerte selskaper. Eksempler er syntetiske orgnummer eller interne eiendomsgrener som brukes for å modellere struktur.

Slike entiteter skal:

- merkes med `isResearchConstruct = true`
- ha `orgNrFormat = 'research_construct'`
- ha en `internal_construct` eller `synthesis`-citation
- ikke vises som ordinær registerverifisert virksomhet

Standardspørringer til rapporter og whitepaper skal ekskludere forskningskonstrukter med mindre de er eksplisitt valgt inn.

## Hva betyr verifisert

Et felt er verifisert når verdien er kontrollert mot kilden som faktisk dokumenterer feltet.

- Brønnøysund Enhetsregisteret kan verifisere selskapsidentitet, adresse, organisasjonsform, NACE, status og roller der API-et har feltet.
- Enhetsregisteret skal ikke brukes som kilde for omsetning eller EBITDA dersom slike verdier ikke finnes i responsen.
- Regnskapstall krever årsrapport, Regnskapsregisteret-utskrift, OffentligData financial statement, Proff eller tilsvarende eksplisitt regnskapskilde med lovlig tilgang.
- Rolledata skal bruke separat rollekilde/snapshot, ikke bare generell selskapsmetadata.

## Valutakonvertering til NOK

NOK-konverterte regnskapstall er ikke verifisert bare fordi kildevaluta-tallet er funnet. Begge ledd må dokumenteres:

1. source-currency value fra primærkilde, for eksempel `net sales SEK 84,057m`
2. valutametode og valutakilde, for eksempel Norges Bank årsgjennomsnitt for samme regnskapsår

Standardregel for kalenderårsregnskap:

- Bruk Norges Banks offisielle valutakurser, årsgjennomsnitt, med NOK som kvoteringsvaluta.
- Lagre kurskilde som egen `SourceCitation` eller som eksplisitt `notes`/underlagskilde i citationen.
- Arkiver JSON/CSV fra Norges Bank API når valutakursen brukes i whitepaper-klare tall.
- Bevar originalverdien i kildevaluta i citation-notat eller eget felt når modellen støtter det.
- Avrund bare etter beregning, og dokumenter om DB-feltet bruker MNOK, hele NOK eller annen enhet.

For avvikende regnskapsår, for eksempel Hagar 2024/25, skal man ikke bruke kalenderår 2024 uten særskilt beslutning. Bruk enten:

- gjennomsnitt for faktisk regnskapsperiode hvis API/metode støtter det, eller
- kildevaluta direkte i rapport/UI inntil korrekt FX-metode er etablert.

Hagar 2024/25-pilot: Norges Bank daglige observasjoner for ISK/NOK 2024-03-01 til 2025-02-28 ble hentet 2026-05-18. Serien hadde 250 observasjoner og ga aritmetisk gjennomsnitt 7.85668 NOK per 100 ISK, dvs. 0.0785668 NOK per 1 ISK. Dette gir ca. 14,168.9 MNOK for Hagar sales 180,342 m.ISK. Serien er arkivert som `research/evidence-pack/fx-rates/norges-bank/EXR-B-ISK-NOK-SP-2024-03-01_2025-02-28-2026-05-18.json`.

Observerte Norges Bank-årsgjennomsnitt for 2024, hentet 2026-05-18:

| Valuta | API-observasjon | Enhet | NOK per 1 |
|---|---:|---|---:|
| SEK | 101.74 | NOK per 100 SEK | 1.0174 |
| DKK | 155.89 | NOK per 100 DKK | 1.5589 |
| EUR | 11.6276 | NOK per 1 EUR | 11.6276 |
| ISK | 7.79 | NOK per 100 ISK | 0.0779 |

## Wayback og lokal arkivering

Wayback- eller annen ekstern arkivlink kreves når:

- kilden er en webside som kan endres uten versjonert PDF eller DOI
- kilden er media, bransjeweb, pressemelding eller organisasjonsside brukt til sentral påstand
- samme URL tidligere har vært ustabil, omdirigert eller blokkert
- kilden inngår i whitepaperet og ikke har stabil offentlig arkivversjon

Wayback er normalt ikke nødvendig når:

- DOI eller annen persistent akademisk identifikator peker til kilden
- lokal PDF/JSON/HTML-kopi med SHA-256 er tilstrekkelig og lisensmessig forsvarlig
- kilden er et internt forskningskonstrukt med dokumentert beslutningsnotat

## Git og rå evidensfiler

Git-repoet skal bære metadata, manifests, tekstuttrekk, URL-er, access dates og SHA-256. Store rådokumenter skal ligge i lokal eller ekstern artifact storage.

Nye PR-er skal ikke legge til:

- `research/**/*.pdf`
- `docs/**/*.pdf`
- `research/evidence-pack/registry-sources/**/documents/**`
- tracked filer på 50 MB eller mer

Guardrail:

```bash
npm run audit:research-artifacts -- --base=origin/main
```

Denne sjekken blokkerer nye råfiler i branch-diffen og tracked filer over størrelsesgrensen, men lar eksisterende legacy-PDFer under grensen forbli inntil egen migrering til artifact storage.

## Legacy-regler

Eksisterende fritekstverdier i `source`-felt kan beholdes midlertidig, men skal klassifiseres og ryddes gradvis.

- `web research`, `manual`, rene domenenavn og registeretiketter uten URL/dato skal flagges.
- `legacy_unsourced` skal være eksplisitt, ikke implisitt fravær av kilde.
- Nye import-scripts skal ikke introdusere nye legacy-kilder.
- Whitepaper-eksport skal feile dersom påstanden bygger på `legacy_unsourced`, `disputed` eller `rejected`.

## Minimum for ny import

Nye importer skal levere:

1. `sourceClass`
2. `citationText`
3. `accessedAt`
4. minst én lokator (`url`, `localPath`, `sourceDocId`, `documentId`)
5. `verificationStatus`, minst `unverified`
6. `fieldPath` når citationen bare gjelder et bestemt felt

Hvis kilden er lokal fil, skal SHA-256 beregnes før den brukes i whitepaper eller som registersnapshot.
````

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

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

